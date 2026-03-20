// Run once with: node setup-stripe-annual.js
// Uses the same STRIPE_SECRET_KEY env var

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// These are the product IDs created by the first script.
// We're adding annual prices to the SAME products.
// Replace these with your actual product IDs from the Stripe dashboard.
const PRODUCT_IDS = {
  base:            'prod_UB5JagvqtSSL5x',
  addon_inventory: 'prod_UB5JT9KQ4JNE4Z',
  addon_service:   'prod_UB5JZ50uhfRuDz',
  addon_rentals:   'prod_UB5JOoYycjlkJg',
  bundle_2:        'prod_UB5JJL9hklvahr',
  bundle_3:        'prod_UB5JRyW1kTwTXc',
};

const ANNUAL_PRICES = [
  { key: 'base',            productId: PRODUCT_IDS.base,            amount: 230000, label: 'Fleet Market Base (Annual)'         }, // $2,300/yr
  { key: 'addon_inventory', productId: PRODUCT_IDS.addon_inventory, amount: 143000, label: 'Inventory Add-on (Annual)'           }, // $1,430/yr
  { key: 'addon_service',   productId: PRODUCT_IDS.addon_service,   amount: 143000, label: 'Service Scheduling Add-on (Annual)'  }, // $1,430/yr
  { key: 'addon_rentals',   productId: PRODUCT_IDS.addon_rentals,   amount: 143000, label: 'Rental Management Add-on (Annual)'   }, // $1,430/yr
  { key: 'bundle_2',        productId: PRODUCT_IDS.bundle_2,        amount: 264000, label: '2 Add-on Bundle (Annual)'            }, // $2,640/yr
  { key: 'bundle_3',        productId: PRODUCT_IDS.bundle_3,        amount: 308000, label: '3 Add-on Bundle (Annual)'            }, // $3,080/yr
];

async function setup() {
  console.log('Creating annual prices on existing Fleet Market products...\n');

  const results = {};

  for (const p of ANNUAL_PRICES) {
    const price = await stripe.prices.create({
      product:   p.productId,
      unit_amount: p.amount,
      currency:  'usd',
      recurring: { interval: 'year' },
      nickname:  p.label,
    });

    results[p.key] = price.id;
    console.log(`✓ ${p.label}`);
    console.log(`  Price ID: ${price.id}\n`);
  }

  console.log('-------------------------------------------');
  console.log('Add these to your Vercel environment variables:\n');
  console.log(`STRIPE_PRICE_BASE_ANNUAL=${results.base}`);
  console.log(`STRIPE_PRICE_ADDON_INVENTORY_ANNUAL=${results.addon_inventory}`);
  console.log(`STRIPE_PRICE_ADDON_SERVICE_ANNUAL=${results.addon_service}`);
  console.log(`STRIPE_PRICE_ADDON_RENTALS_ANNUAL=${results.addon_rentals}`);
  console.log(`STRIPE_PRICE_BUNDLE_2_ANNUAL=${results.bundle_2}`);
  console.log(`STRIPE_PRICE_BUNDLE_3_ANNUAL=${results.bundle_3}`);
  console.log('-------------------------------------------');
}

setup().catch(console.error);
