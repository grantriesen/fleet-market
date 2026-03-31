'use client';

import { ArrowRight, Zap, Palette, Layout, Globe, Shield, Clock } from 'lucide-react';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingLayout';

export default function SiteBuilderPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <MarketingHeader activePath="/site-builder" />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-8">
              <Layout className="w-4 h-4 text-[#E8472F]" />
              <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Visual Site Builder</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your dealership website,<br />built in 30 minutes.
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              No developers. No designers. No guesswork. Pick a template, customize your content and colors, and go live — all from one intuitive dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/pricing" className="px-8 py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all inline-flex items-center gap-2">
                Start Building <ArrowRight className="w-5 h-5" />
              </a>
              <a href="/templates" className="px-8 py-4 bg-slate-700 text-white font-semibold rounded hover:bg-slate-600 transition-all">
                Browse Templates
              </a>
            </div>
          </div>

          {/* Customizer screenshot */}
          <div className="relative max-w-5xl mx-auto">
            <div className="rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <img
                src="/screenshots/site-builder.png"
                alt="Fleet Market Site Builder"
                className="w-full object-cover object-top"
              />
            </div>
            <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-[#E8472F] pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-[#E8472F] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#2C3E7D] border-y-2 border-[#E8472F] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '30 min', label: 'Average setup time' },
              { value: '6', label: 'Pro templates' },
              { value: '100%', label: 'No-code required' },
              { value: '24/7', label: 'Your site is live' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-[#E8472F] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-800 py-20 border-t-2 border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-6">
              <Zap className="w-4 h-4 text-[#E8472F]" />
              <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">How It Works</span>
            </div>
            <h2 className="text-4xl font-bold text-white">From signup to live site in three steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Pick your template',
                desc: 'Choose from six professionally designed templates built specifically for equipment dealers. Each one is fully customizable — think of it as a starting point, not a constraint.',
              },
              {
                step: '02',
                title: 'Customize your content',
                desc: 'Use the visual customizer to update your business name, contact info, hours, colors, and fonts. Every change previews in real time before you save.',
              },
              {
                step: '03',
                title: 'Go live instantly',
                desc: 'Hit publish and your site goes live on your Fleet Market subdomain. Connect your own domain with a one-click DNS setup — no server configuration needed.',
              },
            ].map(s => (
              <div key={s.step} className="bg-slate-900 rounded-lg border border-slate-700 p-8 hover:border-[#E8472F] transition-all">
                <div className="text-5xl font-bold text-[#E8472F]/30 mb-4">{s.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customizer features */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-6">
              <Palette className="w-4 h-4 text-[#E8472F]" />
              <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Customizer Features</span>
            </div>
            <h2 className="text-4xl font-bold text-white">Everything you can control</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Palette, title: 'Colors & Fonts', desc: 'Match your brand exactly. Set your primary, secondary, and accent colors. Choose from a curated set of professional font pairings.' },
              { icon: Layout, title: 'Page Sections', desc: 'Toggle sections on or off for each page. Show or hide your hero, featured products, testimonials, manufacturers, and more.' },
              { icon: Globe, title: 'Business Info', desc: 'Your name, address, phone, email, and hours all live in one place and flow to every page automatically — header, footer, contact page.' },
              { icon: Shield, title: 'Custom Domain', desc: 'Connect your own domain with one-click SSL. Your site works on your subdomain instantly and switches to your domain with a simple DNS update.' },
              { icon: Clock, title: 'Live Preview', desc: 'Every change you make in the customizer previews in real time. See exactly what your customers will see before you publish.' },
              { icon: Zap, title: 'Page Management', desc: 'Control which pages are visible. Enable Inventory, Service, and Rental pages when you add those features — they appear in your nav automatically.' },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-slate-800 rounded-lg border border-slate-700 p-8 hover:border-[#E8472F] transition-all group">
                  <div className="w-14 h-14 bg-[#2C3E7D] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#E8472F] transition-colors">
                    <Icon className="w-7 h-7 text-[#E8472F] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-slate-800 py-20 border-t-2 border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Every site includes</h2>
            <p className="text-xl text-gray-400">No add-ons required for these core features</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Professional dealer website on your domain',
              'Contact forms with lead capture',
              'Mobile-optimized for all devices',
              'SSL certificate included',
              'Manufacturer logo showcase',
              'Testimonials section',
              'Business hours and location info',
              'Analytics and visitor tracking',
              'Social media links',
              'Google Maps integration',
              'Password-protected preview mode',
              'Real-time customizer with live preview',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-900 rounded-lg border border-slate-700 p-4">
                <div className="w-5 h-5 rounded-full bg-[#E8472F]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#E8472F]" />
                </div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#2C3E7D] to-[#1a2647] py-20 border-t-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to build your dealer website?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Start with any template. Customize it to match your brand. Go live in 30 minutes.
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

      <MarketingFooter />
    </div>
  );
}
