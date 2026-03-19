'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  User,
  Phone,
  Calendar,
  Download,
  Search,
  Filter,
  Loader2,
  Tag,
  MessageSquare,
  Wrench,
  Truck
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  message?: string;
  tags?: string[];
  created_at: string;
}

// Source values written by /api/submit-form
const SOURCE_LABELS: Record<string, string> = {
  contact_form: 'Contact Form',
  quote_request: 'Service / Rental',
  newsletter: 'Newsletter',
};

const SOURCE_COLORS: Record<string, string> = {
  contact_form: 'bg-blue-100 text-blue-800',
  quote_request: 'bg-orange-100 text-orange-800',
  newsletter: 'bg-purple-100 text-purple-800',
};

export default function LeadsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchQuery, sourceFilter, leads]);

  async function loadLeads() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userSite } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!userSite) {
        router.push('/onboarding');
        return;
      }

      setSite(userSite);

      const { data: leadData, error } = await supabase
        .from('lead_captures')
        .select('*')
        .eq('site_id', userSite.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead_captures:', error);
      }

      const realLeads = (leadData || []).map((l: any) => ({
        id: l.id,
        name: l.name || l.customer_name || 'Unknown',
        email: l.email || l.customer_email || '',
        phone: l.phone || l.customer_phone || '',
        source: l.source || 'contact_form',
        message: l.message || '',
        tags: l.tags || [],
        created_at: l.created_at,
      }));

      setLeads(realLeads);
      setFilteredLeads(realLeads);
      
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterLeads() {
    let filtered = [...leads];

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      );
    }

    setFilteredLeads(filtered);
  }

  function exportToCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Tags', 'Message', 'Date'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      SOURCE_LABELS[lead.source] ?? lead.source,
      (lead.tags || []).join('; '),
      lead.message || '',
      new Date(lead.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const contactCount   = leads.filter(l => l.source === 'contact_form').length;
  const quoteCount     = leads.filter(l => l.source === 'quote_request').length;
  const newsletterCount = leads.filter(l => l.source === 'newsletter').length;
  const thisWeekCount  = leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads & Contacts</h1>
                <p className="text-sm text-gray-500">{site?.site_name}</p>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Contact Forms</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{contactCount}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Service / Rental</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{quoteCount}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{thisWeekCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Sources ({leads.length})</option>
                <option value="contact_form">Contact Form ({contactCount})</option>
                <option value="quote_request">Service / Rental ({quoteCount})</option>
                <option value="newsletter">Newsletter ({newsletterCount})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600">
              {searchQuery || sourceFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Leads will appear here when visitors submit forms on your site'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-full">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lead.name}</p>
                            <div className="flex flex-col gap-1 mt-1">
                              {lead.email && (
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <a href={`mailto:${lead.email}`} className="hover:text-green-600 transition-colors">
                                    {lead.email}
                                  </a>
                                </p>
                              )}
                              {lead.phone && (
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <a href={`tel:${lead.phone}`} className="hover:text-green-600 transition-colors">
                                    {lead.phone}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[lead.source] ?? 'bg-gray-100 text-gray-700'}`}>
                          {SOURCE_LABELS[lead.source] ?? lead.source.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {lead.message || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {lead.tags && lead.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {lead.tags.map((tag, index) => (
                              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Automatic Lead Capture</h3>
              <p className="text-sm text-blue-700">
                Every contact, service, and rental form submission on your live site is saved here automatically. 
                You'll also receive an email notification for each new submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
