'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, Star,
  Building2, Phone, Mail, MapPin, Globe, CheckCircle
} from 'lucide-react';

interface Testimonial {
  id: string;
  // Primary fields (what the manager uses)
  author: string;
  role: string;
  company: string;
  text: string;
  rating: number;
}

export default function SiteSettingsPage({ params }: { params: { siteId: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading]     = useState(true);
  const [site, setSite]           = useState<any>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'testimonials'>('general');

  // General settings state
  const [general, setGeneral] = useState({
    siteName: '',
    businessName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testSaving, setTestSaving]     = useState(false);
  const [testSaved, setTestSaved]       = useState(false);

  useEffect(() => { loadSite(); }, []);

  async function loadSite() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: s } = await supabase
        .from('sites')
        .select('*')
        .eq('id', params.siteId)
        .single();

      if (!s) { router.push('/dashboard'); return; }
      setSite(s);

      // Load content from site_content table
      const { data: contentRows } = await supabase
        .from('site_content')
        .select('field_key, value')
        .eq('site_id', s.id);

      const content: Record<string, string> = {};
      (contentRows || []).forEach((row: any) => { content[row.field_key] = row.value; });

      setGeneral({
        siteName:     s.site_name || '',
        businessName: content['businessInfo.businessName'] || s.site_name || '',
        address:      content['businessInfo.address']      || '',
        phone:        content['businessInfo.phone']        || '',
        email:        content['businessInfo.email']        || '',
        website:      content['businessInfo.website']      || '',
      });

      try {
        const raw = content['testimonials.items'] || '[]';
        const parsed = JSON.parse(raw);
        setTestimonials(parsed.map((t: any, i: number) => ({
          id:      t.id      || String(i),
          author:  t.author  || t.name   || '',
          text:    t.text    || t.quote  || t.content || '',
          role:    t.role    || t.title  || '',
          company: t.company || t.location || '',
          rating:  t.rating  || 5,
        })));
      } catch { setTestimonials([]); }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveGeneral() {
    if (!site) return;
    setSaving(true);
    try {
      // Update site_name on sites table
      const { error: nameError } = await supabase.from('sites')
        .update({ site_name: general.siteName })
        .eq('id', site.id);
      if (nameError) throw nameError;

      // Upsert each content field into site_content table
      const fields: Record<string, string> = {
        'businessInfo.businessName': general.businessName,
        'businessInfo.address':      general.address,
        'businessInfo.phone':        general.phone,
        'businessInfo.email':        general.email,
        'businessInfo.website':      general.website,
      };

      const upserts = Object.entries(fields).map(([field_key, value]) => ({
        site_id: site.id,
        field_key,
        value,
      }));

      const { error: contentError } = await supabase
        .from('site_content')
        .upsert(upserts, { onConflict: 'site_id,field_key' });
      if (contentError) throw contentError;

      setSite((p: any) => ({ ...p, site_name: general.siteName }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function saveTestimonials() {
    if (!site) return;
    setTestSaving(true);
    try {
      // Normalize each testimonial with all field aliases
      const normalized = testimonials.map(({ id, author, role, company, text, rating }) => ({
        id, author, role, company, text, rating,
        name: author, quote: text, content: text, title: role, location: company,
      }));

      const { error: testSaveError } = await supabase
        .from('site_content')
        .upsert({
          site_id: site.id,
          field_key: 'testimonials.items',
          value: JSON.stringify(normalized),
        }, { onConflict: 'site_id,field_key' });
      if (testSaveError) throw testSaveError;

      setTestSaved(true);
      setTimeout(() => setTestSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert('Failed to save testimonials.');
    } finally {
      setTestSaving(false);
    }
  }

  function addTestimonial() {
    setTestimonials(prev => [...prev, {
      id: Date.now().toString(),
      author: '', role: '', company: '', text: '', rating: 5,
    }]);
  }

  function updateTestimonial(id: string, field: keyof Testimonial, value: string | number) {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  function removeTestimonial(id: string) {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  );

  const tabs = [
    { id: 'general',      label: 'General Settings' },
    { id: 'testimonials', label: 'Testimonials' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Settings</h1>
            <p className="text-sm text-slate-500">{site?.site_name}</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-6 flex gap-0 border-t border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── General Settings ── */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-0.5">General Settings</h2>
              <p className="text-sm text-slate-500">This information appears across your dealer website.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={general.siteName}
                    onChange={e => setGeneral(p => ({...p, siteName: e.target.value}))}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                    placeholder="Grant's Equipment" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={general.businessName}
                    onChange={e => setGeneral(p => ({...p, businessName: e.target.value}))}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                    placeholder="Grant's Equipment LLC" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={general.phone}
                    onChange={e => setGeneral(p => ({...p, phone: e.target.value}))}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                    placeholder="(555) 123-4567" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={general.email}
                    onChange={e => setGeneral(p => ({...p, email: e.target.value}))}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                    placeholder="info@yourbusiness.com" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <textarea value={general.address}
                    onChange={e => setGeneral(p => ({...p, address: e.target.value}))}
                    rows={2} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                    placeholder="123 Main St, Blair, NE 68008" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveGeneral}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" /> Saved
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Testimonials ── */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Testimonials</h2>
                <p className="text-sm text-slate-500">Customer reviews shown on your website.</p>
              </div>
              <button
                onClick={addTestimonial}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" /> Add Testimonial
              </button>
            </div>

            {testimonials.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
                <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No testimonials yet</p>
                <p className="text-sm mt-1">Add customer reviews to build trust on your site.</p>
              </div>
            )}

            {testimonials.map((t, idx) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-500">Testimonial {idx + 1}</span>
                  <div className="flex items-center gap-3">
                    {/* Star rating */}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => updateTestimonial(t.id, 'rating', star)}>
                          <Star className={`w-4 h-4 ${star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                    <button onClick={() => removeTestimonial(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <textarea
                    value={t.text}
                    onChange={e => updateTestimonial(t.id, 'text', e.target.value)}
                    rows={3} placeholder="What the customer said..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" value={t.author}
                      onChange={e => updateTestimonial(t.id, 'author', e.target.value)}
                      placeholder="Customer name"
                      className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" value={t.role}
                      onChange={e => updateTestimonial(t.id, 'role', e.target.value)}
                      placeholder="Title / Role"
                      className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" value={t.company}
                      onChange={e => updateTestimonial(t.id, 'company', e.target.value)}
                      placeholder="Company"
                      className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            ))}

            {testimonials.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={saveTestimonials}
                  disabled={testSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50"
                >
                  {testSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Testimonials
                </button>
                {testSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" /> Saved
                  </span>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
