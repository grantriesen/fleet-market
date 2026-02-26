'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

const PLAN_INFO: Record<string, { name: string; price: string; description: string }> = {
  base: { name: 'Base Package', price: '$200/mo', description: 'Professional dealer website with templates, forms & lead capture' },
  plus1: { name: 'Base + 1 Add-on', price: '$300/mo', description: 'Base package plus your choice of Inventory, Service, or Rentals' },
  full: { name: 'Full Suite', price: '$430/mo', description: 'Everything included — Inventory, Service scheduling & Rental booking' },
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const selectedPlan = searchParams.get('plan');
  const planDetails = selectedPlan ? PLAN_INFO[selectedPlan] : null;
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ User created:', data.user.id);
        setSuccess(true);
        // Redirect to onboarding after brief success message
        setTimeout(() => {
          router.push(selectedPlan ? `/onboarding?plan=${selectedPlan}` : '/onboarding');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-slate-800 rounded-lg border-2 border-[#E8472F] p-12">
            <div className="w-20 h-20 bg-[#E8472F] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Account Created!</h2>
            <p className="text-gray-400">
              Redirecting you to set up your website...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Benefits */}
          <div className="hidden lg:block">
            <div className="mb-8">
              <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-12 mb-6" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }} />
              <span className="text-2xl font-bold text-white uppercase tracking-tight hidden">
                <span className="text-[#E8472F]">Fleet</span>Market
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              Start Building Your Professional Website Today
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Get your dealership online with a professional website and powerful management tools
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                'Professional templates designed for equipment dealers',
                'Complete inventory and rental management',
                'Built-in service scheduling and lead capture',
                'Real-time analytics and reporting',
                'Set up in as little as 15 minutes'
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E8472F]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#E8472F]"></div>
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-700">
              {[
                { value: '15 min', label: 'Setup Time' },
                { value: '6', label: 'Pro Templates' },
                { value: '24/7', label: 'Your Site Works' }
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-[#E8472F] mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="bg-slate-800 rounded-lg border-2 border-slate-700 p-8 lg:p-12">
            {/* Selected Plan Banner */}
            {planDetails && (
              <div className="mb-6 p-4 bg-[#E8472F]/10 border border-[#E8472F]/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#E8472F] font-bold text-sm uppercase tracking-wide">Selected Plan</span>
                  <span className="text-white font-bold">{planDetails.price}</span>
                </div>
                <div className="text-white font-semibold">{planDetails.name}</div>
                <div className="text-gray-400 text-sm mt-1">{planDetails.description}</div>
                <button
                  onClick={() => router.push('/#pricing')}
                  className="text-[#E8472F] text-xs font-medium mt-2 hover:underline"
                >
                  Change plan
                </button>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-gray-400">
                {planDetails ? `Sign up to get started with ${planDetails.name}` : 'Get started with your account in seconds'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all"
                    minLength={6}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all"
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#D13A24] disabled:bg-gray-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-[#E8472F] font-semibold hover:text-[#D13A24] transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-[#E8472F] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#E8472F] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
