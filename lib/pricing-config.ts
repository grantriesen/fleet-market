// Pricing configuration for Fleet Market

export type SubscriptionTier = 
  | 'basic'
  | 'inventory'
  | 'service'
  | 'rentals'
  | 'inventory_service'
  | 'inventory_rentals'
  | 'service_rentals'
  | 'enterprise';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  features: string[];
  addOns: ('inventory' | 'service' | 'rentals')[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Base Package',
    monthlyPrice: 200,
    annualPrice: 2000, // 2 months free
    annualSavings: 400,
    features: [
      'Professional website',
      'Analytics & insights',
      'Content management',
      'Lead capture forms',
      'Contact management',
      'Custom domain support',
      '24/7 support'
    ],
    addOns: []
  },
  {
    id: 'inventory',
    name: 'Base + Inventory',
    monthlyPrice: 300,
    annualPrice: 3300, // 1 month free
    annualSavings: 300,
    features: [
      'Everything in Base Package',
      '✨ Inventory management',
      '✨ Product listings',
      '✨ Stock tracking',
      '✨ Image galleries'
    ],
    addOns: ['inventory']
  },
  {
    id: 'service',
    name: 'Base + Service',
    monthlyPrice: 300,
    annualPrice: 3300, // 1 month free
    annualSavings: 300,
    features: [
      'Everything in Base Package',
      '✨ Service request management',
      '✨ Appointment scheduling',
      '✨ Customer tracking',
      '✨ Service history'
    ],
    addOns: ['service']
  },
  {
    id: 'rentals',
    name: 'Base + Rentals',
    monthlyPrice: 300,
    annualPrice: 3300, // 1 month free
    annualSavings: 300,
    features: [
      'Everything in Base Package',
      '✨ Rental equipment management',
      '✨ Booking system',
      '✨ Availability calendar',
      '✨ Rate management'
    ],
    addOns: ['rentals']
  },
  {
    id: 'inventory_service',
    name: 'Base + Inventory + Service',
    monthlyPrice: 385,
    annualPrice: 4235, // 1 month free
    annualSavings: 385,
    popular: true,
    features: [
      'Everything in Base Package',
      '✨ Inventory management',
      '✨ Service request management',
      '✨ Product listings & stock tracking',
      '✨ Appointment scheduling',
      '✨ Customer tracking'
    ],
    addOns: ['inventory', 'service']
  },
  {
    id: 'inventory_rentals',
    name: 'Base + Inventory + Rentals',
    monthlyPrice: 385,
    annualPrice: 4235, // 1 month free
    annualSavings: 385,
    features: [
      'Everything in Base Package',
      '✨ Inventory management',
      '✨ Rental equipment management',
      '✨ Product listings & stock tracking',
      '✨ Booking system',
      '✨ Availability calendar'
    ],
    addOns: ['inventory', 'rentals']
  },
  {
    id: 'service_rentals',
    name: 'Base + Service + Rentals',
    monthlyPrice: 385,
    annualPrice: 4235, // 1 month free
    annualSavings: 385,
    features: [
      'Everything in Base Package',
      '✨ Service request management',
      '✨ Rental equipment management',
      '✨ Appointment scheduling',
      '✨ Booking system',
      '✨ Customer tracking'
    ],
    addOns: ['service', 'rentals']
  },
  {
    id: 'enterprise',
    name: 'Enterprise (All Features)',
    monthlyPrice: 430,
    annualPrice: 4730, // 1 month free
    annualSavings: 430,
    popular: true,
    features: [
      'Everything in Base Package',
      '✨ Full inventory management',
      '✨ Service request management',
      '✨ Rental equipment management',
      '✨ Complete booking system',
      '✨ Advanced analytics',
      '✨ Priority support'
    ],
    addOns: ['inventory', 'service', 'rentals']
  }
];

// Helper function to get plan by ID
export function getPlanById(id: SubscriptionTier): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === id);
}

// Helper function to check if a feature is available in a tier
export function hasFeature(tier: SubscriptionTier, feature: 'inventory' | 'service' | 'rentals'): boolean {
  const plan = getPlanById(tier);
  return plan ? plan.addOns.includes(feature) : false;
}

// Helper function to get upgrade options from current tier
export function getUpgradeOptions(currentTier: SubscriptionTier): PricingPlan[] {
  const currentPlan = getPlanById(currentTier);
  if (!currentPlan) return PRICING_PLANS;
  
  return PRICING_PLANS.filter(plan => {
    // Can only upgrade to plans with more features
    return plan.addOns.length > currentPlan.addOns.length;
  });
}
