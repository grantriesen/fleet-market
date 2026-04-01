// lib/referral.ts
// Shared utilities for referral code handling

export const REFERRAL_KEY = 'fm_referral_code';

export function storeReferralCode(code: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFERRAL_KEY, code.toUpperCase());
  }
}

export function getReferralCode(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFERRAL_KEY);
  }
  return null;
}

export function clearReferralCode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFERRAL_KEY);
  }
}
