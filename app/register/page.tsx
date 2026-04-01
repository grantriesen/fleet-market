'use client';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle, Package, Wrench, Truck } from 'lucide-react';
import { storeReferralCode } from '@/lib/referral';

const ADDON_LABELS: Record<string, { label: string; Icon: any }> = {
  inventory: { label: 'Inventory Management', Icon: Package },
  service:   { label: 'Service Scheduling',   Icon: Wrench  },
  rentals:   { label: 'Rental Management',    Icon: Truck   },
};

function getAddonPrice(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 130;
  if (count === 2) return 240;
  return 280;
}

function RegisterContent() {
  const router    = useRouter();
  const params    = useSearchParams();
  const supabase  = createClient();

  const addonsParam    = params.get('addons') || '';
  const selectedAddons = addonsParam ? addonsParam.split(',').filter(Boolean) : [];
  const refCode        = params.get('ref') || '';

  // Store referral code in localStorage so onboarding can apply it after site creation
  if (refCode) storeReferralCode(refCode);
  const addonPrice     = getAddonPrice(selectedAddons.length);
  const total          = 230 + addonPrice;

  const [fullName,         setFullName]         = useState('');
  const [email,            setEmail]            = useState('');
  const [password,         setPassword]         = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6)          { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess(true);
        const addonParam = selectedAddons.length > 0 ? `?addons=${selectedAddons.join(',')}` : '';
        const refParam   = refCode ? `${addonParam ? '&' : '?'}ref=${refCode}` : '';
        setTimeout(() => router.push(`/onboarding${addonParam}${refParam}`), 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg border-2 border-[#E8472F] p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-[#E8472F] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-gray-400">Taking you to your site setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* ── Left: Branding + plan summary ── */}
        <div className="hidden lg:block">
          <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-12 mb-8"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />

          <h1 className="text-4xl font-bold text-white mb-4">
            One more step — create your account
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Your plan is locked in. Create an account, pick your template, and you'll be live in minutes.
          </p>

          {/* Plan summary card */}
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
                  <span className="text-gray-400 text-sm">
                    {selectedAddons.length === 1 ? 'Add-on' : `${selectedAddons.length}-add-on bundle`}
                  </span>
                  <span className="text-[#E8472F] font-bold">+${addonPrice}/mo</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600">
              <span className="text-white font-bold">Total</span>
              <span className="text-white font-bold text-xl">${total}/mo</span>
            </div>
          </div>

          <button onClick={() => router.push('/pricing')}
            className="text-[#E8472F] text-sm font-medium hover:underline">
            ← Change plan
          </button>
        </div>

        {/* ── Right: Form ── */}
        <div className="bg-slate-800 rounded-lg border-2 border-slate-700 p-8 lg:p-12">
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#E8472F] uppercase tracking-wider mb-1">Step 1 of 3</p>
            <h2 className="text-3xl font-bold text-white mb-1">Create Your Account</h2>
            <p className="text-gray-400 text-sm">You'll pick your template and complete payment next.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/40 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            {[
              { label: 'Full Name',        value: fullName,        set: setFullName,        type: 'text',     icon: User,  placeholder: 'John Smith'        },
              { label: 'Email Address',    value: email,           set: setEmail,           type: 'email',    icon: Mail,  placeholder: 'you@company.com'   },
              { label: 'Password',         value: password,        set: setPassword,        type: 'password', icon: Lock,  placeholder: '••••••••'          },
              { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, type: 'password', icon: Lock,  placeholder: '••••••••'          },
            ].map(({ label, value, set, type, icon: Icon, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={type} value={value} onChange={e => set(e.target.value)}
                    required placeholder={placeholder} minLength={type === 'password' ? 6 : undefined}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#D13A24] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</>
                : <>Create Account <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => router.push('/login')}
                className="text-[#E8472F] font-semibold hover:underline">Sign in</button>
            </p>
            <p className="text-xs text-gray-500">
              By creating an account you agree to our{' '}
              <a href="#" className="text-[#E8472F] hover:underline">Terms</a> and{' '}
              <a href="#" className="text-[#E8472F] hover:underline">Privacy Policy</a>
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
