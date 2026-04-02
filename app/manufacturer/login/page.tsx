'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

const FM = { navy: '#1E3A6E', navyDark: '#152C54', orange: '#E85525' };

export default function ManufacturerLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }

    setLoading(true);
    setError('');

    // Sign in
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Invalid email or password.' : authError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // Check if user is a manufacturer team member (server-side to bypass RLS)
    const verifyRes = await fetch('/api/manufacturer/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: data.user.id }),
    });

    if (!verifyRes.ok) {
      setError('This account is not linked to a manufacturer. Contact your administrator or Fleet Market support.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Success — redirect to manufacturer dashboard
    router.push('/manufacturer');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(135deg, ${FM.navyDark} 0%, ${FM.navy} 100%)` }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: FM.orange }}>FM</div>
            <div>
              <h1 className="text-xl font-bold text-white">Fleet Market</h1>
              <p className="text-xs text-white/50 uppercase tracking-wider">Manufacturer Portal</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Access your manufacturer dashboard</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': FM.navy } as any}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': FM.navy } as any}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-bold rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: FM.orange }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Not a manufacturer? <a href="/auth/login" className="font-medium" style={{ color: FM.orange }}>Dealer login →</a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">© 2026 Fleet Market. All rights reserved.</p>
      </div>
    </div>
  );
}
