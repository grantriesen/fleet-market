'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save,
  CheckCircle, AlertCircle, Loader2, Star, Globe,
  Info, Building2, ExternalLink, Search, X, Library,
  Check,
} from 'lucide-react';

interface Manufacturer {
  id: string;
  site_id?: string;
  name: string;
  logo_url: string;
  description: string;
  website_url: string;
  display_order: number;
  is_featured: boolean;
  isNew?: boolean;
  isDirty?: boolean;
}

interface LibraryBrand {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  website_url: string;
  logo_url: string | null;
}

interface Site {
  id: string;
  site_name: string;
}

const CATEGORIES = [
  'all', 'outdoor-power', 'commercial-mowers', 'tractors', 'compact-equipment',
  'turf-tools', 'attachments', 'irrigation', 'spreaders-sprayers',
  'pressure-washers', 'generators', 'engines', 'golf-turf',
  'trailers', 'utility-vehicles', 'parts-accessories', 'lawn-care', 'safety',
];
const CATEGORY_LABELS: Record<string, string> = {
  'all':               'All Brands',
  'outdoor-power':     'Outdoor Power',
  'commercial-mowers': 'Commercial Mowers',
  'tractors':          'Tractors',
  'compact-equipment': 'Compact Equipment',
  'turf-tools':        'Turf Tools',
  'attachments':       'Attachments',
  'irrigation':        'Irrigation',
  'spreaders-sprayers':'Spreaders & Sprayers',
  'pressure-washers':  'Pressure Washers',
  'generators':        'Generators',
  'engines':           'Engines',
  'golf-turf':         'Golf & Turf',
  'trailers':          'Trailers',
  'utility-vehicles':  'Utility Vehicles',
  'parts-accessories': 'Parts & Accessories',
  'lawn-care':         'Lawn Care',
  'safety':            'Safety',
};

function generateTempId() {
  return 'new-' + Math.random().toString(36).slice(2, 10);
}

