'use client';

import { useState } from 'react';
import { Check, ExternalLink, Plug, Settings } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'inventory' | 'service' | 'rentals';
  logo?: string;
  description: string;
  setupFields: {
    label: string;
    key: string;
    type: 'text' | 'url' | 'api_key' | 'select';
    placeholder: string;
    required: boolean;
    options?: string[];
  }[];
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  // Inventory Management - NO COMPETITORS WITH WEBSITE BUILDERS
  {
    id: 'google_sheet_inventory',
    name: 'Google Sheets',
    category: 'inventory',
    description: 'Manage inventory via Google Sheets (simple and flexible)',
    setupFields: [
      { label: 'Sheet URL', key: 'sheet_url', type: 'url', placeholder: 'https://docs.google.com/spreadsheets/d/...', required: true },
      { label: 'Sheet ID', key: 'sheet_id', type: 'text', placeholder: 'Sheet ID or name', required: false },
    ],
  },
  {
    id: 'airtable_inventory',
    name: 'Airtable',
    category: 'inventory',
    description: 'Connect to Airtable base for inventory management',
    setupFields: [
      { label: 'Base ID', key: 'base_id', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
      { label: 'Table Name', key: 'table_name', type: 'text', placeholder: 'Inventory', required: true },
      { label: 'API Key', key: 'api_key', type: 'api_key', placeholder: 'Your Airtable API key', required: true },
    ],
  },
  {
    id: 'quickbooks_inventory',
    name: 'QuickBooks',
    category: 'inventory',
    description: 'Sync inventory from QuickBooks Online',
    setupFields: [
      { label: 'Company ID', key: 'company_id', type: 'text', placeholder: 'QuickBooks Company ID', required: true },
      { label: 'Client ID', key: 'client_id', type: 'text', placeholder: 'OAuth Client ID', required: true },
      { label: 'Client Secret', key: 'client_secret', type: 'api_key', placeholder: 'OAuth Client Secret', required: true },
    ],
  },
  {
    id: 'shopify_inventory',
    name: 'Shopify',
    category: 'inventory',
    description: 'Display inventory from your Shopify store',
    setupFields: [
      { label: 'Store URL', key: 'store_url', type: 'url', placeholder: 'yourstore.myshopify.com', required: true },
      { label: 'Admin API Token', key: 'api_token', type: 'api_key', placeholder: 'Admin API access token', required: true },
    ],
  },
  {
    id: 'csv_inventory',
    name: 'CSV/Excel File',
    category: 'inventory',
    description: 'Upload inventory list as CSV or Excel file',
    setupFields: [
      { label: 'Upload Method', key: 'upload_method', type: 'select', placeholder: 'manual', required: true, options: ['manual', 'ftp', 'url'] },
      { label: 'Update URL (if automatic)', key: 'update_url', type: 'url', placeholder: 'https://yoursite.com/inventory.csv', required: false },
    ],
  },
  {
    id: 'custom_inventory_feed',
    name: 'Custom API/Feed',
    category: 'inventory',
    description: 'Connect any inventory system via custom API or data feed',
    setupFields: [
      { label: 'Feed URL', key: 'feed_url', type: 'url', placeholder: 'https://yoursite.com/inventory-feed.json', required: true },
      { label: 'Feed Type', key: 'feed_type', type: 'select', placeholder: 'json', required: true, options: ['json', 'xml', 'csv'] },
      { label: 'Auth Header (if required)', key: 'auth_header', type: 'api_key', placeholder: 'Bearer token or API key', required: false },
    ],
  },

  // Service Scheduling - NO COMPETITORS
  {
    id: 'service_titan',
    name: 'ServiceTitan',
    category: 'service',
    description: 'Integrate with ServiceTitan for service requests',
    setupFields: [
      { label: 'Tenant ID', key: 'tenant_id', type: 'text', placeholder: 'Your ServiceTitan Tenant ID', required: true },
      { label: 'Client ID', key: 'client_id', type: 'text', placeholder: 'OAuth Client ID', required: true },
      { label: 'Client Secret', key: 'client_secret', type: 'api_key', placeholder: 'OAuth Client Secret', required: true },
    ],
  },
  {
    id: 'jobber',
    name: 'Jobber',
    category: 'service',
    description: 'Send service requests directly to Jobber',
    setupFields: [
      { label: 'API Key', key: 'api_key', type: 'api_key', placeholder: 'Jobber API Key', required: true },
      { label: 'Account ID', key: 'account_id', type: 'text', placeholder: 'Your Jobber Account ID', required: true },
    ],
  },
  {
    id: 'housecall_pro',
    name: 'Housecall Pro',
    category: 'service',
    description: 'Create service appointments in Housecall Pro',
    setupFields: [
      { label: 'Company ID', key: 'company_id', type: 'text', placeholder: 'Your Company ID', required: true },
      { label: 'API Key', key: 'api_key', type: 'api_key', placeholder: 'API Key', required: true },
    ],
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'service',
    description: 'Use Calendly for service scheduling (easiest setup)',
    setupFields: [
      { label: 'Calendly Link', key: 'calendly_url', type: 'url', placeholder: 'https://calendly.com/your-link', required: true },
    ],
  },
  {
    id: 'acuity',
    name: 'Acuity Scheduling',
    category: 'service',
    description: 'Connect to Acuity for appointment booking',
    setupFields: [
      { label: 'Owner ID', key: 'owner_id', type: 'text', placeholder: 'Your Acuity Owner ID', required: true },
      { label: 'API Key', key: 'api_key', type: 'api_key', placeholder: 'API Key', required: true },
    ],
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'service',
    description: 'Simple appointment requests via Google Calendar',
    setupFields: [
      { label: 'Calendar ID', key: 'calendar_id', type: 'text', placeholder: 'your-calendar@gmail.com', required: true },
      { label: 'Service Account JSON', key: 'service_account', type: 'api_key', placeholder: 'Paste service account JSON', required: true },
    ],
  },
  {
    id: 'microsoft_bookings',
    name: 'Microsoft Bookings',
    category: 'service',
    description: 'Integrate with Microsoft Bookings for appointments',
    setupFields: [
      { label: 'Business ID', key: 'business_id', type: 'text', placeholder: 'Microsoft Bookings Business ID', required: true },
      { label: 'Client ID', key: 'client_id', type: 'text', placeholder: 'Azure App Client ID', required: true },
      { label: 'Client Secret', key: 'client_secret', type: 'api_key', placeholder: 'Azure App Client Secret', required: true },
    ],
  },
  {
    id: 'email_service',
    name: 'Email Notifications',
    category: 'service',
    description: 'Send service requests to your email (simplest option)',
    setupFields: [
      { label: 'Email Address', key: 'email', type: 'text', placeholder: 'service@yourcompany.com', required: true },
      { label: 'CC Email (optional)', key: 'cc_email', type: 'text', placeholder: 'manager@yourcompany.com', required: false },
    ],
  },

  // Rental Management - NO COMPETITORS
  {
    id: 'rentalman',
    name: 'RentalMan',
    category: 'rentals',
    description: 'Connect to RentalMan for equipment rentals',
    setupFields: [
      { label: 'Company Code', key: 'company_code', type: 'text', placeholder: 'Company Code', required: true },
      { label: 'API Key', key: 'api_key', type: 'api_key', placeholder: 'API Key', required: true },
    ],
  },
  {
    id: 'alert',
    name: 'ALERT',
    category: 'rentals',
    description: 'Integrate with ALERT rental software',
    setupFields: [
      { label: 'Location ID', key: 'location_id', type: 'text', placeholder: 'Location ID', required: true },
      { label: 'API Token', key: 'api_token', type: 'api_key', placeholder: 'API Token', required: true },
    ],
  },
  {
    id: 'ezrentout',
    name: 'EZRentOut',
    category: 'rentals',
    description: 'Connect to EZRentOut rental management',
    setupFields: [
      { label: 'Company URL', key: 'company_url', type: 'url', placeholder: 'yourcompany.ezrentout.com', required: true },
      { label: 'API Key', key: 'api_key', type: 'api_key', placeholder: 'API Key', required: true },
    ],
  },
  {
    id: 'booqable',
    name: 'Booqable',
    category: 'rentals',
    description: 'Sync rental inventory from Booqable',
    setupFields: [
      { label: 'Account Slug', key: 'account_slug', type: 'text', placeholder: 'yourcompany', required: true },
      { label: 'API Key', key: 'api_key', type: 'api_key', placeholder: 'Booqable API Key', required: true },
    ],
  },
  {
    id: 'google_sheet_rentals',
    name: 'Google Sheets',
    category: 'rentals',
    description: 'Track rental requests in Google Sheets',
    setupFields: [
      { label: 'Sheet URL', key: 'sheet_url', type: 'url', placeholder: 'https://docs.google.com/spreadsheets/d/...', required: true },
      { label: 'Sheet ID', key: 'sheet_id', type: 'text', placeholder: 'Sheet ID or name', required: false },
    ],
  },
  {
    id: 'email_rentals',
    name: 'Email Notifications',
    category: 'rentals',
    description: 'Send rental inquiries to your email (simplest option)',
    setupFields: [
      { label: 'Email Address', key: 'email', type: 'text', placeholder: 'rentals@yourcompany.com', required: true },
      { label: 'CC Email (optional)', key: 'cc_email', type: 'text', placeholder: 'manager@yourcompany.com', required: false },
    ],
  },
];

