// app/auth/verify-success/page.tsx
// User lands here after clicking the email verification link
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

function VerifySuccessContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const supabase    = createClient();
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading');

  useEffect(() => {
    // Supabase automatically handles the token from the URL hash
    // Just check if the user is now verified
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setStatus('verified');
        // Redirect to onboarding after 2 seconds
        setTimeout(() => router.push('/onboarding'), 2000);
      } else {
        setStatus('error');
      }
    };
    checkVerification();
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
          </>
        )}

        {status === 'verified' && (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
            <p className="text-gray-300 mb-6">Your email has been confirmed. Taking you to set up your site...</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className="bg-[#E8472F] h-1.5 rounded-full animate-[loading_2s_ease-in-out]" style={{ width: '100%', transition: 'width 2s' }} />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✗</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
            <p className="text-gray-400 mb-6">The link may have expired. Please try signing up again.</p>
            <button onClick={() => router.push('/register')}
              className="px-6 py-3 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all">
              Back to Sign Up
            </button>
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
