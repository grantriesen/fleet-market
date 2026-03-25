'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Quote,
  Plus,
  Trash2,
  GripVertical,
  Save,
  ArrowLeft,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Briefcase,
  Info,
} from 'lucide-react';

interface Testimonial {
  id: string; // local ephemeral ID for React key / DnD
  quote: string;   // canonical field — also written as "content"
  name: string;
  title: string;   // canonical field — also written as "role" / "rating" alias ignored for title
  company: string; // used by GVI and Corporate Edge
}

interface Site {
  id: string;
  site_name: string;
  slug: string;
  template?: string;
}

const FIELD_KEY = 'testimonials.items';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Build a normalized testimonial from any raw object the DB might contain. */
function normalize(raw: Record<string, string>): Testimonial {
  return {
    id: raw.id || generateId(),
    quote: raw.quote || raw.content || '',
    name: raw.name || '',
    title: raw.title || raw.role || '',
    company: raw.company || '',
  };
}

/** Serialize for storage — write ALL known aliases so every template is happy. */
function serialize(t: Testimonial): Record<string, string> {
  return {
    id: t.id,
    // Primary fields
    quote: t.quote,
    name: t.name,
    title: t.title,
    // Aliases used by Warm Earth / Modern Lawn
    content: t.quote,
    role: t.title,
    // rating alias — templates that use rating expect a number string; keep empty
    rating: '',
    // company used by GVI and Corporate Edge
    company: t.company,
  };
}

export default function TestimonialsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [site, setSite] = useState<Site | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ─── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: siteData, error: siteErr } = await supabase
        .from('sites')
        .select('id, site_name, slug')
        .eq('user_id', user.id)
        .maybeSingle();

      if (siteErr || !siteData) { router.push('/dashboard'); return; }
      setSite(siteData);

      const { data: contentRow } = await supabase
        .from('site_content')
        .select('value')
        .eq('site_id', siteData.id)
        .eq('field_key', FIELD_KEY)
        .maybeSingle();

      if (contentRow?.value) {
        try {
          const parsed = JSON.parse(contentRow.value);
          if (Array.isArray(parsed)) {
            setTestimonials(parsed.map(normalize));
          }
        } catch { /* ignore parse errors — start fresh */ }
      }

      // Seed with 3 empty testimonials if none exist
      if (!contentRow?.value) {
        setTestimonials([
          { id: generateId(), quote: '', name: '', title: '', company: '' },
          { id: generateId(), quote: '', name: '', title: '', company: '' },
          { id: generateId(), quote: '', name: '', title: '', company: '' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  function addTestimonial() {
    setTestimonials(prev => [
      ...prev,
      { id: generateId(), quote: '', name: '', title: '', company: '' },
    ]);
  }

  function removeTestimonial(id: string) {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  }

  function updateField(id: string, field: keyof Omit<Testimonial, 'id'>, value: string) {
    setTestimonials(prev =>
      prev.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...testimonials];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    setTestimonials(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  // ─── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!site) return;
    setSaving(true);
    setSaveStatus('idle');

    try {
      // Strip empty testimonials before saving
      const toSave = testimonials
        .filter(t => t.quote.trim() || t.name.trim())
        .map(serialize);

      const value = JSON.stringify(toSave);

      // Delete existing row then insert fresh — avoids needing a unique constraint
      await supabase
        .from('site_content')
        .delete()
        .eq('site_id', site.id)
        .eq('field_key', FIELD_KEY);

      const { error } = await supabase
        .from('site_content')
        .insert({ site_id: site.id, field_key: FIELD_KEY, value });

      if (error) throw error;
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
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading testimonials…</span>
        </div>
      </div>
    );
  }

  const filledCount = testimonials.filter(t => t.quote.trim() && t.name.trim()).length;

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
              <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center">
                <Quote className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-none">Testimonials</h1>
                <p className="text-xs text-slate-500 mt-0.5">{site?.site_name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <AlertCircle className="w-4 h-4" />
                Save failed
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
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
            <strong className="font-semibold">Testimonials appear on your homepage.</strong>{' '}
            Drag to reorder. Only testimonials with both a quote and a name will be published.
            {filledCount > 0 && (
              <span className="ml-1">
                You have <strong>{filledCount}</strong> ready to publish.
              </span>
            )}
          </div>
        </div>

        {/* Testimonial cards */}
        <div className="space-y-4 mb-6">
          {testimonials.map((t, index) => {
            const isDragging = dragIndex === index;
            const isOver = dragOverIndex === index && dragIndex !== index;
            const isEmpty = !t.quote.trim() && !t.name.trim();

            return (
              <div
                key={t.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDrop={e => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  bg-white rounded-xl border-2 transition-all select-none
                  ${isDragging ? 'opacity-40 scale-95 border-blue-400' : 'opacity-100 scale-100'}
                  ${isOver ? 'border-blue-400 shadow-lg shadow-blue-100' : 'border-slate-200'}
                  ${!isDragging && !isOver ? 'hover:border-slate-300 hover:shadow-sm' : ''}
                `}
              >
                <div className="flex items-start gap-0">
                  {/* Drag handle */}
                  <div className="p-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Number badge */}
                  <div className="pt-4 pr-3 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${isEmpty ? 'bg-slate-100 text-slate-400' : 'bg-pink-100 text-pink-600'}`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 py-4 pr-4 space-y-3">
                    {/* Quote */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        <Quote className="w-3.5 h-3.5" />
                        Quote
                      </label>
                      <textarea
                        value={t.quote}
                        onChange={e => updateField(t.id, 'quote', e.target.value)}
                        placeholder="What did this customer say about your business?"
                        rows={3}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      />
                    </div>

                    {/* Name + Title row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                          <User className="w-3.5 h-3.5" />
                          Name
                        </label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={e => updateField(t.id, 'name', e.target.value)}
                          placeholder="Jane Smith"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          Title / Role
                        </label>
                        <input
                          type="text"
                          value={t.title}
                          onChange={e => updateField(t.id, 'title', e.target.value)}
                          placeholder="Golf Course Manager"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Company
                      </label>
                      <input
                        type="text"
                        value={t.company}
                        onChange={e => updateField(t.id, 'company', e.target.value)}
                        placeholder="Acme Landscaping"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* Star preview */}
                    {t.quote.trim() && (
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">Preview</span>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="pt-4 pr-4 flex-shrink-0">
                    <button
                      onClick={() => removeTestimonial(t.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove testimonial"
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
          onClick={addTestimonial}
          className="w-full py-3.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>

        {/* Bottom save bar */}
        <div className="mt-8 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4">
          <div className="text-sm text-slate-500">
            {filledCount === 0
              ? 'No testimonials ready to publish yet.'
              : `${filledCount} of ${testimonials.length} testimonials will be published.`}
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
