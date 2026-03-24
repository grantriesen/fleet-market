'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Palette, Globe, ExternalLink, Settings,
  Loader2, ChevronRight, Eye, Layout
} from 'lucide-react';

export default function WebsiteManagementPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);

  useEffect(() => { loadSite(); }, []);

  async function loadSite() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: userSite } = await supabase
        .from('sites')
        .select('*, template:templates(name, slug)')
        .eq('user_id', user.id)
        .single();

      if (!userSite) { router.push('/onboarding'); return; }
      setSite(userSite);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  );

  const siteUrl = site?.slug ? `https://${site.slug}.fleetmarket.us` : null;

  const actions = [
    {
      title: 'Open Customizer',
      description: 'Edit colors, fonts, content, and layout with a live preview of your site.',
      icon: Palette,
      color: 'bg-blue-500',
      onClick: () => router.push(`/customize/${site?.id}`),
      primary: true,
    },
    {
      title: 'View Live Site',
      description: siteUrl || 'Your site is being set up.',
      icon: Globe,
      color: 'bg-green-500',
      onClick: () => siteUrl && window.open(siteUrl, '_blank'),
      primary: false,
      external: true,
      disabled: !siteUrl,
    },
    {
      title: 'Preview',
      description: 'See how your site looks without leaving the dashboard.',
      icon: Eye,
      color: 'bg-purple-500',
      onClick: () => window.open(`/preview/${site?.id}`, '_blank'),
      primary: false,
      external: true,
    },
    {
      title: 'Website Settings',
      description: 'Manage your domain, SEO settings, and site configuration.',
      icon: Settings,
      color: 'bg-slate-500',
      onClick: () => router.push(`/dashboard/settings`),
      primary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Website</h1>
            <p className="text-sm text-slate-500">{site?.site_name}</p>
          </div>
          {siteUrl && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              {site?.slug}.fleetmarket.us
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Template info pill */}
        {site?.template?.name && (
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
            <Layout className="w-4 h-4" />
            <span>Template: <span className="font-medium text-slate-700">{site.template.name}</span></span>
          </div>
        )}

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`text-left p-6 rounded-xl border-2 transition-all group disabled:opacity-40 disabled:cursor-not-allowed ${
                  action.primary
                    ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${action.color} w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {action.external && <ExternalLink className="w-4 h-4 text-slate-400 mt-1" />}
                  {!action.external && <ChevronRight className="w-4 h-4 text-slate-400 mt-1 group-hover:translate-x-0.5 transition-transform" />}
                </div>
                <div className="font-semibold text-slate-800 mb-1">{action.title}</div>
                <div className={`text-sm ${action.primary ? 'text-blue-700' : 'text-slate-500'} leading-snug`}>
                  {action.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
