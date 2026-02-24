'use client';

import { X, Check, Sparkles, ArrowRight } from 'lucide-react';
import { SubscriptionTier } from '@/lib/pricing-config';

interface FeatureUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'inventory' | 'service' | 'rentals';
  currentTier: SubscriptionTier;
  onUpgrade: (newTier: SubscriptionTier, billingCycle: 'monthly' | 'annual') => void;
}

const FEATURE_INFO = {
  inventory: {
    name: 'Inventory Management',
    icon: '📦',
    description: 'Manage equipment for sale with powerful inventory tools',
    features: [
      'Product listings with details',
      'Stock tracking & alerts',
      'Image galleries (up to 10 images per item)',
      'Category management',
      'Search & filter capabilities',
      'Pricing & discount management'
    ],
    price: 100
  },
  service: {
    name: 'Service Requests',
    icon: '🔧',
    description: 'Accept and manage service appointments seamlessly',
    features: [
      'Service request forms',
      'Appointment scheduling',
      'Customer information tracking',
      'Service history logs',
      'Status updates & notifications',
      'Calendar integration'
    ],
    price: 100
  },
  rentals: {
    name: 'Rental Management',
    icon: '🚜',
    description: 'Rent out equipment with a complete booking system',
    features: [
      'Rental equipment listings',
      'Real-time availability calendar',
      'Online booking system',
      'Rate management (daily/weekly/monthly)',
      'Booking confirmations',
      'Rental history tracking'
    ],
    price: 100
  }
};

export default function FeatureUpgradeModal({
  isOpen,
  onClose,
  feature,
  currentTier,
  onUpgrade
}: FeatureUpgradeModalProps) {
  if (!isOpen) return null;

  const featureInfo = FEATURE_INFO[feature];
  
  // Calculate what tier the user would be on after adding this feature
  const getNewTier = (): SubscriptionTier => {
    if (currentTier === 'basic') {
      return feature; // 'inventory', 'service', or 'rentals'
    }
    
    // User already has some features, figure out the combination
    const currentFeatures: ('inventory' | 'service' | 'rentals')[] = [];
    
    if (currentTier.includes('inventory')) currentFeatures.push('inventory');
    if (currentTier.includes('service')) currentFeatures.push('service');
    if (currentTier.includes('rentals')) currentFeatures.push('rentals');
    
    const allFeatures = [...currentFeatures, feature];
    
    if (allFeatures.length === 3) return 'enterprise';
    
    // Sort to create consistent tier names
    const sorted = allFeatures.sort();
    return sorted.join('_') as SubscriptionTier;
  };

  const newTier = getNewTier();
  const currentHasFeatures = currentTier !== 'basic';
  const willHaveTwoFeatures = (currentTier === 'inventory' || currentTier === 'service' || currentTier === 'rentals');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2C3E7D] to-[#1e2b5a] text-white px-6 py-4 flex items-center justify-between border-b-4 border-[#E8472F]">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{featureInfo.icon}</div>
            <div>
              <h2 className="text-2xl font-bold">Add {featureInfo.name}</h2>
              <p className="text-sm text-blue-200">Unlock powerful new capabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Feature Description */}
          <div className="mb-6">
            <p className="text-lg text-slate-700">{featureInfo.description}</p>
          </div>

          {/* Features List */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">What's Included:</h3>
            <ul className="space-y-3">
              {featureInfo.features.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Add {featureInfo.name}</h3>
                <p className="text-sm text-slate-600">Monthly pricing</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#2C3E7D]">${featureInfo.price}</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Current Plan (Base)</span>
                <span className="font-semibold">$200/mo</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-600">+ {featureInfo.name}</span>
                <span className="font-semibold">$100/mo</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-[#2C3E7D] mt-3 pt-3 border-t border-slate-200">
                <span>New Total</span>
                <span>$300/mo</span>
              </div>
            </div>
          </div>

          {/* Bundle Upsell */}
          {willHaveTwoFeatures && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">💡 Bundle Discount Available!</h3>
                  <p className="text-green-700 mb-3">
                    Add <strong>2 features together</strong> and save $15/month! 
                  </p>
                  <div className="bg-white rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">2 Features Regular Price:</span>
                      <span className="text-slate-400 line-through">$400/mo</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-green-700">
                      <span>Bundle Price:</span>
                      <span className="text-xl">$385/mo</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-600">
                    Or get all 3 features for just $430/mo (save $70/mo!)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
            >
              Not Now
            </button>
            <button
              onClick={() => {
                onUpgrade(newTier, 'monthly');
                onClose();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E8472F] to-[#D13A24] text-white font-bold rounded-lg hover:from-[#D13A24] hover:to-[#C02E1A] transition-all shadow-lg"
            >
              Add Feature
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Annual Option */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                onUpgrade(newTier, 'annual');
                onClose();
              }}
              className="text-sm text-[#2C3E7D] font-semibold hover:text-[#E8472F] transition-colors"
            >
              Or pay annually and save 1 month free →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
