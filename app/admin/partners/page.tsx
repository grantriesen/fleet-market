'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Users, DollarSign, Link, CheckCircle, AlertCircle, Loader2, Plus, ExternalLink, Settings, X } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  slug: string;
  referral_code: string;
  stripe_account_id: string | null;
  commission_rate: number;
  commission_enabled: boolean;
  early_adopter_slots: number;
  early_adopter_used: number;
  early_adopter_enabled: boolean;
  contact_email: string | null;
  active: boolean;
  created_at: string;
  _referrals?: number;
  _commissions_paid?: number;
  _commissions_pending?: number;
}

const DEFAULT_NEW = { name: '', slug: '', referral_code: '', contact_email: '', early_adopter_slots: 50, commission_rate: 15, commission_enabled: true, early_adopter_enabled: true };

export default function AdminPartnersPage() {
  const supabase = createClient();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Partner>>({});
  const [newPartner, setNewPartner] = useState(DEFAULT_NEW);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadPartners(); }, []);

  async function loadPartners() {
    setLoading(true);
    const { data: partnerData } = await supabase
      .from('manufacturer_partners')
      .select('*')
      .order('created_at');

    if (!partnerData) { setLoading(false); return; }

    const enriched = await Promise.all(partnerData.map(async (p) => {
      const [{ count: referrals }, { data: commissions }] = await Promise.all([
        supabase.from('sites').select('id', { count: 'exact', head: true }).eq('partner_id', p.id),
        supabase.from('partner_commissions').select('commission_cents, status').eq('partner_id', p.id),
      ]);
      const paid    = (commissions || []).filter(c => c.status === 'paid').reduce((s, c) => s + c.commission_cents, 0);
      const pending = (commissions || []).filter(c => c.status === 'pending').reduce((s, c) => s + c.commission_cents, 0);
      return { ...p, _referrals: referrals || 0, _commissions_paid: paid, _commissions_pending: pending };
    }));

    setPartners(enriched);
    setLoading(false);
  }

  function startEdit(partner: Partner) {
    setEditingId(partner.id);
    setEditValues({
      commission_rate:       partner.commission_rate,
      commission_enabled:    partner.commission_enabled ?? true,
      early_adopter_slots:   partner.early_adopter_slots,
      early_adopter_enabled: partner.early_adopter_enabled ?? true,
      contact_email:         partner.contact_email || '',
    });
  }

  async function saveEdit(partnerId: string) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('manufacturer_partners')
        .update({
          commission_rate:       Number(editValues.commission_rate) / 100,
          commission_enabled:    editValues.commission_enabled,
          early_adopter_slots:   Number(editValues.early_adopter_slots),
          early_adopter_enabled: editValues.early_adopter_enabled,
          contact_email:         editValues.contact_email || null,
        })
        .eq('id', partnerId);
      if (error) throw error;
      setToast('Partner updated!');
      setEditingId(null);
      loadPartners();
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectStripe(partnerId: string) {
    setConnecting(partnerId);
    try {
      const res = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.open(data.url, '_blank');
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    } finally {
      setConnecting(null);
    }
  }

  async function handleAddPartner() {
    if (!newPartner.name || !newPartner.slug || !newPartner.referral_code) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('manufacturer_partners').insert({
        name:                  newPartner.name,
        slug:                  newPartner.slug.toLowerCase().replace(/\s+/g, '-'),
        referral_code:         newPartner.referral_code.toUpperCase(),
        contact_email:         newPartner.contact_email || null,
        early_adopter_slots:   Number(newPartner.early_adopter_slots),
        commission_rate:       Number(newPartner.commission_rate) / 100,
        commission_enabled:    newPartner.commission_enabled,
        early_adopter_enabled: newPartner.early_adopter_enabled,
      });
      if (error) throw error;
      setToast('Partner added!');
      setShowAdd(false);
      setNewPartner(DEFAULT_NEW);
      loadPartners();
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const totalPaid      = partners.reduce((s, p) => s + (p._commissions_paid    || 0), 0);
  const totalPending   = partners.reduce((s, p) => s + (p._commissions_pending || 0), 0);
  const totalReferrals = partners.reduce((s, p) => s + (p._referrals           || 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Manufacturer Partners</h1>
            <p className="text-slate-400 mt-1">Referral codes, early adopter slots, and commission payouts</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors">
            <Plus className="w-4 h-4" /> Add Partner
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 flex justify-between">
            {toast}
            <button onClick={() => setToast('')} className="text-slate-500 hover:text-white">✕</button>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Referrals',       value: totalReferrals,                          icon: Users,        color: 'text-blue-400'    },
            { label: 'Commissions Paid',       value: `$${(totalPaid    / 100).toFixed(2)}`,  icon: CheckCircle,  color: 'text-emerald-400' },
            { label: 'Commissions Pending',    value: `$${(totalPending / 100).toFixed(2)}`,  icon: DollarSign,   color: 'text-yellow-400'  },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                <Icon className={`w-8 h-8 ${stat.color} flex-shrink-0`} />
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Partners — card layout for easier editing */}
        <div className="space-y-4">
          {partners.map(partner => {
            const isEditing = editingId === partner.id;
            const commissionEnabled    = isEditing ? editValues.commission_enabled    : (partner.commission_enabled    ?? true);
            const earlyAdopterEnabled  = isEditing ? editValues.early_adopter_enabled : (partner.early_adopter_enabled ?? true);

            return (
              <div key={partner.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  {/* Left: identity */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{partner.name}</h3>
                      {!partner.active && <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs text-emerald-400 font-mono">
                        {partner.referral_code}
                      </code>
                      <button onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${partner.referral_code}`);
                        setToast('Link copied!');
                      }} className="text-slate-500 hover:text-white transition-colors">
                        <Link className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => window.open(`${window.location.origin}/register?ref=${partner.referral_code}`, '_blank')}
                        className="text-slate-500 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      {isEditing && (
                        <input
                          type="text"
                          value={editValues.contact_email || ''}
                          onChange={e => setEditValues(v => ({ ...v, contact_email: e.target.value }))}
                          placeholder="contact@partner.com"
                          className="ml-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      )}
                      {!isEditing && partner.contact_email && (
                        <span className="text-xs text-slate-500">{partner.contact_email}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: edit / save buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(partner.id)} disabled={saving}
                          className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors">
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 border border-slate-700 text-slate-400 text-xs rounded-lg hover:border-slate-500 hover:text-white transition-colors">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(partner)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 text-xs font-medium rounded-lg hover:border-slate-500 hover:text-white transition-colors">
                        <Settings className="w-3 h-3" /> Configure
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Referrals</div>
                    <div className="text-lg font-bold text-white">{partner._referrals}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Paid Out</div>
                    <div className="text-lg font-bold text-emerald-400">${((partner._commissions_paid || 0) / 100).toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Pending</div>
                    <div className="text-lg font-bold text-yellow-400">${((partner._commissions_pending || 0) / 100).toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Stripe</div>
                    {partner.stripe_account_id ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <button onClick={() => handleConnectStripe(partner.id)} disabled={connecting === partner.id}
                        className="mt-0.5 text-xs px-2 py-1 bg-[#E8472F] text-white font-semibold rounded hover:bg-[#d13d25] disabled:opacity-50 transition-colors flex items-center gap-1">
                        {connecting === partner.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {/* Config row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Commission config */}
                  <div className={`rounded-xl p-4 border ${commissionEnabled ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-white">Commission</span>
                      {isEditing ? (
                        <button
                          onClick={() => setEditValues(v => ({ ...v, commission_enabled: !v.commission_enabled }))}
                          className={`relative w-10 h-5 rounded-full transition-colors ${editValues.commission_enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${editValues.commission_enabled ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${commissionEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                          {commissionEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Rate:</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number" min="0" max="100" step="1"
                            value={editValues.commission_rate !== undefined ? Math.round(Number(editValues.commission_rate) * 100) : Math.round(partner.commission_rate * 100)}
                            onChange={e => setEditValues(v => ({ ...v, commission_rate: Number(e.target.value) }))}
                            className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-white">{Math.round((partner.commission_rate || 0.15) * 100)}%</span>
                      )}
                      <span className="text-xs text-slate-500">of invoice subtotal</span>
                    </div>
                  </div>

                  {/* Early adopter config */}
                  <div className={`rounded-xl p-4 border ${earlyAdopterEnabled ? 'border-blue-500/20 bg-blue-500/5' : 'border-slate-700 bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-white">Early Adopter Promo</span>
                      {isEditing ? (
                        <button
                          onClick={() => setEditValues(v => ({ ...v, early_adopter_enabled: !v.early_adopter_enabled }))}
                          className={`relative w-10 h-5 rounded-full transition-colors ${editValues.early_adopter_enabled ? 'bg-blue-500' : 'bg-slate-600'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${editValues.early_adopter_enabled ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${earlyAdopterEnabled ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                          {earlyAdopterEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Slots:</span>
                      {isEditing ? (
                        <input
                          type="number" min="0" max="500"
                          value={editValues.early_adopter_slots ?? partner.early_adopter_slots}
                          onChange={e => setEditValues(v => ({ ...v, early_adopter_slots: Number(e.target.value) }))}
                          className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-sm font-bold text-white">{partner.early_adopter_used} / {partner.early_adopter_slots}</span>
                      )}
                      {!isEditing && (
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-[60px]">
                          <div className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (partner.early_adopter_used / partner.early_adopter_slots) * 100)}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add partner modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Partner</h2>
                <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Company Name',   key: 'name',           placeholder: 'Harper Industries',       type: 'text'   },
                  { label: 'Slug',           key: 'slug',           placeholder: 'harper',                  type: 'text'   },
                  { label: 'Referral Code',  key: 'referral_code',  placeholder: 'HARPER2026',              type: 'text'   },
                  { label: 'Contact Email',  key: 'contact_email',  placeholder: 'partner@company.com',     type: 'email'  },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
                    <input type={field.type}
                      value={newPartner[field.key as keyof typeof newPartner] as string}
                      onChange={e => setNewPartner(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm" />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Early Adopter Slots</label>
                    <input type="number" min="0" max="500"
                      value={newPartner.early_adopter_slots}
                      onChange={e => setNewPartner(prev => ({ ...prev, early_adopter_slots: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Commission Rate %</label>
                    <input type="number" min="0" max="100" step="1"
                      value={newPartner.commission_rate}
                      onChange={e => setNewPartner(prev => ({ ...prev, commission_rate: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
                    <span className="text-sm text-slate-300">Commission</span>
                    <button onClick={() => setNewPartner(prev => ({ ...prev, commission_enabled: !prev.commission_enabled }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${newPartner.commission_enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${newPartner.commission_enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
                    <span className="text-sm text-slate-300">Early Adopter</span>
                    <button onClick={() => setNewPartner(prev => ({ ...prev, early_adopter_enabled: !prev.early_adopter_enabled }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${newPartner.early_adopter_enabled ? 'bg-blue-500' : 'bg-slate-600'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${newPartner.early_adopter_enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleAddPartner} disabled={saving}
                  className="flex-1 py-3 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Add Partner'}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-6 py-3 border border-slate-700 text-slate-400 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
