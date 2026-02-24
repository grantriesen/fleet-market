'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Eye, 
  Palette, 
  FileText, 
  Settings,
  Globe,
  Loader2,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react';

export default function WebsiteManagementPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings'>('content');

  useEffect(() => {
    loadSite();
  }, []);

  async function loadSite() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userSite } = await supabase
        .from('sites')
        .select(`
          *,
          template:templates (
            name,
            slug
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (!userSite) {
        router.push('/onboarding');
        return;
      }

      setSite(userSite);
    } catch (error) {
      console.error('Error loading site:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

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
                <h1 className="text-2xl font-bold text-gray-900">My Website</h1>
                <p className="text-sm text-gray-500">{site?.site_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/preview/${site?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </a>
              <button
                onClick={() => router.push(`/customize/${site?.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Open Customizer
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Content Edits</h2>
              <p className="text-gray-600 mb-6">
                For advanced content editing, use the full customizer. Here you can make quick updates to key content.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        defaultValue={site?.site_name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="info@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Hero Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
                      <input
                        type="text"
                        placeholder="Welcome to Your Business"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
                      <textarea
                        rows={3}
                        placeholder="Your tagline or description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
                      <input
                        type="text"
                        placeholder="Get Started"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Edit className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Need More Control?</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Use the full customizer for advanced editing with live preview, custom colors, fonts, and section management.
                  </p>
                  <button
                    onClick={() => router.push(`/customize/${site?.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Open Full Customizer
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Current Template</h3>
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{site?.template?.name}</p>
                    <p className="text-sm text-gray-600 mt-1">Active template</p>
                  </div>
                  <button
                    onClick={() => router.push(`/customize/${site?.id}?tab=template`)}
                    className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Change Template
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Style</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          defaultValue="#2D5016"
                          className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue="#2D5016"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          defaultValue="#F97316"
                          className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue="#F97316"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push(`/customize/${site?.id}?tab=design`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  Open Design Customizer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Website Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Site URL</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={site?.slug}
                      disabled
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <span className="text-gray-500">.siteforge.com</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Contact support to change your site URL
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Publishing</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Site Status</p>
                      <p className="text-sm text-gray-600">
                        {site?.published ? 'Your site is live and visible to visitors' : 'Your site is currently in draft mode'}
                      </p>
                    </div>
                    <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      site?.published
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}>
                      {site?.published ? 'Unpublish' : 'Publish Site'}
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Subscription Plan</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Current Plan</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {site?.subscription_tier} Plan
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Upgrade Plan
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-red-200">
                  <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-left">
                      <p className="font-medium">Reset Website</p>
                      <p className="text-sm text-red-600">Remove all customizations and reset to template defaults</p>
                    </button>
                    <button className="w-full px-4 py-3 border-2 border-red-300 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left">
                      <p className="font-medium">Delete Website</p>
                      <p className="text-sm text-red-600">Permanently delete your website and all data</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
