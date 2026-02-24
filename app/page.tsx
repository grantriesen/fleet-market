'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Globe, TrendingUp, ArrowRight, Shield, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-[#2C3E7D] border-b-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Use the actual logo image */}
              <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-10" onError={(e) => {
                // Fallback to text if image doesn't load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }} />
              <span className="text-2xl font-bold text-white uppercase tracking-tight hidden">
                <span className="text-[#E8472F]">Fleet</span>Market
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2 text-gray-200 hover:text-white font-semibold transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-3 bg-[#E8472F] text-white font-bold rounded hover:bg-[#D13A24] transition-all shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-8">
                <Shield className="w-4 h-4 text-[#E8472F]" />
                <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Industrial Strength Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Built for Equipment Dealers Who Mean Business
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Professional-grade website platform designed for heavy equipment dealers. Manage inventory, rentals, service requests, and customer leads with precision.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
                <button
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#D13A24] transition-all shadow-xl flex items-center gap-3"
                >
                  Start Building Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-slate-700 text-white font-semibold rounded hover:bg-slate-600 transition-all"
                >
                  View Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700">
                {[
                  { value: '99.9%', label: 'Uptime' },
                  { value: '500+', label: 'Active Dealers' },
                  { value: '24/7', label: 'Support' }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-[#E8472F] mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual - Dashboard Preview */}
            <div className="relative">
              {/* Dashboard Mockup */}
              <div className="rounded-lg bg-slate-800 border-2 border-slate-700 shadow-2xl overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-[#2C3E7D] border-b-2 border-[#E8472F] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-lg">Your Equipment Business</div>
                      <div className="text-gray-400 text-sm">Manage your operations</div>
                    </div>
                    <div className="w-8 h-8 bg-[#E8472F] rounded flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 rounded p-4 border border-slate-700">
                      <div className="text-gray-400 text-xs mb-1">Total Inventory</div>
                      <div className="text-white font-bold text-2xl">247</div>
                    </div>
                    <div className="bg-slate-900 rounded p-4 border border-slate-700">
                      <div className="text-gray-400 text-xs mb-1">Active Rentals</div>
                      <div className="text-white font-bold text-2xl">18</div>
                    </div>
                  </div>

                  {/* Management Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: BarChart3, label: 'Analytics', color: 'bg-blue-500' },
                      { icon: Globe, label: 'My Website', color: 'bg-green-500' },
                      { icon: Zap, label: 'Inventory', color: 'bg-orange-500' },
                      { icon: Shield, label: 'Rentals', color: 'bg-purple-500' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="bg-slate-900 rounded p-3 border border-slate-700 hover:border-[#E8472F] transition-colors">
                          <div className={`w-8 h-8 ${item.color} rounded flex items-center justify-center mb-2`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-white text-sm font-semibold">{item.label}</div>
                          <div className="text-gray-500 text-xs mt-1">→</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Activity Feed */}
                  <div className="bg-slate-900 rounded p-4 border border-slate-700">
                    <div className="text-white font-semibold text-sm mb-3">Recent Activity</div>
                    <div className="space-y-2">
                      {[
                        { text: 'New service request', time: '2m ago' },
                        { text: 'Rental booking confirmed', time: '1h ago' },
                      ].map((activity, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{activity.text}</span>
                          <span className="text-gray-600">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent corners */}
              <div className="absolute -top-2 -left-2 w-16 h-16 border-t-4 border-l-4 border-[#E8472F] pointer-events-none"></div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-4 border-r-4 border-[#E8472F] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800 py-20 border-t-2 border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-6">
              <Zap className="w-4 h-4 text-[#E8472F]" />
              <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-400 mt-4">Built specifically for equipment dealers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Professional Templates',
                description: 'Choose from 6 industry-tested templates. Fully customizable with your branding, colors, and content.',
              },
              {
                icon: Zap,
                title: 'Complete Management',
                description: 'One dashboard for everything: inventory tracking, rental management, service scheduling, and lead capture.',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Track visitors, conversions, and revenue. Make data-driven decisions with comprehensive reporting.',
              }
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-slate-900 rounded-lg border border-slate-700 p-8 hover:border-[#E8472F] transition-all group">
                  <div className="w-14 h-14 bg-[#2C3E7D] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#E8472F] transition-colors">
                    <Icon className="w-7 h-7 text-[#E8472F] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">Choose the plan that fits your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Basic', price: 'Free', features: ['Website builder', '6 professional templates', 'Contact forms & lead capture'], tier: 'basic' },
              { name: 'Professional', price: '$49', period: '/month', features: ['Everything in Basic', 'Service request management', 'Inventory tracking'], tier: 'pro', popular: true },
              { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Professional', 'Rental management system', 'Advanced analytics dashboard'], tier: 'enterprise' }
            ].map((plan) => (
              <div key={plan.name} className={`bg-slate-800 rounded-lg border-2 ${plan.popular ? 'border-[#E8472F] shadow-xl shadow-[#E8472F]/20' : 'border-slate-700'} p-8 relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#E8472F] text-white text-sm font-bold uppercase tracking-wide rounded">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#E8472F]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#E8472F]"></div>
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/register')}
                  className={`w-full py-3 rounded font-bold transition-all ${
                    plan.popular
                      ? 'bg-[#E8472F] text-white hover:bg-[#D13A24] shadow-lg'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#2C3E7D] to-[#1a2647] py-20 border-t-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Your Website?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of equipment dealers growing their business with FleetMarket
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-10 py-5 bg-[#E8472F] text-white font-bold text-lg rounded hover:bg-[#D13A24] transition-all shadow-2xl inline-flex items-center gap-3"
          >
            Start Building Free
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-8" onError={(e) => {
              // Fallback to text if image doesn't load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} />
            <span className="text-xl font-bold text-gray-400 hidden">
              <span className="text-[#E8472F]">Fleet</span>Market
            </span>
            <p className="text-sm text-gray-500">
              © 2026 FleetMarket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
