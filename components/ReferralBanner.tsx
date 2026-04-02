'use client';

import { useEffect, useState } from 'react';
import { getReferralCode } from '@/lib/referral';
import { Gift } from 'lucide-react';

/**
 * ReferralBanner — shows a persistent discount banner when a referral code is active.
 * Drop this into any page where you want the dealer to see their discount status.
 * 
 * Usage: <ReferralBanner />
 * 
 * It reads from localStorage (fm_referral_code) and fetches partner info
 * to display the discount details.
 */
export default function ReferralBanner() {
  const [info, setInfo] = useState<{
    partnerName: string;
    isEarlyAdopter: boolean;
    slotsRemaining: number;
    message: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function checkReferral() {
      const code = getReferralCode();
      if (!code) return;

      try {
        const res = await fetch(`/api/partner/referral-info?code=${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          setInfo(data);
        }
      } catch {
        // Silently fail — banner just won't show
      }
    }
    checkReferral();
  }, []);

  if (!info || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-3 relative">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-sm">
        <Gift className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{info.message}</span>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
