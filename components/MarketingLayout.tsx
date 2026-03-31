'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/site-builder',  label: 'Site Builder'       },
  { href: '/templates',     label: 'Templates'           },
  { href: '/features',      label: 'Additional Features' },
  { href: '/pricing',       label: 'Pricing'             },
];

export function MarketingHeader({ activePath }: { activePath?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="bg-[#2C3E7D] border-b-2 border-[#E8472F] relative z-50">
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

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(link => {
                const isActive = activePath === link.href;
                return (
                  <a key={link.href} href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white border-b border-[#E8472F] pb-0.5'
                        : 'text-gray-300 hover:text-white'
                    }`}>
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <a href="/auth/login" className="px-5 py-2 text-gray-300 hover:text-white font-semibold transition-colors hidden md:block">
                Sign In
              </a>
              <a href="/pricing" className="px-6 py-3 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all">
                Get Started
              </a>
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-white hover:text-[#E8472F] transition-colors"
                onClick={() => setMobileOpen(p => !p)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute top-0 right-0 h-full w-72 bg-[#1a2647] border-l-2 border-[#E8472F] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
              <span className="text-white font-bold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col px-6 py-8 gap-1 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E8472F] mb-3">Navigation</p>
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`py-3 px-4 rounded font-medium transition-all ${
                    activePath === link.href
                      ? 'text-white bg-slate-700/50 border-l-2 border-[#E8472F]'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                  }`}>
                  {link.label}
                </a>
              ))}
              <div className="border-t border-slate-700 my-4" />
              <a href="/auth/login" onClick={() => setMobileOpen(false)}
                className="py-3 px-4 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded font-medium transition-all">
                Sign In
              </a>
            </nav>
            <div className="px-6 pb-8">
              <a href="/pricing" onClick={() => setMobileOpen(false)}
                className="block w-full py-4 bg-[#E8472F] text-white font-bold rounded text-center hover:bg-[#d13d25] transition-all">
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-8" onError={(e) => {
            e.currentTarget.style.display = 'none';
            (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
          }} />
          <span className="text-xl font-bold text-gray-400 hidden">
            <span className="text-[#E8472F]">Fleet</span>Market
          </span>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-gray-500">© 2026 FleetMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
