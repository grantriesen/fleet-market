'use client';

import { useState } from 'react';
import IntegrationsSettings from './IntegrationsSettings';
import { Plug, Settings, Eye } from 'lucide-react';

type PremiumPageType = 'service' | 'inventory' | 'rentals';

interface PremiumPageEditorProps {
  siteId: string;
  pageType: PremiumPageType;
  onSave: (config: any) => Promise<void>;
}

export default function PremiumPageEditor({ siteId, pageType, onSave }: PremiumPageEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'integration'>('integration');
  const [pageConfig, setPageConfig] = useState({
    enabled: true,
    heading: '',
    description: '',
    integrationId: '',
    integrationConfig: {},
  });

  const pageDetails = {
    service: {
      title: 'Service Scheduling',
      defaultHeading: 'Schedule Service',
      defaultDescription: 'Book an appointment for equipment service and repair',
      icon: '🔧',
    },
    inventory: {
      title: 'Equipment Inventory',
      defaultHeading: 'Browse Our Inventory',
      defaultDescription: 'View our current selection of equipment',
      icon: '🚜',
    },
    rentals: {
      title: 'Equipment Rentals',
      defaultHeading: 'Rent Equipment',
      defaultDescription: 'Flexible rental options for any project size',
      icon: '📦',
    },
  };

  const details = pageDetails[pageType];

  const handleIntegrationSave = async (integrationId: string, config: Record<string, string>) => {
    const updatedConfig = {
      ...pageConfig,
      integrationId,
      integrationConfig: config,
    };
    setPageConfig(updatedConfig);
    await onSave(updatedConfig);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="text-4xl">{details.icon}</div>
        <div>
          <h2 className="text-2xl font-bold">{details.title}</h2>
          <p className="text-gray-600">Configure your {pageType} page</p>
        </div>
      </div>

      {/* Page Visibility Toggle */}
      <div className="bg-white border rounded-lg p-4">
        <label className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Show this page</div>
            <div className="text-sm text-gray-600">Hide this page from your website</div>
          </div>
          <input
            type="checkbox"
            checked={pageConfig.enabled}
            onChange={(e) => setPageConfig({ ...pageConfig, enabled: e.target.checked })}
            className="toggle toggle-lg"
          />
        </label>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('integration')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'integration'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plug className="w-4 h-4" />
              Integration Setup
            </div>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'content'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Page Content
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'integration' && (
        <IntegrationsSettings
          siteId={siteId}
          category={pageType === 'service' ? 'service' : pageType === 'inventory' ? 'inventory' : 'rentals'}
          onSave={handleIntegrationSave}
        />
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Page Heading</label>
            <input
              type="text"
              value={pageConfig.heading || details.defaultHeading}
              onChange={(e) => setPageConfig({ ...pageConfig, heading: e.target.value })}
              placeholder={details.defaultHeading}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Page Description</label>
            <textarea
              value={pageConfig.description || details.defaultDescription}
              onChange={(e) => setPageConfig({ ...pageConfig, description: e.target.value })}
              placeholder={details.defaultDescription}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {pageType === 'rentals' && (
            <div>
              <label className="block text-sm font-medium mb-2">Pricing Note</label>
              <textarea
                placeholder="Daily, weekly, and monthly rates available."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Integration Required</h4>
                <p className="text-sm text-yellow-700">
                  This page will display live data from your connected {pageType} software. 
                  Set up an integration in the "Integration Setup" tab to get started.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Info */}
      {pageConfig.integrationId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              ✓
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Integration Active</h4>
              <p className="text-sm text-green-700">
                Your {pageType} page is connected and ready to display live data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
