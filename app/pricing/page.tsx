'use client';

import { useState } from 'react';
import { Check, Plus, Sparkles } from 'lucide-react';

type AddOn = 'inventory' | 'service' | 'rentals';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const toggleAddOn = (addon: AddOn) => {
    if (selectedAddOns.includes(addon)) {
      setSelectedAddOns(selectedAddOns.filter(a => a !== addon));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const calculatePrice = () => {
    const baseMonthly = 200;
    const baseAnnual = 2000; // 2 months free
    
    let addOnPrice = 0;
    const numAddOns = selectedAddOns.length;
    
    // Calculate add-on pricing with bundle discounts
    if (numAddOns === 1) {
      addOnPrice = 100; // $100/month per add-on
    } else if (numAddOns === 2) {
      addOnPrice = 185; // $185/month for 2 ($15 discount)
    } else if (numAddOns === 3) {
      addOnPrice = 230; // $230/month for 3 ($70 discount)
    }
    
    const monthlyTotal = baseMonthly + addOnPrice;
    const annualTotal = billingCycle === 'monthly' 
      ? monthlyTotal 
      : baseAnnual + (addOnPrice * 11); // 1 month free on add-ons
    
    const monthlySavings = numAddOns === 2 ? 15 : numAddOns === 3 ? 70 : 0;
    const annualSavings = billingCycle === 'annual' 
      ? (numAddOns === 0 ? 400 : 400 + (addOnPrice))
      : 0;
    
    return {
      monthlyTotal,
      annualTotal,
      displayPrice: billingCycle === 'monthly' ? monthlyTotal : Math.round(annualTotal / 12),
      monthlySavings,
      annualSavings
    };
  };

  const price = calculatePrice();

  const addOns = [
    {
      id: 'inventory' as AddOn,
      name: 'Inventory Management',
      description: 'Manage equipment for sale with product listings, stock tracking, and image galleries',
      icon: '📦',
      features: [
        'Product listings',
        'Stock tracking',
        'Image galleries',
        'Category management'
      ]
    },
    {
      id: 'service' as AddOn,
      name: 'Service Requests',
      description: 'Accept and manage service appointments with scheduling and customer tracking',
      icon: '🔧',
      features: [
        'Service request forms',
        'Appointment scheduling',
        'Customer tracking',
        'Service history'
      ]
    },
    {
      id: 'rentals' as AddOn,
      name: 'Rental Management',
      description: 'Rent out equipment with booking system, availability calendar, and rate management',
      icon: '🚜',
      features: [
        'Rental equipment listings',
        'Booking system',
        'Availability calendar',
        'Rate management'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Fleet Market Branding */}
      <div className="bg-[#2C3E7D] border-b-4 border-[#E8472F]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/fmlogo3.jpg" 
              alt="Fleet Market" 
              className="h-12"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="text-3xl font-bold hidden">
              <span className="text-[#E8472F]">Fleet</span>
              <span className="text-white">Market</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-blue-100 mb-6">
              Start with our base plan and add only the features you need
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#E8472F] text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-[#E8472F] text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Save up to $400
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Base Plan */}
        <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-slate-200 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Base Plan</h2>
              <p className="text-slate-600">Everything you need to get started with your professional website</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-800">$200</span>
                <span className="text-slate-600">/month</span>
              </div>
              {billingCycle === 'annual' && (
                <>
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    Save $400/year
                  </p>
                  <p className="text-xs text-slate-500">
                    $2,000 billed annually
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">Professional website</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">Analytics & insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">Content management</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">Lead capture forms</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">Contact management</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">Custom domain support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">24/7 support</span>
            </div>
          </div>
        </div>

        {/* Add-Ons Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Add Features À La Carte</h2>
          <p className="text-slate-600 mb-6">Select the features you need. Bundle discounts apply automatically!</p>
          
          {/* Bundle Pricing Table */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#E8472F] rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Bundle Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">1 Add-on</div>
                <div className="text-2xl font-bold text-slate-800">$100/mo</div>
                <div className="text-xs text-slate-500 mt-1">$100 each</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-[#2C3E7D] relative">
                <div className="absolute -top-2 right-2 bg-[#2C3E7D] text-white text-xs font-bold px-2 py-1 rounded-full">
                  Save $15
                </div>
                <div className="text-sm text-slate-600 mb-1">2 Add-ons</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-[#2C3E7D]">$185/mo</div>
                  <div className="text-sm text-slate-400 line-through">$200</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">$92.50 each</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-[#E8472F] relative">
                <div className="absolute -top-2 right-2 bg-[#E8472F] text-white text-xs font-bold px-2 py-1 rounded-full">
                  Save $70
                </div>
                <div className="text-sm text-slate-600 mb-1">All 3 Add-ons</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-[#E8472F]">$230/mo</div>
                  <div className="text-sm text-slate-400 line-through">$300</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">$76.67 each</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon) => {
              const isSelected = selectedAddOns.includes(addon.id);
              
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddOn(addon.id)}
                  className={`text-left p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[#2C3E7D] bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-[#E8472F] bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{addon.icon}</div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#2C3E7D] bg-[#2C3E7D]'
                        : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2">{addon.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{addon.description}</p>

                  <ul className="space-y-2">
                    {addon.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-sm font-semibold text-slate-700">
                      +$100/month each
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bundle Discount Alert */}
          {selectedAddOns.length >= 2 && (
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-800 mb-2">Bundle Discount Applied! 🎉</h3>
                  <div className="space-y-1">
                    <p className="text-green-700 font-semibold">
                      {selectedAddOns.length === 2 && (
                        <>Regular: $200/month • Bundle Price: $185/month • Save $15/month!</>
                      )}
                      {selectedAddOns.length === 3 && (
                        <>Regular: $300/month • Bundle Price: $230/month • Save $70/month!</>
                      )}
                    </p>
                    <p className="text-sm text-green-600">
                      Your {selectedAddOns.length} add-ons are now ${selectedAddOns.length === 2 ? '185' : '230'}/month instead of ${selectedAddOns.length * 100}/month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 shadow-xl text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Total</h2>
              <div className="flex items-center gap-2 text-slate-300">
                <span>Base Plan</span>
                {selectedAddOns.length > 0 && (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{selectedAddOns.length} Add-on{selectedAddOns.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">${price.displayPrice}</span>
                <span className="text-xl text-slate-300">/mo</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-400 font-semibold mt-1">
                  Save ${price.annualSavings}/year
                </p>
              )}
              {price.monthlySavings > 0 && billingCycle === 'monthly' && (
                <p className="text-sm text-green-400 font-semibold mt-1">
                  Saving ${price.monthlySavings}/month with bundle
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 mb-6">
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between">
                <span>Base Plan</span>
                <span className="font-semibold">${billingCycle === 'monthly' ? '200' : '167'}/mo</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="flex justify-between">
                  <span>{selectedAddOns.length} Add-on{selectedAddOns.length > 1 ? 's' : ''}</span>
                  <span className="font-semibold">
                    ${billingCycle === 'monthly' 
                      ? (price.monthlyTotal - 200) 
                      : Math.round((price.annualTotal - 2000) / 12)
                    }/mo
                  </span>
                </div>
              )}
              {billingCycle === 'annual' && (
                <div className="flex justify-between text-sm">
                  <span className="italic">Billed annually</span>
                  <span className="font-semibold">${price.annualTotal}/year</span>
                </div>
              )}
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-[#E8472F] to-[#D13A24] text-white py-4 rounded-lg font-bold text-lg hover:from-[#D13A24] hover:to-[#C02E1A] transition-all shadow-lg">
            Get Started with Fleet Market
          </button>
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Pricing FAQs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">How do bundle discounts work?</h3>
              <p className="text-slate-600 text-sm">Select 2 add-ons and save $15/month. Get all 3 and save $70/month instead of paying $300/month!</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Can I add features later?</h3>
              <p className="text-slate-600 text-sm">Absolutely! Add or remove features anytime. Bundle discounts apply automatically.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">What about annual billing?</h3>
              <p className="text-slate-600 text-sm">Pay annually and get 2 months free on the base plan, plus 1 month free on all add-ons!</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600 text-sm">Yes! Cancel anytime. Your site remains active until the end of your billing period.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