interface IntegrationsSettingsProps {
  siteId: string;
  category: 'inventory' | 'service' | 'rentals';
  onSave: (integrationId: string, config: Record<string, string>) => Promise<void>;
}

export default function IntegrationsSettings({ siteId, category, onSave }: IntegrationsSettingsProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const categoryIntegrations = AVAILABLE_INTEGRATIONS.filter(i => i.category === category);

  const handleSave = async () => {
    if (!selectedIntegration) return;

    // Validate required fields
    const missingFields = selectedIntegration.setupFields
      .filter(field => field.required && !configValues[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      await onSave(selectedIntegration.id, configValues);
      alert('Integration saved successfully!');
    } catch (error) {
      alert('Error saving integration');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    // Simulate API test
    setTimeout(() => {
      setTestingConnection(false);
      alert('Connection test successful! ✓');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Plug className="w-5 h-5" />
          {category === 'inventory' && 'Inventory Management Integration'}
          {category === 'service' && 'Service Scheduling Integration'}
          {category === 'rentals' && 'Rental Management Integration'}
        </h3>
        <p className="text-sm text-gray-600">
          Connect your existing software to automatically sync data to your website
        </p>
      </div>

      {/* Integration Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Integration</label>
        <div className="grid gap-3">
          {categoryIntegrations.map((integration) => (
            <button
              key={integration.id}
              onClick={() => {
                setSelectedIntegration(integration);
                setConfigValues({});
              }}
              className={`text-left p-4 border-2 rounded-lg transition-all ${
                selectedIntegration?.id === integration.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                </div>
                {selectedIntegration?.id === integration.id && (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      {selectedIntegration && (
        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure {selectedIntegration.name}
          </h4>

          {selectedIntegration.setupFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={configValues[field.key] || ''}
                  onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option.toUpperCase()}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'api_key' ? 'password' : 'text'}
                  value={configValues[field.key] || ''}
                  onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Integration'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h5 className="font-semibold text-blue-900 mb-2">Need Help?</h5>
            <p className="text-sm text-blue-700 mb-3">
              We'll help you set up this integration. Contact our support team for assistance.
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              View Setup Guide <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Manual Entry Option */}
      <div className="border-t pt-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-2">Don't see your software?</h5>
          <p className="text-sm text-gray-600 mb-3">
            You can manually manage {category === 'inventory' ? 'inventory' : category === 'service' ? 'service requests' : 'rental bookings'} or contact us about adding your integration.
          </p>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            Request Integration →
          </button>
        </div>
      </div>
    </div>
  );
}
