'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      alert('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#0f172a' }}>
      {/* Industrial texture */}
      <div className="absolute inset-0" style={{
        opacity: 0.03,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
      }} />
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#E8472F' }} />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-5">
            <img
              src="/fmlogo3.jpg"
              alt="Fleet Market"
              className="h-14 mx-auto"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="items-center justify-center gap-2" style={{ display: 'none' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#2C3E7D' }}>
                <span className="text-white font-black text-lg">FM</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Fleet</span>
                <span className="text-2xl font-bold" style={{ color: '#E8472F' }}>Market</span>
              </div>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
          <p style={{ color: '#94a3b8' }} className="text-sm">Log in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg shadow-2xl p-8" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: '#cbd5e1' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: '#0f172a',
                  border: '1px solid #475569',
                  color: '#f1f5f9',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#E8472F';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(232,71,47,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#475569';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold" style={{ color: '#cbd5e1' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: '#E8472F' }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: '#0f172a',
                  border: '1px solid #475569',
                  color: '#f1f5f9',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#E8472F';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(232,71,47,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#475569';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? '#64748b' : '#E8472F',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#D13A24'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#E8472F'; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </>
              ) : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#E8472F' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm" style={{ color: '#475569' }}>
          <p>🔒 Your data is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}
