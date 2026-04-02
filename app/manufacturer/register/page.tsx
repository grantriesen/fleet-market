'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const FM = { navy: '#1E3A6E', navyDark: '#152C54', orange: '#E85525' };

export default function ManufacturerRegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][Math.min(passwordStrength, 4)];
  const strengthColor = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][Math.min(passwordStrength, 4)];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!companyName.trim()) { setError('Company name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return; }

    setLoading(true);

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: 'manufacturer',
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // 2. Create or find the manufacturer_partners record for this company
    // Use a server-side API to do this with service role key
    const res = await fetch('/api/manufacturer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: authData.user.id,
        full_name: fullName,
        company_name: companyName,
        email,
        phone: phone || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      setError(err.error || 'Failed to create manufacturer account.');
      setLoading(false);
      return;
    }

    // 3. Show verification step
    setStep('verify');
    setLoading(false);
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(135deg, ${FM.navyDark} 0%, ${FM.navy} 100%)` }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 mb-6">
              We sent a verification code to <strong>{email}</strong>. Enter it to activate your manufacturer account.
            </p>
            <a
              href="/manufacturer/login"
              className="inline-flex items-center justify-center w-full py-3 text-white font-bold rounded-lg text-sm transition-opacity hover:opacity-90"
              style={{ background: FM.orange }}
            >
              Go to Login
            </a>
            <p className="text-xs text-slate-400 mt-4">
              Didn't receive it? Check your spam folder or try registering again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: `linear-gradient(135deg, ${FM.navyDark} 0%, ${FM.navy} 100%)` }}>
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

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-6">Set up your manufacturer dashboard on Fleet Market</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': FM.navy } as any}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Toro Company"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': FM.navy } as any}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': FM.navy } as any}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': FM.navy } as any}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 12 characters"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                  style={{ '--tw-ring-color': FM.navy } as any}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < passwordStrength ? strengthColor : '#e2e8f0' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 12}
              className="w-full py-3 text-white font-bold rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: FM.orange }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Create Manufacturer Account'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Already have an account? <a href="/manufacturer/login" className="font-medium" style={{ color: FM.orange }}>Sign in →</a>
            </p>
            <p className="text-xs text-slate-400">
              Looking for dealer signup? <a href="/register" className="font-medium" style={{ color: FM.orange }}>Dealer registration →</a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">© 2026 Fleet Market. All rights reserved.</p>
      </div>
    </div>
  );
}
