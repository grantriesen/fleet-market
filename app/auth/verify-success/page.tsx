// app/auth/verify-success/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

function VerifySuccessContent() {
  const router   = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // getSession() triggers Supabase to exchange the #access_token hash from the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setErrorMsg(error.message);
          setStatus('error');
          return;
        }

        if (session?.user?.email_confirmed_at) {
          setStatus('verified');
          return;
        }

        // Fallback: listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (session?.user?.email_confirmed_at) {
              setStatus('verified');
              subscription.unsubscribe();
            }
          }
        });

        // Timeout after 5s
        setTimeout(() => {
          setStatus(prev => {
            if (prev === 'loading') {
              setErrorMsg('The link may have expired or already been used.');
              return 'error';
            }
            return prev;
          });
          subscription.unsubscribe();
        }, 5000);

      } catch (err: any) {
        setErrorMsg(err.message || 'Something went wrong');
        setStatus('error');
      }
    };

    handleVerification();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border-2 border-[#E8472F] p-12 text-center max-w-lg w-full">
        <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-10 mx-auto mb-8"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#E8472F] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
            <p className="text-gray-400">Just a moment.</p>
          </>
        )}

        {status === 'verified' && (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
            <p className="text-gray-300 mb-6">
              Your email has been confirmed.
            </p>

            {/* Phone-friendly message */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-4">
              <p className="text-white font-semibold text-sm mb-1">✅ You can close this tab</p>
              <p className="text-gray-400 text-sm">
                Head back to the browser where you signed up — it will continue automatically.
              </p>
            </div>

            {/* Fallback if they're on desktop */}
            <button
              onClick={() => router.push('/onboarding')}
              className="text-[#E8472F] text-sm hover:underline font-medium"
            >
              Continue to setup →
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-red-400">✗</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
            <p className="text-gray-400 mb-2">The link may have expired or already been used.</p>
            {errorMsg && <p className="text-red-400 text-sm mb-6">{errorMsg}</p>}
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/register')}
                className="px-6 py-3 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all">
                Back to Sign Up
              </button>
              <button onClick={() => router.push('/auth/login')}
                className="px-6 py-3 border border-slate-600 text-gray-400 font-medium rounded hover:border-slate-500 hover:text-white transition-all">
                Sign In Instead
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <VerifySuccessContent />
    </Suspense>
  );
}
