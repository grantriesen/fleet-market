'use client';

import { useRouter } from 'next/navigation';
import { Lock, Zap } from 'lucide-react';

interface UpgradePromptProps {
  feature: 'inventory' | 'service' | 'rentals';
  siteId: string;
}

const FEATURE_INFO = {
  inventory: {
    title: 'Inventory Management',
    description: 'List and manage your full equipment inventory with categories, pricing, and featured items.',
    icon: '📦',
  },
  service: {
    title: 'Service Scheduling',
    description: 'Accept service requests online, manage your calendar, and track your service queue.',
    icon: '🔧',
  },
  rentals: {
    title: 'Rental Management',
    description: 'List rental equipment, track availability, and capture rental inquiries from your site.',
    icon: '🚜',
  },
};

const ADDON_PRICE = 130;
const BUNDLE_2_PRICE = 240;
const BUNDLE_3_PRICE = 280;

export default function UpgradePrompt({ feature, siteId }: UpgradePromptProps) {
  const router = useRouter();
  const info = FEATURE_INFO[feature];

  async function handleUpgrade(addons: string[]) {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, addons }),
    });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else console.error('Checkout error:', error);
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* Locked feature card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 px-8 py-10 text-center">
            <div className="text-5xl mb-4">{info.icon}</div>
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 mb-4">
              <Lock className="w-3 h-3" />
              Add-on Required
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{info.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{info.description}</p>
          </div>

          {/* Pricing options */}
          <div className="p-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Choose your plan
            </p>

            <div className="space-y-3">
              {/* Single add-on */}
              <button
                onClick={() => handleUpgrade([feature])}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900 group-hover:text-green-700">
                    {info.title} only
                  </p>
                  <p className="text-sm text-gray-500">Add a single feature to your plan</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-bold text-gray-900">+${ADDON_PRICE}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
              </button>

              {/* 2 add-on bundle */}
              <button
                onClick={() => handleUpgrade(['inventory', 'service'])}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 group-hover:text-green-700">
                      Any 2 Add-ons
                    </p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Save ${ADDON_PRICE * 2 - BUNDLE_2_PRICE}/mo
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Pick any two add-ons at a bundle rate</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-bold text-gray-900">+${BUNDLE_2_PRICE}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
              </button>

              {/* 3 add-on bundle */}
              <button
                onClick={() => handleUpgrade(['inventory', 'service', 'rentals'])}
                className="w-full flex items-center justify-between p-4 border-2 border-green-500 bg-green-50 rounded-xl hover:bg-green-100 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  BEST VALUE
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-green-700">
                      All 3 Add-ons
                    </p>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      Save ${ADDON_PRICE * 3 - BUNDLE_3_PRICE}/mo
                    </span>
                  </div>
                  <p className="text-sm text-green-600">Inventory + Service + Rentals</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-bold text-green-700">+${BUNDLE_3_PRICE}<span className="text-sm font-normal text-green-600">/mo</span></p>
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              All plans include your $230/mo base. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
