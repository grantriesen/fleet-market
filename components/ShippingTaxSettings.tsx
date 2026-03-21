'use client';
// components/ShippingTaxSettings.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
  Truck, DollarSign, Plus, Trash2, Edit2, Check, X,
  Loader2, Globe, MapPin, Building, Hash, ChevronDown, ChevronUp
} from 'lucide-react';

const FM = { navy: '#1E3A6E', orange: '#E85525' };

interface ShippingZone {
  id?: string;
  label: string;
  zone_type: 'zip' | 'city' | 'state' | 'country' | 'everywhere';
  zone_values: string[];
  rate_type: 'flat' | 'free' | 'per_item' | 'percentage' | 'free_over';
  rate_amount: number;
  per_item_amount?: number;
  min_order_amount?: number;
  estimated_days?: string;
  is_active: boolean;
  display_order?: number;
}

interface TaxRule {
  id?: string;
  label: string;
  rate: number;
  applies_to: 'all' | 'state' | 'zip' | 'city' | 'country';
  scope_values: string[];
  is_active: boolean;
}

const ZONE_TYPE_LABELS: Record<string, string> = {
  everywhere: 'Everywhere',
  country:    'Country',
  state:      'State',
  city:       'City / County',
  zip:        'ZIP Codes',
};

const RATE_TYPE_LABELS: Record<string, string> = {
  free:       'Free Shipping',
  flat:       'Flat Rate',
  per_item:   'Per Item',
  percentage: 'Percentage of Order',
  free_over:  'Free Over Threshold',
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const EMPTY_ZONE: ShippingZone = {
  label: '', zone_type: 'everywhere', zone_values: [],
  rate_type: 'flat', rate_amount: 0, is_active: true,
};

const EMPTY_TAX: TaxRule = {
  label: '', rate: 0, applies_to: 'state', scope_values: [], is_active: true,
};

interface Props { siteId: string; }

export default function ShippingTaxSettings({ siteId }: Props) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'shipping' | 'tax'>('shipping');
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [editingTax, setEditingTax] = useState<TaxRule | null>(null);
  const [zoneForm, setZoneForm] = useState<ShippingZone>({ ...EMPTY_ZONE });
  const [taxForm, setTaxForm] = useState<TaxRule>({ ...EMPTY_TAX });
  const [zoneValuesInput, setZoneValuesInput] = useState('');
  const [taxValuesInput, setTaxValuesInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [siteId]);

  async function loadData() {
    setLoading(true);
    const [{ data: z }, { data: t }] = await Promise.all([
      supabase.from('shipping_zones').select('*').eq('site_id', siteId).order('display_order'),
      supabase.from('tax_rules').select('*').eq('site_id', siteId).order('created_at'),
    ]);
    setZones(z || []);
    setTaxRules(t || []);
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Shipping Zone CRUD ──
  function openAddZone() {
    setEditingZone(null);
    setZoneForm({ ...EMPTY_ZONE });
    setZoneValuesInput('');
    setShowZoneForm(true);
  }

  function openEditZone(zone: ShippingZone) {
    setEditingZone(zone);
    setZoneForm({ ...zone });
    setZoneValuesInput((zone.zone_values || []).join(', '));
    setShowZoneForm(true);
  }

  async function saveZone() {
    if (!zoneForm.label.trim()) return;
    setSaving(true);

    const values = zoneValuesInput
      .split(/[,\n]+/)
      .map(v => v.trim())
      .filter(Boolean);

    const payload = {
      site_id: siteId,
      label: zoneForm.label.trim(),
      zone_type: zoneForm.zone_type,
      zone_values: zoneForm.zone_type === 'everywhere' ? [] : values,
      rate_type: zoneForm.rate_type,
      rate_amount: zoneForm.rate_amount || 0,
      per_item_amount: zoneForm.per_item_amount || null,
      min_order_amount: zoneForm.min_order_amount || null,
      estimated_days: zoneForm.estimated_days || null,
      is_active: zoneForm.is_active,
      display_order: zoneForm.display_order || zones.length,
    };

    if (editingZone?.id) {
      const { error } = await supabase.from('shipping_zones').update(payload).eq('id', editingZone.id);
      if (!error) { showToast('Shipping zone updated'); loadData(); setShowZoneForm(false); }
    } else {
      const { error } = await supabase.from('shipping_zones').insert(payload);
      if (!error) { showToast('Shipping zone added'); loadData(); setShowZoneForm(false); }
    }
    setSaving(false);
  }

  async function deleteZone(id: string) {
    await supabase.from('shipping_zones').delete().eq('id', id);
    showToast('Zone deleted');
    loadData();
  }

  async function toggleZone(zone: ShippingZone) {
    await supabase.from('shipping_zones').update({ is_active: !zone.is_active }).eq('id', zone.id!);
    loadData();
  }

  // ── Tax Rule CRUD ──
  function openAddTax() {
    setEditingTax(null);
    setTaxForm({ ...EMPTY_TAX });
    setTaxValuesInput('');
    setShowTaxForm(true);
  }

  function openEditTax(rule: TaxRule) {
    setEditingTax(rule);
    setTaxForm({ ...rule });
    setTaxValuesInput((rule.scope_values || []).join(', '));
    setShowTaxForm(true);
  }

  async function saveTax() {
    if (!taxForm.label.trim() || !taxForm.rate) return;
    setSaving(true);

    const values = taxValuesInput
      .split(/[,\n]+/)
      .map(v => v.trim())
      .filter(Boolean);

    const payload = {
      site_id: siteId,
      label: taxForm.label.trim(),
      rate: taxForm.rate,
      applies_to: taxForm.applies_to,
      scope_values: taxForm.applies_to === 'all' ? [] : values,
      is_active: taxForm.is_active,
    };

    if (editingTax?.id) {
      const { error } = await supabase.from('tax_rules').update(payload).eq('id', editingTax.id);
      if (!error) { showToast('Tax rule updated'); loadData(); setShowTaxForm(false); }
    } else {
      const { error } = await supabase.from('tax_rules').insert(payload);
      if (!error) { showToast('Tax rule added'); loadData(); setShowTaxForm(false); }
    }
    setSaving(false);
  }

  async function deleteTax(id: string) {
    await supabase.from('tax_rules').delete().eq('id', id);
    showToast('Tax rule deleted');
    loadData();
  }

  async function toggleTax(rule: TaxRule) {
    await supabase.from('tax_rules').update({ is_active: !rule.is_active }).eq('id', rule.id!);
    loadData();
  }

  function zf(field: string, value: any) {
    setZoneForm(prev => ({ ...prev, [field]: value }));
  }

  function tf(field: string, value: any) {
    setTaxForm(prev => ({ ...prev, [field]: value }));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="space-y-0">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'shipping' ? 'border-[#1E3A6E] text-[#1E3A6E]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Truck className="w-4 h-4" /> Shipping Zones
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'tax' ? 'border-[#1E3A6E] text-[#1E3A6E]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <DollarSign className="w-4 h-4" /> Sales Tax
        </button>
      </div>

      {/* ── SHIPPING TAB ── */}
      {activeTab === 'shipping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Define shipping zones and rates. More specific zones (ZIP &gt; City &gt; State &gt; Country) take priority.</p>
            </div>
            <button onClick={openAddZone}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg"
              style={{ background: FM.orange }}>
              <Plus className="w-4 h-4" /> Add Zone
            </button>
          </div>

          {/* Zone Form */}
          {showZoneForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{editingZone ? 'Edit Zone' : 'New Shipping Zone'}</h3>
                <button onClick={() => setShowZoneForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Zone Name *</label>
                  <input value={zoneForm.label} onChange={e => zf('label', e.target.value)}
                    placeholder="e.g. Local Delivery" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Estimated Delivery</label>
                  <input value={zoneForm.estimated_days || ''} onChange={e => zf('estimated_days', e.target.value)}
                    placeholder="e.g. 3-5 business days" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Zone Type</label>
                  <select value={zoneForm.zone_type} onChange={e => zf('zone_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    {Object.entries(ZONE_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Rate Type</label>
                  <select value={zoneForm.rate_type} onChange={e => zf('rate_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    {Object.entries(RATE_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Zone values input */}
              {zoneForm.zone_type !== 'everywhere' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {zoneForm.zone_type === 'state' ? 'State Codes' :
                     zoneForm.zone_type === 'zip' ? 'ZIP Codes' :
                     zoneForm.zone_type === 'city' ? 'Cities' : 'Countries'}
                    {' '}(comma or line separated)
                  </label>
                  {zoneForm.zone_type === 'state' ? (
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-white border border-gray-300 rounded-lg min-h-[60px]">
                        {(zoneValuesInput.split(',').map(v => v.trim()).filter(Boolean)).map(s => (
                          <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {s}
                            <button onClick={() => setZoneValuesInput(prev => prev.split(',').map(v => v.trim()).filter(v => v !== s).join(', '))}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {US_STATES.filter(s => !zoneValuesInput.includes(s)).map(s => (
                          <button key={s} onClick={() => setZoneValuesInput(prev => prev ? prev + ', ' + s : s)}
                            className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 rounded">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <textarea value={zoneValuesInput} onChange={e => setZoneValuesInput(e.target.value)}
                      rows={3} placeholder={
                        zoneForm.zone_type === 'zip' ? '75001, 75002, 75006' :
                        zoneForm.zone_type === 'city' ? 'Dallas, Houston, Austin' : 'US, CA'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                  )}
                </div>
              )}

              {/* Rate amount fields */}
              <div className="grid grid-cols-2 gap-4">
                {zoneForm.rate_type !== 'free' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {zoneForm.rate_type === 'percentage' ? 'Rate (%)' :
                       zoneForm.rate_type === 'free_over' ? 'Flat Rate if Below Threshold ($)' :
                       zoneForm.rate_type === 'per_item' ? 'Base Rate ($)' : 'Rate ($)'}
                    </label>
                    <input type="number" min="0" step="0.01"
                      value={zoneForm.rate_amount || ''} onChange={e => zf('rate_amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    {zoneForm.rate_type === 'per_item' && (
                      <p className="text-xs text-gray-400 mt-1">Optional base charge added once per order.</p>
                    )}
                  </div>
                )}
                {zoneForm.rate_type === 'per_item' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Per Item Rate ($)</label>
                    <input type="number" min="0" step="0.01"
                      value={zoneForm.per_item_amount || ''} onChange={e => zf('per_item_amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <p className="text-xs text-gray-400 mt-1">Charged per item in the order (e.g. $5 × 3 items = $15).</p>
                  </div>
                )}
                {zoneForm.rate_type === 'free_over' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Free Shipping Threshold ($)</label>
                    <input type="number" min="0" step="0.01"
                      value={zoneForm.min_order_amount || ''} onChange={e => zf('min_order_amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <p className="text-xs text-gray-400 mt-1">Orders at or above this amount get free shipping.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={zoneForm.is_active} onChange={e => zf('is_active', e.target.checked)}
                    className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setShowZoneForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={saveZone} disabled={saving || !zoneForm.label}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-lg disabled:opacity-50"
                    style={{ background: FM.navy }}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {editingZone ? 'Update' : 'Add'} Zone
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Zone List */}
          {zones.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600 mb-1">No shipping zones yet</p>
              <p className="text-sm text-gray-400">Add a zone to define where and how you ship.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {zones.map(zone => (
                <div key={zone.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${zone.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: zone.is_active ? '#eff6ff' : '#f9fafb' }}>
                    {zone.zone_type === 'everywhere' ? <Globe className="w-4 h-4 text-blue-600" /> :
                     zone.zone_type === 'zip' ? <Hash className="w-4 h-4 text-blue-600" /> :
                     zone.zone_type === 'city' ? <Building className="w-4 h-4 text-blue-600" /> :
                     <MapPin className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-gray-900">{zone.label}</p>
                      {!zone.is_active && <span className="text-xs text-gray-400 font-medium">Inactive</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {ZONE_TYPE_LABELS[zone.zone_type]}
                      {zone.zone_values?.length > 0 && `: ${zone.zone_values.slice(0, 4).join(', ')}${zone.zone_values.length > 4 ? ` +${zone.zone_values.length - 4} more` : ''}`}
                      {' · '}
                      {RATE_TYPE_LABELS[zone.rate_type]}
                      {zone.rate_type !== 'free' && zone.rate_amount > 0 && (
                        zone.rate_type === 'percentage' ? ` ${zone.rate_amount}%` : ` $${zone.rate_amount.toFixed(2)}`
                      )}
                      {zone.estimated_days && ` · ${zone.estimated_days}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleZone(zone)} className="p-1.5 rounded-lg hover:bg-gray-100 text-xs text-gray-500">
                      {zone.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => openEditZone(zone)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => deleteZone(zone.id!)} className="p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAX TAB ── */}
      {activeTab === 'tax' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Tax rules are applied based on the customer's shipping destination. Multiple rules stack.</p>
            <button onClick={openAddTax}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg"
              style={{ background: FM.orange }}>
              <Plus className="w-4 h-4" /> Add Tax Rule
            </button>
          </div>

          {/* Tax Form */}
          {showTaxForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{editingTax ? 'Edit Tax Rule' : 'New Tax Rule'}</h3>
                <button onClick={() => setShowTaxForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Label *</label>
                  <input value={taxForm.label} onChange={e => tf('label', e.target.value)}
                    placeholder="e.g. Texas State Tax" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tax Rate (%) *</label>
                  <input type="number" min="0" max="100" step="0.001"
                    value={taxForm.rate ? (Number(taxForm.rate) * 100).toFixed(3).replace(/\.?0+$/, '') : ''}
                    onChange={e => tf('rate', parseFloat(e.target.value) / 100 || 0)}
                    placeholder="e.g. 7.25" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <p className="text-xs text-gray-400 mt-1">Enter as percentage, e.g. 5.5 for 5.5%</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Applies To</label>
                <select value={taxForm.applies_to} onChange={e => tf('applies_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                  <option value="all">All Orders</option>
                  <option value="country">Specific Countries</option>
                  <option value="state">Specific States</option>
                  <option value="city">Specific Cities</option>
                  <option value="zip">Specific ZIP Codes</option>
                </select>
              </div>

              {taxForm.applies_to !== 'all' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {taxForm.applies_to === 'state' ? 'State Codes' :
                     taxForm.applies_to === 'zip' ? 'ZIP Codes' :
                     taxForm.applies_to === 'city' ? 'Cities' : 'Country Codes'} (comma separated)
                  </label>
                  {taxForm.applies_to === 'state' ? (
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-white border border-gray-300 rounded-lg min-h-[48px]">
                        {(taxValuesInput.split(',').map(v => v.trim()).filter(Boolean)).map(s => (
                          <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {s}
                            <button onClick={() => setTaxValuesInput(prev => prev.split(',').map(v => v.trim()).filter(v => v !== s).join(', '))}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {US_STATES.filter(s => !taxValuesInput.includes(s)).map(s => (
                          <button key={s} onClick={() => setTaxValuesInput(prev => prev ? prev + ', ' + s : s)}
                            className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 rounded">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <textarea value={taxValuesInput} onChange={e => setTaxValuesInput(e.target.value)}
                      rows={2} placeholder={
                        taxForm.applies_to === 'zip' ? '75001, 75002' :
                        taxForm.applies_to === 'city' ? 'Dallas, Houston' : 'US, CA'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={taxForm.is_active} onChange={e => tf('is_active', e.target.checked)}
                    className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setShowTaxForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={saveTax} disabled={saving || !taxForm.label || !taxForm.rate}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-lg disabled:opacity-50"
                    style={{ background: FM.navy }}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {editingTax ? 'Update' : 'Add'} Rule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tax List */}
          {taxRules.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600 mb-1">No tax rules yet</p>
              <p className="text-sm text-gray-400">Add tax rules to automatically calculate sales tax at checkout.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {taxRules.map(rule => (
                <div key={rule.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${rule.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-gray-900">{rule.label}</p>
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        {(Number(rule.rate) * 100).toFixed(3).replace(/\.?0+$/, '')}%
                      </span>
                      {!rule.is_active && <span className="text-xs text-gray-400 font-medium">Inactive</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {rule.applies_to === 'all' ? 'All orders' :
                        `${rule.applies_to.charAt(0).toUpperCase() + rule.applies_to.slice(1)}: ${(rule.scope_values || []).slice(0, 5).join(', ')}${(rule.scope_values || []).length > 5 ? ` +${rule.scope_values.length - 5} more` : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleTax(rule)} className="p-1.5 rounded-lg hover:bg-gray-100 text-xs text-gray-500">
                      {rule.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => openEditTax(rule)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => deleteTax(rule.id!)} className="p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>Note:</strong> Tax rules are additive — if multiple rules match a destination, all rates are summed. Always verify your tax obligations with a tax professional.
          </div>
        </div>
      )}
    </div>
  );
}
