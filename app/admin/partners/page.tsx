'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Users, DollarSign, Link, CheckCircle, AlertCircle, Loader2, Plus, ExternalLink } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  slug: string;
  referral_code: string;
  stripe_account_id: string | null;
  commission_rate: number;
  early_adopter_slots: number;
  early_adopter_used: number;
  contact_email: string | null;
  active: boolean;
  created_at: string;
  _referrals?: number;
  _commissions_paid?: number;
  _commissions_pending?: number;
}

export default function AdminPartnersPage() {
  const supabase = createClient();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', slug: '', referral_code: '', contact_email: '' });
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

    // Enrich with commission and referral stats
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
        name:          newPartner.name,
        slug:          newPartner.slug.toLowerCase().replace(/\s+/g, '-'),
        referral_code: newPartner.referral_code.toUpperCase(),
        contact_email: newPartner.contact_email || null,
      });
      if (error) throw error;
      setToast('Partner added!');
      setShowAdd(false);
      setNewPartner({ name: '', slug: '', referral_code: '', contact_email: '' });
      loadPartners();
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const totalPaid    = partners.reduce((s, p) => s + (p._commissions_paid    || 0), 0);
  const totalPending = partners.reduce((s, p) => s + (p._commissions_pending || 0), 0);
  const totalReferrals = partners.reduce((s, p) => s + (p._referrals || 0), 0);

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
            { label: 'Total Referrals', value: totalReferrals, icon: Users, color: 'text-blue-400' },
            { label: 'Commissions Paid', value: `$${(totalPaid / 100).toFixed(2)}`, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Commissions Pending', value: `$${(totalPending / 100).toFixed(2)}`, icon: DollarSign, color: 'text-yellow-400' },
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

        {/* Partners table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Partner', 'Referral Code', 'Early Adopter Slots', 'Referrals', 'Paid Out', 'Pending', 'Stripe', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {partners.map(partner => (
                <tr key={partner.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{partner.name}</div>
                    <div className="text-xs text-slate-500">{partner.contact_email || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs text-emerald-400 font-mono">
                        {partner.referral_code}
                      </code>
                      <button onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${partner.referral_code}`);
                        setToast('Link copied!');
                      }} className="text-slate-500 hover:text-white transition-colors">
                        <Link className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-medium">
                        {partner.early_adopter_used} / {partner.early_adopter_slots}
                      </div>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-16">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${(partner.early_adopter_used / partner.early_adopter_slots) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{partner._referrals}</td>
                  <td className="px-6 py-4 text-emerald-400 font-medium">
                    ${((partner._commissions_paid || 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-medium">
                    ${((partner._commissions_pending || 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {partner.stripe_account_id ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5" /> Not connected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!partner.stripe_account_id && (
                        <button
                          onClick={() => handleConnectStripe(partner.id)}
                          disabled={connecting === partner.id}
                          className="text-xs px-3 py-1.5 bg-[#E8472F] text-white font-semibold rounded-lg hover:bg-[#d13d25] disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          {connecting === partner.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Connect Stripe
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`${window.location.origin}/register?ref=${partner.referral_code}`, '_blank')}
                        className="text-xs px-3 py-1.5 border border-slate-700 text-slate-400 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Preview Link
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add partner modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-6">Add Partner</h2>
              <div className="space-y-4">
                {[
                  { label: 'Company Name', key: 'name', placeholder: 'Harper Industries' },
                  { label: 'Slug', key: 'slug', placeholder: 'harper' },
                  { label: 'Referral Code', key: 'referral_code', placeholder: 'HARPER2026' },
                  { label: 'Contact Email', key: 'contact_email', placeholder: 'partner@company.com' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      value={newPartner[field.key as keyof typeof newPartner]}
                      onChange={e => setNewPartner(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                ))}
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
