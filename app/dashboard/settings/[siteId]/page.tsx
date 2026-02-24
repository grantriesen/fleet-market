'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import IntegrationsSettings from '@/components/IntegrationsSettings';
import InventoryManager from '@/components/InventoryManager';
import ServiceManager from '@/components/ServiceManager';
import RentalManager from '@/components/RentalManager';

type SettingsTab = 'general' | 'integrations' | 'inventory' | 'service' | 'rentals' | 'subscription';

export default function SiteSettingsPage({ params }: { params: { siteId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('basic');

  useEffect(() => {
    loadSiteData();
    // Check if tab was passed in URL (from customizer redirect)
    const tab = searchParams?.get('tab');
    if (tab) {
      setActiveTab(tab as SettingsTab);
    }
  }, []);

  const loadSiteData = async () => {
    try {
      const { data: site } = await supabase
        .from('sites')
        .select('id, site_name, subscription_tier')
        .eq('id', params.siteId)
        .single();

      if (site) {
        setSiteName(site.site_name);
        setSubscriptionTier(site.subscription_tier || 'basic');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading site:', error);
      setLoading(false);
    }
  };

  const handleIntegrationSave = async (category: string, integrationId: string, config: Record<string, string>) => {
    try {
      const { error } = await supabase
        .from('site_integrations')
        .upsert({
          site_id: params.siteId,
          integration_type: category,
          integration_id: integrationId,
          integration_name: integrationId,
          config_json: config,
          is_active: true,
        });

      if (error) throw error;
      alert('Integration saved successfully!');
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Error saving integration');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
            <div>
              <h1 className="text-xl font-bold">{siteName}</h1>
              <p className="text-sm text-gray-500">Settings & Configuration</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/customize/${params.siteId}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            🎨 Edit Design
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Tabs */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'general'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                ⚙️ General
              </button>
              
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                Business Features
              </div>
              
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'integrations'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🔌 Integrations
              </button>
              
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'inventory'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📦 Inventory
              </button>
              
              <button
                onClick={() => setActiveTab('service')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'service'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🔧 Service Requests
              </button>
              
              <button
                onClick={() => setActiveTab('rentals')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'rentals'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🚜 Rentals
              </button>

              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                Account
              </div>

              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'subscription'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                💳 Subscription
              </button>
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {activeTab === 'general' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">General Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Site Name</label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Business Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Business Address</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="123 Main St, City, State 12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="info@yourcompany.com"
                      />
                    </div>

                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-2">Integrations</h2>
                  <p className="text-gray-600 mb-6">
                    Connect your existing business software to automatically sync data
                  </p>

                  <div className="space-y-8">
                    {/* Inventory Integrations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">📦 Inventory Management</h3>
                      <IntegrationsSettings
                        siteId={params.siteId}
                        category="inventory"
                        onSave={(id, config) => handleIntegrationSave('inventory', id, config)}
                      />
                    </div>

                    <div className="border-t pt-8">
                      <h3 className="text-lg font-semibold mb-4">🔧 Service Scheduling</h3>
                      <IntegrationsSettings
                        siteId={params.siteId}
                        category="service"
                        onSave={(id, config) => handleIntegrationSave('service', id, config)}
                      />
                    </div>

                    <div className="border-t pt-8">
                      <h3 className="text-lg font-semibold mb-4">🚜 Rental Management</h3>
                      <IntegrationsSettings
                        siteId={params.siteId}
                        category="rentals"
                        onSave={(id, config) => handleIntegrationSave('rentals', id, config)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-2">Inventory Management</h2>
                  <p className="text-gray-600 mb-6">
                    Manage your equipment inventory
                  </p>
                  <InventoryManager siteId={params.siteId} />
                </div>
              )}

              {activeTab === 'service' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-2">Service Requests</h2>
                  <p className="text-gray-600 mb-6">
                    Manage service appointments and requests
                  </p>
                  <ServiceManager siteId={params.siteId} />
                </div>
              )}

              {activeTab === 'rentals' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-2">Rental Management</h2>
                  <p className="text-gray-600 mb-6">
                    Manage your rental equipment and bookings
                  </p>
                  <RentalManager siteId={params.siteId} />
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Subscription & Billing</h2>
                  
                  <div className="mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-green-900 mb-1">
                            Current Plan: {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
                          </h3>
                          <p className="text-sm text-green-700">
                            {subscriptionTier === 'basic' && 'Includes: Homepage, Manufacturers, Contact'}
                            {subscriptionTier === 'professional' && 'Includes: All Basic + Service Page'}
                            {subscriptionTier === 'enterprise' && 'Includes: All Features + Inventory + Rentals'}
                          </p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-4">Available Plans</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Basic Plan */}
                    <div className="border rounded-lg p-6">
                      <h4 className="font-bold text-lg mb-2">Basic</h4>
                      <div className="text-3xl font-bold mb-4">$200<span className="text-lg text-gray-500">/mo</span></div>
                      <ul className="space-y-2 text-sm mb-6">
                        <li>✓ Custom Website</li>
                        <li>✓ Homepage</li>
                        <li>✓ Manufacturers Page</li>
                        <li>✓ Contact Page</li>
                        <li>✓ Basic Support</li>
                      </ul>
                      <button className="w-full border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
                        Current Plan
                      </button>
                    </div>

                    {/* Professional Plan */}
                    <div className="border-2 border-green-600 rounded-lg p-6 relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Popular
                      </div>
                      <h4 className="font-bold text-lg mb-2">Professional</h4>
                      <div className="text-3xl font-bold mb-4">$350<span className="text-lg text-gray-500">/mo</span></div>
                      <ul className="space-y-2 text-sm mb-6">
                        <li>✓ Everything in Basic</li>
                        <li>✓ Service Scheduling</li>
                        <li>✓ Built-in Management</li>
                        <li>✓ Priority Support</li>
                      </ul>
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
                        Upgrade
                      </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="border rounded-lg p-6">
                      <h4 className="font-bold text-lg mb-2">Enterprise</h4>
                      <div className="text-3xl font-bold mb-4">$600<span className="text-lg text-gray-500">/mo</span></div>
                      <ul className="space-y-2 text-sm mb-6">
                        <li>✓ Everything in Pro</li>
                        <li>✓ Inventory Management</li>
                        <li>✓ Rental Management</li>
                        <li>✓ Advanced Analytics</li>
                        <li>✓ Dedicated Support</li>
                      </ul>
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
