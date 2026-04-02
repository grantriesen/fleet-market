'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  Users, Search, X, ChevronRight, Package, Clock,
  TrendingUp, Mail, Phone, Globe, Loader2, Download
} from 'lucide-react';

const FM = { navy: '#1E3A6E', orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.1)' };

interface DealerInfo {
  site_id: string;
  site_name: string;
  slug: string;
  tagged_at: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  stockCount: number;
  avgDaysOnLot: number | null;
  avgMargin: number | null;
}

export default function ManufacturerDealersPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerLibraryId, setPartnerLibraryId] = useState<string | null>(null);
  const [dealers, setDealers] = useState<DealerInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'site_name' | 'stockCount' | 'tagged_at'>('site_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('manufacturer_users')
        .select('partner_id, partner:manufacturer_partners(id, name)')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();

      if (!membership) return;
      setPartnerId(membership.partner_id);

      // Get library ID for this partner (to find tags by library ID or partner ID)
      const { data: libEntry } = await supabase
        .from('manufacturer_library')
        .select('id')
        .eq('partner_id', membership.partner_id)
        .maybeSingle();

      setPartnerLibraryId(libEntry?.id || null);

      // Fetch tagged dealers
      let tagQuery = supabase
        .from('dealer_manufacturer_tags')
        .select('site_id, tagged_at, site:sites(id, site_name, slug, user_id)');

      // Match by partner_id OR manufacturer_library_id
      if (libEntry) {
        tagQuery = tagQuery.or(`partner_id.eq.${membership.partner_id},manufacturer_library_id.eq.${libEntry.id}`);
      } else {
        tagQuery = tagQuery.eq('partner_id', membership.partner_id);
      }

      const { data: tags } = await tagQuery;

      if (!tags || tags.length === 0) {
        setDealers([]);
        setLoading(false);
        return;
      }

      // Fetch owner info for each dealer
      const dealerList: DealerInfo[] = [];
      for (const tag of tags) {
        const site = tag.site as any;
        if (!site) continue;

        // Get owner profile
        let ownerName = null;
        let ownerEmail = null;
        let ownerPhone = null;

        if (site.user_id) {
          const { data: profile } = await supabase.auth.admin.getUserById(site.user_id).catch(() => ({ data: null })) as any;
          if (profile?.user) {
            ownerEmail = profile.user.email || null;
            ownerName = profile.user.user_metadata?.full_name || profile.user.user_metadata?.name || null;
            ownerPhone = profile.user.user_metadata?.phone || profile.user.phone || null;
          }
        }

        // Also check site_content for contact info
        const { data: contactContent } = await supabase
          .from('site_content')
          .select('field_key, value')
          .eq('site_id', site.id)
          .in('field_key', ['businessInfo.phone', 'businessInfo.email', 'businessInfo.businessName', 'business.phone', 'business.email', 'business.name']);

        const contentMap: Record<string, string> = {};
        contactContent?.forEach((c: any) => { contentMap[c.field_key] = c.value; });

        // Get stock count for this manufacturer's products at this dealer
        const { count: stockCount } = await supabase
          .from('inventory_items')
          .select('*', { count: 'exact', head: true })
          .eq('site_id', site.id)
          .eq('status', 'available');

        dealerList.push({
          site_id: site.id,
          site_name: contentMap['businessInfo.businessName'] || contentMap['business.name'] || site.site_name || 'Unknown',
          slug: site.slug,
          tagged_at: tag.tagged_at,
          owner_name: ownerName || contentMap['businessInfo.businessName'] || contentMap['business.name'] || null,
          owner_email: ownerEmail || contentMap['businessInfo.email'] || contentMap['business.email'] || null,
          owner_phone: ownerPhone || contentMap['businessInfo.phone'] || contentMap['business.phone'] || null,
          stockCount: stockCount || 0,
          avgDaysOnLot: null,  // TODO: compute from inventory tracking data
          avgMargin: null,     // TODO: compute from inventory tracking data
        });
      }

      setDealers(dealerList);
      setLoading(false);
    }
    load();
  }, []);

  const filteredDealers = dealers
    .filter(d => !searchQuery || d.site_name.toLowerCase().includes(searchQuery.toLowerCase()) || d.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'stockCount') return (a.stockCount - b.stockCount) * dir;
      if (sortField === 'tagged_at') return (new Date(a.tagged_at).getTime() - new Date(b.tagged_at).getTime()) * dir;
      return a.site_name.localeCompare(b.site_name) * dir;
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const headers = ['Dealer Name', 'Email', 'Phone', 'Site URL', 'Stock Count', 'Joined'];
    const rows = filteredDealers.map(d => [
      d.site_name, d.owner_email || '', d.owner_phone || '',
      d.slug ? `${d.slug}.fleetmarket.us` : '', d.stockCount,
      new Date(d.tagged_at).toLocaleDateString(),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dealers-export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dealer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">{dealers.length} dealer{dealers.length !== 1 ? 's' : ''} carrying your products</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="px-5 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dealers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': FM.navy } as any}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dealer List */}
      {filteredDealers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {dealers.length === 0 ? 'No dealers yet' : 'No results'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {dealers.length === 0
              ? 'When dealers select your brand during their Fleet Market signup, they\'ll appear here automatically.'
              : 'Try adjusting your search terms.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left">
                  <button onClick={() => handleSort('site_name')} className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 flex items-center gap-1">
                    Dealer {sortField === 'site_name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</span></th>
                <th className="px-5 py-3 text-left">
                  <button onClick={() => handleSort('stockCount')} className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 flex items-center gap-1">
                    Stock {sortField === 'stockCount' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button onClick={() => handleSort('tagged_at')} className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 flex items-center gap-1">
                    Joined {sortField === 'tagged_at' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filteredDealers.map((d) => (
                <tr key={d.site_id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">{d.site_name}</p>
                    {d.slug && (
                      <a href={`https://${d.slug}.fleetmarket.us`} target="_blank" rel="noopener" className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" /> {d.slug}.fleetmarket.us
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {d.owner_email && (
                      <a href={`mailto:${d.owner_email}`} className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 mb-0.5">
                        <Mail className="w-3 h-3" /> {d.owner_email}
                      </a>
                    )}
                    {d.owner_phone && (
                      <a href={`tel:${d.owner_phone}`} className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {d.owner_phone}
                      </a>
                    )}
                    {!d.owner_email && !d.owner_phone && (
                      <span className="text-xs text-slate-300">No contact info</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-800">{d.stockCount}</span>
                      <span className="text-xs text-slate-400">items</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-500">{new Date(d.tagged_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <a href={`/manufacturer/dealers/${d.site_id}`} className="p-1.5 rounded-md hover:bg-slate-100 inline-flex">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
