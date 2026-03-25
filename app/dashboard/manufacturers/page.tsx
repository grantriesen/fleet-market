'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save,
  CheckCircle, AlertCircle, Loader2, Star, Globe,
  Info, Building2, ExternalLink,
} from 'lucide-react';

interface Manufacturer {
  id: string;           // uuid from DB, or 'new-xxx' for unsaved
  site_id?: string;
  name: string;
  logo_url: string;
  description: string;
  website_url: string;
  display_order: number;
  is_featured: boolean;
  isNew?: boolean;      // client-only flag
  isDirty?: boolean;    // client-only flag
}

interface Site {
  id: string;
  site_name: string;
}

function generateTempId() {
  return 'new-' + Math.random().toString(36).slice(2, 10);
}

export default function ManufacturersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [site, setSite]             = useState<Site | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [dragIndex, setDragIndex]   = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ─── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: siteData } = await supabase
        .from('sites')
        .select('id, site_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!siteData) { router.push('/dashboard'); return; }
      setSite(siteData);

      const { data: mfrs } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('site_id', siteData.id)
        .order('display_order');

      setManufacturers((mfrs || []).map(m => ({ ...m })));
    } finally {
      setLoading(false);
    }
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  function addManufacturer() {
    const next = manufacturers.length;
    setManufacturers(prev => [
      ...prev,
      {
        id: generateTempId(),
        name: '',
        logo_url: '',
        description: '',
        website_url: '',
        display_order: next,
        is_featured: false,
        isNew: true,
        isDirty: true,
      },
    ]);
  }

  function removeManufacturer(id: string) {
    setManufacturers(prev => prev.filter(m => m.id !== id));
    if (!id.startsWith('new-')) {
      setDeletedIds(prev => [...prev, id]);
    }
  }

  function updateField(id: string, field: keyof Manufacturer, value: any) {
    setManufacturers(prev =>
      prev.map(m => m.id === id ? { ...m, [field]: value, isDirty: true } : m)
    );
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  function handleDragStart(index: number) { setDragIndex(index); }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null); setDragOverIndex(null); return;
    }
    const updated = [...manufacturers];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    // Reassign display_order
    setManufacturers(updated.map((m, i) => ({ ...m, display_order: i, isDirty: true })));
    setDragIndex(null); setDragOverIndex(null);
  }

  function handleDragEnd() { setDragIndex(null); setDragOverIndex(null); }

  // ─── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!site) return;
    setSaving(true);
    setSaveStatus('idle');

    try {
      // 1. Delete removed manufacturers
      if (deletedIds.length > 0) {
        const { error } = await supabase
          .from('manufacturers')
          .delete()
          .in('id', deletedIds);
        if (error) throw error;
      }

      // 2. Upsert all dirty manufacturers
      const toUpsert = manufacturers
        .filter(m => m.isDirty || m.isNew)
        .filter(m => m.name.trim()) // skip empty rows
        .map((m, idx) => {
          const row: any = {
            site_id: site.id,
            name: m.name.trim(),
            logo_url: m.logo_url || null,
            description: m.description || null,
            website_url: m.website_url || null,
            display_order: m.display_order,
            is_featured: m.is_featured,
          };
          if (!m.isNew) row.id = m.id;
          return row;
        });

      if (toUpsert.length > 0) {
        const { data: upserted, error } = await supabase
          .from('manufacturers')
          .upsert(toUpsert, { onConflict: 'id' })
          .select();
        if (error) throw error;

        // Update local IDs for newly inserted rows
        if (upserted) {
          setManufacturers(prev => {
            const updated = [...prev];
            let upsertIdx = 0;
            return updated.map(m => {
              if (m.isNew && m.name.trim()) {
                const saved = upserted[upsertIdx++];
                if (saved) return { ...m, id: saved.id, isNew: false, isDirty: false };
              }
              return { ...m, isDirty: false };
            });
          });
        }
      } else {
        setManufacturers(prev => prev.map(m => ({ ...m, isDirty: false })));
      }

      setDeletedIds([]);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const filledCount = manufacturers.filter(m => m.name.trim()).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-none">Manufacturers</h1>
                <p className="text-xs text-slate-500 mt-0.5">{site?.site_name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <AlertCircle className="w-4 h-4" /> Save failed
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 mb-8">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong className="font-semibold">Manufacturer logos appear on your homepage and manufacturers page.</strong>{' '}
            Drag to reorder. Only manufacturers with a name will be published.
            {filledCount > 0 && <span className="ml-1"><strong>{filledCount}</strong> ready to publish.</span>}
          </div>
        </div>

        {/* Manufacturer cards */}
        <div className="space-y-4 mb-6">
          {manufacturers.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No manufacturers yet</p>
              <p className="text-sm mt-1">Add the brands you're an authorized dealer for.</p>
            </div>
          )}

          {manufacturers.map((m, index) => {
            const isDragging  = dragIndex === index;
            const isOver      = dragOverIndex === index && dragIndex !== index;

            return (
              <div
                key={m.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDrop={e => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  bg-white rounded-xl border-2 transition-all select-none
                  ${isDragging ? 'opacity-40 scale-95 border-blue-400' : 'opacity-100'}
                  ${isOver ? 'border-blue-400 shadow-lg shadow-blue-100' : 'border-slate-200'}
                  ${!isDragging && !isOver ? 'hover:border-slate-300 hover:shadow-sm' : ''}
                `}
              >
                <div className="flex items-start gap-0">
                  {/* Drag handle */}
                  <div className="p-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Number */}
                  <div className="pt-4 pr-3 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${m.name.trim() ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 py-4 pr-4 space-y-4">
                    {/* Row 1: Name + Featured */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                          Brand Name *
                        </label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={e => updateField(m.id, 'name', e.target.value)}
                          placeholder="e.g. Toro, ECHO, Bobcat"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <div className="pt-5 flex-shrink-0">
                        <button
                          onClick={() => updateField(m.id, 'is_featured', !m.is_featured)}
                          title={m.is_featured ? 'Featured' : 'Not featured'}
                          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                            m.is_featured
                              ? 'bg-amber-50 border-amber-300 text-amber-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${m.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                          Featured
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Logo upload */}
                    <div>
                      {site && (
                        <ImageUpload
                          value={m.logo_url}
                          onChange={url => updateField(m.id, 'logo_url', url)}
                          siteId={site.id}
                          fieldKey={`manufacturer-logo-${m.id}`}
                          label="Logo Image"
                          helpText="Recommended: transparent PNG, 200×80px"
                        />
                      )}
                    </div>

                    {/* Row 3: Description */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={m.description}
                        onChange={e => updateField(m.id, 'description', e.target.value)}
                        placeholder="Brief description of this brand and your dealership relationship"
                        rows={2}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      />
                    </div>

                    {/* Row 4: Website URL */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Website URL
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="url"
                          value={m.website_url}
                          onChange={e => updateField(m.id, 'website_url', e.target.value)}
                          placeholder="https://www.toro.com"
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        {m.website_url && (
                          <a
                            href={m.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="pt-4 pr-4 flex-shrink-0">
                    <button
                      onClick={() => removeManufacturer(m.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove manufacturer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add button */}
        <button
          onClick={addManufacturer}
          className="w-full py-3.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Manufacturer
        </button>

        {/* Bottom save bar */}
        <div className="mt-8 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4">
          <div className="text-sm text-slate-500">
            {filledCount === 0
              ? 'No manufacturers ready to publish yet.'
              : `${filledCount} manufacturer${filledCount !== 1 ? 's' : ''} will appear on your site.`}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
