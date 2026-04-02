'use client';

import { Suspense, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle, Package, Wrench, Truck, Eye, EyeOff } from 'lucide-react';
import { storeReferralCode } from '@/lib/referral';

const ADDON_LABELS: Record<string, { label: string; Icon: any }> = {
  inventory: { label: 'Inventory Management', Icon: Package },
  service:   { label: 'Service Scheduling',   Icon: Wrench  },
  rentals:   { label: 'Rental Management',    Icon: Truck   },
};

function getAddonPrice(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 130;
  if (count === 2) return 215;
  return 280;
}

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 12)           errors.push('At least 12 characters');
  if (!/[A-Z]/.test(pw))        errors.push('One uppercase letter');
  if (!/[0-9]/.test(pw))        errors.push('One number');
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push('One special character');
  return errors;
}

function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { label: '12+ characters',      met: password.length >= 12 },
    { label: 'Uppercase letter',    met: /[A-Z]/.test(password) },
    { label: 'Number',              met: /[0-9]/.test(password) },
    { label: 'Special character',   met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  const metCount = requirements.filter(r => r.met).length;
  const strength = metCount === 4 ? 'strong' : metCount >= 2 ? 'medium' : 'weak';
  const colors = { weak: 'bg-red-500', medium: 'bg-yellow-500', strong: 'bg-emerald-500' };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < metCount ? colors[strength] : 'bg-slate-700'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {requirements.map(req => (
          <div key={req.label} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-emerald-400' : 'text-gray-500'}`}>
            <span>{req.met ? '✓' : '○'}</span>{req.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function RegisterContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const supabase = createClient();

  const addonsParam    = params.get('addons') || '';
  const selectedAddons = addonsParam ? addonsParam.split(',').filter(Boolean) : [];
  const refCode        = params.get('ref') || '';
  const promoCodeId    = params.get('promo') || '';
  if (refCode) storeReferralCode(refCode);
  if (promoCodeId && typeof window !== 'undefined') sessionStorage.setItem('fm_promo_code_id', promoCodeId);

  const addonPrice = getAddonPrice(selectedAddons.length);
  const total      = 230 + addonPrice;

  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);
  const [otpSent,         setOtpSent]         = useState(false);
  const [otp,             setOtp]             = useState('');
  const [otpError,        setOtpError]        = useState('');
  const [verifying,       setVerifying]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) { setError(`Password requires: ${pwErrors.join(', ')}`); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      // Create the account — Supabase sends a 6-digit OTP code to the email
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        setSuccess(true);
        setOtpSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpError('');
    if (otp.length < 6) { setOtpError('Please enter the full 6-digit code'); return; }
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });
      if (error) throw error;
      // Verified — proceed to onboarding
      const addonParam = selectedAddons.length > 0 ? `?addons=${selectedAddons.join(',')}` : '';
      const refParam   = refCode ? `${addonParam ? '&' : '?'}ref=${refCode}` : '';
      router.push(`/onboarding${addonParam}${refParam}`);
    } catch (err: any) {
      setOtpError(err.message?.includes('expired') ? 'Code expired — request a new one below.' : 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function resendOtp() {
    setOtpError('');
    try {
      await supabase.auth.resend({ type: 'signup', email });
      setOtpError('New code sent! Check your email.');
    } catch (err: any) {
      setOtpError('Could not resend code. Try again in a moment.');
    }
  }

  // OTP flow — no polling needed

  // OTP entry screen
  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl border-2 border-[#E8472F] p-10 text-center max-w-md w-full">
          <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-10 mx-auto mb-8"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <div className="w-16 h-16 bg-[#E8472F]/10 border-2 border-[#E8472F] rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#E8472F]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400 text-sm mb-1">We sent a 6-digit verification code to</p>
          <p className="text-white font-semibold mb-6">{email}</p>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* OTP input — large digits */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-[#E8472F] focus:outline-none transition-colors"
            />

            {otpError && (
              <p className={`text-sm ${otpError.includes('sent') ? 'text-emerald-400' : 'text-red-400'}`}>
                {otpError}
              </p>
            )}

            <button type="submit" disabled={verifying || otp.length < 6}
              className="w-full py-4 bg-[#E8472F] text-white font-bold rounded-lg hover:bg-[#D13A24] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {verifying ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <>Verify Email <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 space-y-2 text-xs text-gray-500">
            <p>Didn't get a code? Check your spam folder.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={resendOtp} className="text-[#E8472F] hover:underline">Resend code</button>
              <span>·</span>
              <button onClick={() => { setSuccess(false); setOtp(''); setOtpError(''); }} className="text-[#E8472F] hover:underline">Use a different email</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left: Branding */}
        <div className="hidden lg:block">
          <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-12 mb-8"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-4xl font-bold text-white mb-4">One more step — create your account</h1>
          <p className="text-lg text-gray-300 mb-8">Your plan is locked in. Create an account, verify your email, and you'll be live in minutes.</p>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Plan</p>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700">
              <span className="text-white font-medium">Fleet Market Base</span>
              <span className="text-white font-bold">$230/mo</span>
            </div>
            {selectedAddons.length > 0 && (
              <>
                {selectedAddons.map(key => {
                  const info = ADDON_LABELS[key];
                  if (!info) return null;
                  return (
                    <div key={key} className="flex items-center gap-2 mb-2">
                      <info.Icon className="w-4 h-4 text-[#E8472F]" />
                      <span className="text-gray-300 text-sm">{info.label}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                  <span className="text-gray-400 text-sm">{selectedAddons.length === 1 ? 'Add-on' : `${selectedAddons.length}-add-on bundle`}</span>
                  <span className="text-[#E8472F] font-bold">+${addonPrice}/mo</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600">
              <span className="text-white font-bold">Total</span>
              <span className="text-white font-bold text-xl">${total}/mo</span>
            </div>
          </div>
          <button onClick={() => router.push('/pricing')} className="text-[#E8472F] text-sm font-medium hover:underline">← Change plan</button>
        </div>

        {/* Right: Form */}
        <div className="bg-slate-800 rounded-lg border-2 border-slate-700 p-8 lg:p-12">
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#E8472F] uppercase tracking-wider mb-1">Step 1 of 3</p>
            <h2 className="text-3xl font-bold text-white mb-1">Create Your Account</h2>
            <p className="text-gray-400 text-sm">You'll verify your email, then pick your template and pay.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/40 rounded text-red-400 text-sm">{error}</div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                  placeholder="John Smith"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-900 border rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all ${
                    confirmPassword && confirmPassword !== password ? 'border-red-500' : 'border-slate-700'
                  }`} />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#D13A24] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => router.push('/auth/login')} className="text-[#E8472F] font-semibold hover:underline">Sign in</button>
            </p>
            <p className="text-xs text-gray-500">
              By creating an account you agree to our{' '}
              <a href="/terms" className="text-[#E8472F] hover:underline">Terms</a> and{' '}
              <a href="/privacy" className="text-[#E8472F] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
