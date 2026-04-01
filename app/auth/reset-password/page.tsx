// app/auth/reset-password/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 12)           errors.push('At least 12 characters');
  if (!/[A-Z]/.test(pw))        errors.push('One uppercase letter');
  if (!/[0-9]/.test(pw))        errors.push('One number');
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push('One special character');
  return errors;
}

function ResetPasswordContent() {
  const router   = useRouter();
  const supabase = createClient();

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);
  const [ready,           setReady]           = useState(false);

  useEffect(() => {
    // Supabase handles the recovery token from the URL automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
  }, []);

  const requirements = [
    { label: '12+ characters',    met: password.length >= 12 },
    { label: 'Uppercase letter',  met: /[A-Z]/.test(password) },
    { label: 'Number',            met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const metCount = requirements.filter(r => r.met).length;

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) { setError(`Password requires: ${pwErrors.join(', ')}`); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl border-2 border-emerald-500 p-12 text-center max-w-md w-full">
          <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-10 mx-auto mb-8"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Password Updated!</h2>
          <p className="text-gray-400">Taking you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-12 mx-auto mb-6"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
          <p className="text-gray-400">Choose a new password for your Fleet Market account.</p>
        </div>

        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-8">
          {!ready ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#E8472F] mx-auto mb-4" />
              <p className="text-gray-400">Validating reset link...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/40 rounded text-red-400 text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
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
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[0,1,2,3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          i < metCount
                            ? metCount === 4 ? 'bg-emerald-500' : metCount >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                            : 'bg-slate-700'
                        }`} />
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
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-900 border rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E8472F] focus:border-transparent transition-all ${
                      confirmPassword && confirmPassword !== password ? 'border-red-500' : 'border-slate-700'
                    }`} />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-[#E8472F] text-white font-bold rounded hover:bg-[#D13A24] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