export default function ManufacturersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [saveStatus, setSaveStatus]       = useState<'idle'|'success'|'error'>('idle');
  const [site, setSite]                   = useState<Site | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [deletedIds, setDeletedIds]       = useState<string[]>([]);
  const [dragIndex, setDragIndex]         = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [showLibrary, setShowLibrary]     = useState(false);
  const [library, setLibrary]             = useState<LibraryBrand[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: siteData } = await supabase.from('sites').select('id, site_name').eq('user_id', user.id).maybeSingle();
      if (!siteData) { router.push('/dashboard'); return; }
      setSite(siteData);
      const { data: mfrs } = await supabase.from('manufacturers').select('*').eq('site_id', siteData.id).order('display_order');
      setManufacturers((mfrs || []).map(m => ({ ...m })));
    } finally {
      setLoading(false);
    }
  }

  async function openLibrary() {
    setShowLibrary(true);
    setSelectedSlugs(new Set());
    if (library.length > 0) return;
    setLibraryLoading(true);
    const { data } = await supabase.from('manufacturer_library').select('id, name, slug, category, description, website_url, logo_url').eq('is_active', true).order('name');
    setLibrary(data || []);
    setLibraryLoading(false);
  }

  function addFromLibrary() {
    const toAdd = library.filter(b => selectedSlugs.has(b.slug));
    const existingNames = new Set(manufacturers.map(m => m.name.toLowerCase()));
    const newOnes = toAdd.filter(b => !existingNames.has(b.name.toLowerCase()));
    if (newOnes.length === 0) { setShowLibrary(false); return; }
    const startOrder = manufacturers.length;
    setManufacturers(prev => [
      ...prev,
      ...newOnes.map((b, i) => ({
        id: generateTempId(),
        name: b.name,
        logo_url: b.logo_url || '',
        description: b.description || '',
        website_url: b.website_url || '',
        display_order: startOrder + i,
        is_featured: false,
        isNew: true,
        isDirty: true,
      })),
    ]);
    setShowLibrary(false);
    setSelectedSlugs(new Set());
  }

  function addManufacturer() {
    setManufacturers(prev => [...prev, {
      id: generateTempId(), name: '', logo_url: '', description: '', website_url: '',
      display_order: prev.length, is_featured: false, isNew: true, isDirty: true,
    }]);
  }

  function removeManufacturer(id: string) {
    setManufacturers(prev => prev.filter(m => m.id !== id));
    if (!id.startsWith('new-')) setDeletedIds(prev => [...prev, id]);
  }

  function updateField(id: string, field: keyof Manufacturer, value: any) {
    setManufacturers(prev => prev.map(m => m.id === id ? { ...m, [field]: value, isDirty: true } : m));
  }

  function handleDragStart(index: number) { setDragIndex(index); }
  function handleDragOver(e: React.DragEvent, index: number) { e.preventDefault(); setDragOverIndex(index); }
  function handleDragEnd() { setDragIndex(null); setDragOverIndex(null); }
  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); setDragOverIndex(null); return; }
    const updated = [...manufacturers];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    setManufacturers(updated.map((m, i) => ({ ...m, display_order: i, isDirty: true })));
    setDragIndex(null); setDragOverIndex(null);
  }

  async function handleSave() {
    if (!site) return;
    setSaving(true); setSaveStatus('idle');
    try {
      if (deletedIds.length > 0) {
        const { error } = await supabase.from('manufacturers').delete().in('id', deletedIds);
        if (error) throw error;
      }
      const toUpsert = manufacturers.filter(m => (m.isDirty || m.isNew) && m.name.trim()).map(m => {
        const row: any = { site_id: site.id, name: m.name.trim(), logo_url: m.logo_url || null, description: m.description || null, website_url: m.website_url || null, display_order: m.display_order, is_featured: m.is_featured };
        if (!m.isNew) row.id = m.id;
        return row;
      });
      if (toUpsert.length > 0) {
        const { data: upserted, error } = await supabase.from('manufacturers').upsert(toUpsert, { onConflict: 'id' }).select();
        if (error) throw error;
        if (upserted) {
          let ui = 0;
          setManufacturers(prev => prev.map(m => {
            if (m.isNew && m.name.trim()) { const saved = upserted[ui++]; if (saved) return { ...m, id: saved.id, isNew: false, isDirty: false }; }
            return { ...m, isDirty: false };
          }));
        }
      } else {
        setManufacturers(prev => prev.map(m => ({ ...m, isDirty: false })));
      }
      setDeletedIds([]);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) { console.error(err); setSaveStatus('error'); }
    finally { setSaving(false); }
  }

  const existingNames = new Set(manufacturers.map(m => m.name.toLowerCase()));
  const filteredLibrary = library.filter(b => {
    const matchSearch = !librarySearch || b.name.toLowerCase().includes(librarySearch.toLowerCase()) || (b.description || '').toLowerCase().includes(librarySearch.toLowerCase());
    const matchCat = libraryCategory === 'all' || b.category === libraryCategory;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  const filledCount = manufacturers.filter(m => m.name.trim()).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLibrary(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Brand Library</h2>
                <p className="text-sm text-slate-500">{selectedSlugs.size > 0 ? `${selectedSlugs.size} selected` : 'Select brands to add to your site'}</p>
              </div>
              <button onClick={() => setShowLibrary(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} placeholder="Search brands..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {librarySearch && <button onClick={() => setLibrarySearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
              </div>
              <select value={libraryCategory} onChange={e => setLibraryCategory(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {libraryLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : filteredLibrary.length === 0 ? (
                <div className="text-center py-12 text-slate-400"><Search className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No brands match your search</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredLibrary.map(brand => {
                    const isSelected = selectedSlugs.has(brand.slug);
                    const alreadyAdded = existingNames.has(brand.name.toLowerCase());
                    return (
                      <button key={brand.slug} disabled={alreadyAdded}
                        onClick={() => { if (alreadyAdded) return; setSelectedSlugs(prev => { const next = new Set(prev); if (next.has(brand.slug)) next.delete(brand.slug); else next.add(brand.slug); return next; }); }}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${alreadyAdded ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' : isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${alreadyAdded ? 'border-slate-300 bg-slate-100' : isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                            {(isSelected || alreadyAdded) && <Check className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-slate-800">{brand.name}</p>
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                                {CATEGORY_LABELS[brand.category] || brand.category}
                              </span>
                              {alreadyAdded && <span className="text-xs text-slate-400">Added</span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{brand.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{filteredLibrary.length} brand{filteredLibrary.length !== 1 ? 's' : ''} shown</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLibrary(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={addFromLibrary} disabled={selectedSlugs.size === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />Add {selectedSlugs.size > 0 ? `${selectedSlugs.size} ` : ''}Brand{selectedSlugs.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-purple-600" /></div>
              <div><h1 className="font-bold text-slate-900 leading-none">Manufacturers</h1><p className="text-xs text-slate-500 mt-0.5">{site?.site_name}</p></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === 'success' && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><CheckCircle className="w-4 h-4" /> Saved</span>}
            {saveStatus === 'error' && <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium"><AlertCircle className="w-4 h-4" /> Save failed</span>}
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 mb-6">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong className="font-semibold">Manufacturer logos appear on your homepage and manufacturers page.</strong>{' '}
            Drag to reorder. Only manufacturers with a name will be published.
            {filledCount > 0 && <span className="ml-1"><strong>{filledCount}</strong> ready to publish.</span>}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={openLibrary} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Library className="w-4 h-4" />Browse Brand Library
          </button>
          <button onClick={addManufacturer} className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" />Add Manually
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {manufacturers.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No manufacturers yet</p>
              <p className="text-sm mt-1">Browse the brand library or add manually.</p>
            </div>
          )}
          {manufacturers.map((m, index) => {
            const isDragging = dragIndex === index;
            const isOver = dragOverIndex === index && dragIndex !== index;
            return (
              <div key={m.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={e => handleDragOver(e, index)} onDrop={e => handleDrop(e, index)} onDragEnd={handleDragEnd}
                className={`bg-white rounded-xl border-2 transition-all select-none ${isDragging ? 'opacity-40 scale-95 border-blue-400' : ''} ${isOver ? 'border-blue-400 shadow-lg shadow-blue-100' : 'border-slate-200'} ${!isDragging && !isOver ? 'hover:border-slate-300 hover:shadow-sm' : ''}`}>
                <div className="flex items-start">
                  <div className="p-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"><GripVertical className="w-5 h-5" /></div>
                  <div className="pt-4 pr-3 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${m.name.trim() ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</div>
                  </div>
                  <div className="flex-1 py-4 pr-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Brand Name *</label>
                        <input type="text" value={m.name} onChange={e => updateField(m.id, 'name', e.target.value)} placeholder="e.g. Toro, ECHO, Bobcat" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                      </div>
                      <div className="pt-5 flex-shrink-0">
                        <button onClick={() => updateField(m.id, 'is_featured', !m.is_featured)} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border-2 transition-colors ${m.is_featured ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                          <Star className={`w-3.5 h-3.5 ${m.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />Featured
                        </button>
                      </div>
                    </div>
                    {site && <ImageUpload value={m.logo_url} onChange={url => updateField(m.id, 'logo_url', url)} siteId={site.id} fieldKey={`manufacturer-logo-${m.id}`} label="Logo Image" helpText="Recommended: transparent PNG, 200x80px" />}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Description</label>
                      <textarea value={m.description} onChange={e => updateField(m.id, 'description', e.target.value)} placeholder="Brief description of this brand and your dealership relationship" rows={2} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"><Globe className="w-3.5 h-3.5" />Website URL</label>
                      <div className="flex gap-2 items-center">
                        <input type="url" value={m.website_url} onChange={e => updateField(m.id, 'website_url', e.target.value)} placeholder="https://www.toro.com" className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                        {m.website_url && <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 pr-4 flex-shrink-0">
                    <button onClick={() => removeManufacturer(m.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4">
          <div className="text-sm text-slate-500">
            {filledCount === 0 ? 'No manufacturers ready to publish yet.' : `${filledCount} manufacturer${filledCount !== 1 ? 's' : ''} will appear on your site.`}
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
