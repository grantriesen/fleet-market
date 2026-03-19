// Run once with: node setup-stripe-products.js
// Make sure STRIPE_SECRET_KEY is set in your environment first:
// export STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function setup() {
  console.log('Creating Fleet Market Stripe products and prices...\n');

  const products = [
    {
      key: 'base',
      name: 'Fleet Market Base',
      description: 'Dealer website, leads, analytics, custom domain, all templates.',
      amount: 23000, // $230.00
    },
    {
      key: 'addon_inventory',
      name: 'Inventory Add-on',
      description: 'Full inventory management — listings, categories, featured items.',
      amount: 13000, // $130.00
    },
    {
      key: 'addon_service',
      name: 'Service Scheduling Add-on',
      description: 'Service request management, calendar, and queue views.',
      amount: 13000,
    },
    {
      key: 'addon_rentals',
      name: 'Rental Management Add-on',
      description: 'Rental listings, availability tracking, and rental inquiries.',
      amount: 13000,
    },
    {
      key: 'bundle_2',
      name: '2 Add-on Bundle',
      description: 'Any two add-ons (Inventory, Service Scheduling, or Rental Management).',
      amount: 24000, // $240.00
    },
    {
      key: 'bundle_3',
      name: '3 Add-on Bundle',
      description: 'All three add-ons — Inventory, Service Scheduling, and Rental Management.',
      amount: 28000, // $280.00
    },
  ];

  const results = {};

  for (const p of products) {
    const product = await stripe.products.create({
      name: p.name,
      description: p.description,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    results[p.key] = { productId: product.id, priceId: price.id };
    console.log(`✓ ${p.name}`);
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Price ID:   ${price.id}\n`);
  }

  console.log('-------------------------------------------');
  console.log('Add these to your Vercel environment variables:\n');
  console.log(`STRIPE_PRICE_BASE=${results.base.priceId}`);
  console.log(`STRIPE_PRICE_ADDON_INVENTORY=${results.addon_inventory.priceId}`);
  console.log(`STRIPE_PRICE_ADDON_SERVICE=${results.addon_service.priceId}`);
  console.log(`STRIPE_PRICE_ADDON_RENTALS=${results.addon_rentals.priceId}`);
  console.log(`STRIPE_PRICE_BUNDLE_2=${results.bundle_2.priceId}`);
  console.log(`STRIPE_PRICE_BUNDLE_3=${results.bundle_3.priceId}`);
  console.log('-------------------------------------------');
}

setup().catch(console.error);
