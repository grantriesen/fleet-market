'use client';

import { useState } from 'react';
import { Package, Wrench, Calendar, X, Check, ArrowRight, ChevronDown } from 'lucide-react';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingLayout';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ModalContent {
  title: string;
  icon: any;
  color: string;
  price: string;
  description: string;
  bullets: string[];
  screenshot: string;
  screenshotAlt: string;
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function FeatureModal({ content, onClose }: { content: ModalContent; onClose: () => void }) {
  const Icon = content.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${content.color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{content.title}</h2>
              <span className="text-[#E8472F] font-semibold">{content.price}/month</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Screenshot */}
        <div className="mx-8 mt-8 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
          <img
            src={content.screenshot}
            alt={content.screenshotAlt}
            className="w-full object-cover object-top"
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-300 text-lg leading-relaxed mb-8">{content.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {content.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8472F]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#E8472F]" />
                </div>
                <span className="text-gray-300 text-sm">{b}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <a
              href="/pricing"
              className="flex-1 py-4 bg-[#E8472F] text-white font-bold rounded-lg hover:bg-[#d13d25] transition-all text-center inline-flex items-center justify-center gap-2"
            >
              Add to My Site <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="px-6 py-4 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-slate-400 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Section ────────────────────────────────────────────────────────────
function FeatureSection({
  icon: Icon,
  title,
  tagline,
  description,
  price,
  color,
  bgColor,
  bullets,
  screenshot,
  screenshotAlt,
  flip,
  onLearnMore,
}: any) {
  return (
    <section className={`py-24 border-t border-slate-800 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${flip ? 'lg:grid-flow-dense' : ''}`}>

          {/* Text side */}
          <div className={flip ? 'lg:col-start-2' : ''}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-6">
              <Icon className="w-4 h-4 text-[#E8472F]" />
              <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Add-On · {price}/mo</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{title}</h2>
            <p className="text-lg text-gray-300 mb-6 italic">{tagline}</p>
            <p className="text-gray-400 leading-relaxed mb-8">{description}</p>

            <ul className="space-y-3 mb-10">
              {bullets.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8472F]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#E8472F]" />
                  </div>
                  <span className="text-gray-300">{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onLearnMore}
                className="px-8 py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all inline-flex items-center gap-2"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="/pricing"
                className="px-8 py-4 bg-slate-700 text-white font-semibold rounded hover:bg-slate-600 transition-all"
              >
                View Pricing
              </a>
            </div>
          </div>

          {/* Screenshot side */}
          <div className={`relative ${flip ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            <div className="rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <img
                src={screenshot}
                alt={screenshotAlt}
                className="w-full object-cover object-top"
              />
            </div>
            {/* Accent corners */}
            <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-[#E8472F] pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-[#E8472F] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  const [activeModal, setActiveModal] = useState<ModalContent | null>(null);

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      tagline: 'Your entire equipment catalog. Online. Organized.',
      description: 'Give customers a professional browsing experience with real-time inventory, detailed specs, search and filter tools, and built-in lead capture — all synced to your Fleet Market dashboard.',
      price: '$130',
      color: 'bg-orange-500',
      bgColor: 'bg-slate-900',
      flip: false,
      screenshot: '/screenshots/dashboard-inventory.png',
      screenshotAlt: 'Inventory Management Dashboard',
      bullets: [
        'Product catalog with photos, specs, and pricing',
        'Search and filter by category, condition, and price',
        'Featured products displayed on your homepage',
        'Lead capture form on every product page',
        'CSV import/export and Google Shopping feed',
        'Mark items as available, sold, or call-for-price',
      ],
      modalBullets: [
        'Up to 200+ products supported',
        'Multiple photos per product',
        'Bulk CSV import',
        'Google Shopping feed included',
        'Quote request forms on every listing',
        'Featured items on homepage',
        'Category and condition filters',
        'Sale price and MSRP display',
        'Mobile-optimized product cards',
        'SEO-ready product URLs',
      ],
      modalDesc: 'The Inventory Management add-on turns your Fleet Market site into a fully functional equipment catalog. Customers can browse your full lineup, search by category, filter by condition and price, and submit quote requests directly from product pages — all without leaving your site.',
    },
    {
      icon: Wrench,
      title: 'Service Scheduling',
      tagline: 'Online booking for your service department.',
      description: 'Let customers book service appointments 24/7 from your website. Manage your shop queue, assign technicians, set availability, and confirm appointments — all from your Fleet Market dashboard.',
      price: '$130',
      color: 'bg-red-500',
      bgColor: 'bg-slate-800',
      flip: true,
      screenshot: '/screenshots/dashboard-service.png',
      screenshotAlt: 'Service Scheduling Dashboard',
      bullets: [
        'Online booking with real-time time slot selection',
        'Define your service types, durations, and pricing',
        'Queue and calendar views for your shop',
        'Assign technicians to appointments',
        'Set availability day by day with max concurrent slots',
        'Automatic status tracking from pending to complete',
      ],
      modalBullets: [
        'Customer-facing booking widget on your service page',
        'Define unlimited service types',
        'Set hours and capacity per day',
        'Queue view with status tracking',
        'Calendar view for the week/month',
        'Technician assignment',
        'Pending, confirmed, in-progress, complete statuses',
        'Equipment info collected at booking',
        'Lead also captured in your leads dashboard',
        '"Other" option for custom requests',
      ],
      modalDesc: 'The Service Scheduling add-on gives your customers a professional online booking experience and gives your shop a modern queue management system. No more phone tag — customers pick their service type, choose an available time slot, and submit their equipment info. You get notified instantly and manage everything from one dashboard.',
    },
    {
      icon: Calendar,
      title: 'Rental Management',
      tagline: 'Your rental fleet, booked online around the clock.',
      description: 'Give customers a live availability calendar, online reservations, and Stripe-powered deposit collection — while you track your fleet utilization and manage bookings from one dashboard.',
      price: '$130',
      color: 'bg-purple-500',
      bgColor: 'bg-slate-900',
      flip: false,
      screenshot: '/screenshots/dashboard-rentals.png',
      screenshotAlt: 'Rental Management Dashboard',
      bullets: [
        'Live availability calendar per equipment item',
        'Online reservations with Stripe deposit collection',
        'Daily, weekly, and monthly rate structures',
        'Fleet utilization tracking and booking history',
        'Delivery options per equipment item',
        'Cancellation policy and minimum rental period settings',
      ],
      modalBullets: [
        'Real-time availability calendar',
        'Stripe deposit collection at booking',
        'Daily, weekly, monthly rates',
        'Unlimited fleet items',
        'Delivery toggle per item',
        'Fleet utilization dashboard',
        'Booking history and status tracking',
        'Active, upcoming, and returned status',
        'Tax rate configuration',
        'Cancellation policy display',
      ],
      modalDesc: 'The Rental Management add-on turns your website into a 24/7 rental operation. Customers browse your fleet, check real-time availability, pick their dates, and pay a deposit via Stripe — all without calling your shop. You manage active rentals, track what\'s out, and monitor fleet utilization from one clean dashboard.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Header */}
      <header className="bg-[#2C3E7D] border-b-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-10" onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
              }} />
              <span className="text-2xl font-bold text-white uppercase tracking-tight hidden">
                <span className="text-[#E8472F]">Fleet</span>Market
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/templates" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hidden md:block">Templates</a>
              <a href="/pricing" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hidden md:block">Pricing</a>
              <a href="/auth/login" className="px-5 py-2 text-gray-300 hover:text-white font-semibold transition-colors">Sign In</a>
              <a href="/pricing" className="px-6 py-3 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all">Sign Up</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-8">
            <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Add-On Features</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Expand what your site can do
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Every Fleet Market site starts with a professional dealer website. Add Inventory, Service Scheduling, or Rental Management — individually or bundled — when you're ready.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { label: '$130/mo each', sub: 'per add-on' },
              { label: '$215/mo', sub: 'any 2 bundled' },
              { label: '$280/mo', sub: 'all 3 bundled' },
            ].map(p => (
              <div key={p.label} className="bg-slate-800 border border-slate-700 rounded-lg px-6 py-4 text-center">
                <div className="text-2xl font-bold text-[#E8472F]">{p.label}</div>
                <div className="text-sm text-gray-400">{p.sub}</div>
              </div>
            ))}
          </div>
          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
            <span>Scroll to explore each add-on</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((f, i) => (
        <FeatureSection
          key={f.title}
          {...f}
          bullets={f.bullets}
          onLearnMore={() => setActiveModal({
            title: f.title,
            icon: f.icon,
            color: f.color,
            price: f.price,
            description: f.modalDesc,
            bullets: f.modalBullets,
            screenshot: f.screenshot,
            screenshotAlt: f.screenshotAlt,
          })}
        />
      ))}

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#2C3E7D] to-[#1a2647] py-20 border-t-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bundle all three and save $110/mo
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Get Inventory, Service Scheduling, and Rental Management together for $280/month — added to your $230 base plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/pricing" className="px-10 py-5 bg-[#E8472F] text-white font-bold text-lg rounded hover:bg-[#d13d25] transition-all inline-flex items-center gap-3">
              Get Started <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/templates" className="px-10 py-5 bg-slate-700 text-white font-bold text-lg rounded hover:bg-slate-600 transition-all">
              View Templates
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-8" onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
            }} />
            <span className="text-xl font-bold text-gray-400 hidden"><span className="text-[#E8472F]">Fleet</span>Market</span>
            <p className="text-sm text-gray-500">© 2026 FleetMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {activeModal && (
        <FeatureModal content={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
