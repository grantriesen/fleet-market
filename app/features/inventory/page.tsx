'use client';

import { useRouter } from 'next/navigation';
import { Package, Search, Tag, Camera, TrendingUp, ArrowRight, Shield, ChevronRight, BarChart3, Globe, Zap } from 'lucide-react';

function Header() {
  return (
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
            <a href="/features/service" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Service</a>
            <a href="/features/rentals" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Rentals</a>
            <a href="/pricing" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Pricing</a>
            <a href="/register" className="px-6 py-3 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
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
  );
}

export default function InventoryFeaturePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-8">
                <Package className="w-4 h-4 text-[#E8472F]" />
                <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Inventory Management Add-On</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Your entire equipment catalog. Online. Organized.
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Give customers a professional browsing experience with real-time inventory, detailed specs, and built-in lead capture — all synced to your Fleet Market dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a href="/register" className="px-8 py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all inline-flex items-center gap-2">
                  Add to My Site <ArrowRight className="w-5 h-5" />
                </a>
                <a href="/pricing" className="px-8 py-4 bg-slate-700 text-white font-semibold rounded hover:bg-slate-600 transition-all">
                  View Pricing
                </a>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700">
                {[
                  { value: '$130', label: 'Per month' },
                  { value: '200+', label: 'Items supported' },
                  { value: '100%', label: 'Mobile ready' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-[#E8472F] mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="relative">
              <div className="rounded-lg bg-slate-800 border-2 border-slate-700 shadow-2xl overflow-hidden">
                <div className="bg-[#2C3E7D] border-b-2 border-[#E8472F] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Equipment Inventory</span>
                    <span className="text-xs text-gray-400 bg-slate-800 px-3 py-1 rounded">247 items</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-slate-900 rounded border border-slate-700 px-3 py-2 flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500 text-sm">Search equipment...</span>
                    </div>
                    <div className="bg-slate-900 rounded border border-slate-700 px-3 py-2 text-gray-500 text-sm">All Categories</div>
                  </div>
                  {[
                    { name: 'Toro TimeCutter 42"', cat: 'Zero-Turn Mowers', price: '$4,299', img: '🚜' },
                    { name: 'GrandStand 48" Stand-On', cat: 'Stand-On Mowers', price: '$8,499', img: '🏗️' },
                    { name: 'Dingo TX 1000', cat: 'Compact Equipment', price: '$22,999', img: '⚙️' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-900 rounded border border-slate-700 p-3 flex items-center gap-3 hover:border-[#E8472F] transition-colors">
                      <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-2xl flex-shrink-0">{item.img}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{item.name}</div>
                        <div className="text-gray-500 text-xs">{item.cat}</div>
                      </div>
                      <div className="text-[#E8472F] font-bold text-sm flex-shrink-0">{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-2 -left-2 w-16 h-16 border-t-4 border-l-4 border-[#E8472F] pointer-events-none" />
              <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-4 border-r-4 border-[#E8472F] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-800 py-20 border-t-2 border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-6">
              <Zap className="w-4 h-4 text-[#E8472F]" />
              <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Everything Included</span>
            </div>
            <h2 className="text-4xl font-bold text-white">A complete catalog experience for your customers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: 'Rich Product Listings', desc: 'Upload multiple photos, add specs, set pricing, and write descriptions. Each product gets its own detail page.' },
              { icon: Search, title: 'Search & Filter', desc: 'Customers can search by keyword, filter by category, condition, and price range. Find what they want fast.' },
              { icon: Tag, title: 'Pricing Flexibility', desc: 'Set sale prices, mark items as "Call for Price," or display MSRP. Full control over what customers see.' },
              { icon: TrendingUp, title: 'Featured Products', desc: 'Pin your best sellers to the homepage. Showcase new arrivals and seasonal equipment automatically.' },
              { icon: BarChart3, title: 'Lead Capture Built In', desc: 'Every product page has a quote request form. Leads go straight to your dashboard with product details attached.' },
              { icon: Globe, title: 'SEO Ready', desc: 'Each product gets a clean URL, meta tags, and structured data. Google can index your full catalog.' },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-slate-900 rounded-lg border border-slate-700 p-8 hover:border-[#E8472F] transition-all group">
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

      {/* How it works */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Up and running in minutes</h2>
            <p className="text-xl text-gray-400">No tech skills required</p>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Add the Inventory add-on', desc: 'Select it during signup or add it from your dashboard any time. Activates instantly.' },
              { step: '02', title: 'Add your equipment', desc: 'Use the dashboard to add products one by one, or bulk import via CSV. Photos, specs, pricing — all in one place.' },
              { step: '03', title: 'It shows up on your site', desc: 'Your inventory page updates live. Featured items appear on your homepage. Customers can browse, search, and request quotes.' },
            ].map(s => (
              <div key={s.step} className="flex gap-8 items-start bg-slate-800 rounded-lg border border-slate-700 p-8">
                <div className="text-5xl font-bold text-[#E8472F]/30 flex-shrink-0 w-16">{s.step}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#2C3E7D] to-[#1a2647] py-20 border-t-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to put your inventory online?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Add the Inventory add-on to your Fleet Market site for $130/month. Bundle with Service or Rentals and save.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="px-10 py-5 bg-[#E8472F] text-white font-bold text-lg rounded hover:bg-[#d13d25] transition-all inline-flex items-center gap-3">
              Get Started <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/pricing" className="px-10 py-5 bg-slate-700 text-white font-bold text-lg rounded hover:bg-slate-600 transition-all">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
