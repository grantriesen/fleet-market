'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('=== SIGNUP DEBUG ===');
      console.log('1. Starting signUp...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            phone: phone,
          }
        }
      });

      console.log('2. signUp response:', { 
        user: authData?.user?.id, 
        session: !!authData?.session,
        sessionToken: authData?.session?.access_token?.slice(0, 20) + '...',
        error: authError 
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if we have a session
        if (!authData.session) {
          console.log('3. No session from signUp — forcing signIn...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          console.log('4. signIn response:', { 
            session: !!signInData?.session, 
            sessionToken: signInData?.session?.access_token?.slice(0, 20) + '...',
            error: signInError 
          });
          if (signInError) {
            console.log('5. signIn FAILED:', signInError.message);
            throw signInError;
          }
        }

        // Verify session exists now
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('6. Current session check:', { 
          hasSession: !!currentSession, 
          userId: currentSession?.user?.id,
          expiresAt: currentSession?.expires_at 
        });

        // Check cookies
        console.log('7. Document cookies:', document.cookie);

        setSuccess(true);
        console.log('8. Redirecting to /onboarding in 2 seconds...');

        setTimeout(() => {
          console.log('9. NOW redirecting to /onboarding');
          window.location.href = '/onboarding';
        }, 2000);
      } else {
        console.log('3. No user returned from signUp');
      }
    } catch (err: any) {
      console.error('SIGNUP ERROR:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  // Shared input styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#0f172a',
    border: '1px solid #475569',
    borderRadius: '0.5rem',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontSize: '0.9375rem',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#E8472F';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(232,71,47,0.2)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#475569';
    e.currentTarget.style.boxShadow = 'none';
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
          <h2 className="text-2xl font-bold text-white mb-1">Create Your Account</h2>
          <p style={{ color: '#94a3b8' }} className="text-sm">Get your dealership online today</p>
        </div>

        {/* Sign Up Form */}
        <div className="rounded-lg shadow-2xl p-8" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(232,71,47,0.15)' }}>
                <svg className="w-8 h-8" style={{ color: '#E8472F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Account Created!</h3>
              <p style={{ color: '#94a3b8' }} className="mb-4">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold mb-1.5" style={{ color: '#cbd5e1' }}>
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  style={inputStyle}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold mb-1.5" style={{ color: '#cbd5e1' }}>
                  Company / Dealership Name *
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  style={inputStyle}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Smith's Power Equipment"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: '#cbd5e1' }}>
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-1.5" style={{ color: '#cbd5e1' }}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  style={inputStyle}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: '#cbd5e1' }}>
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  style={inputStyle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>Must be at least 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
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
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>

              <p className="text-xs text-center mt-3" style={{ color: '#64748b' }}>
                By signing up, you agree to our{' '}
                <Link href="/terms" className="hover:underline" style={{ color: '#E8472F' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="hover:underline" style={{ color: '#E8472F' }}>
                  Privacy Policy
                </Link>
              </p>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold hover:opacity-80 transition-colors" style={{ color: '#E8472F' }}>
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm" style={{ color: '#475569' }}>
          <p>🔒 Your data is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}
