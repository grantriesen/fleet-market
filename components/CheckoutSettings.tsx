'use client';
// components/CheckoutSettings.tsx
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ShoppingCart, MessageSquare, ExternalLink, CheckCircle, Loader2, AlertCircle, Unlink } from 'lucide-react';

interface CheckoutSettingsProps {
  siteId: string;
  initialMode: 'online' | 'quote_only';
  stripeAccountId: string | null;
}

export default function CheckoutSettings({ siteId, initialMode, stripeAccountId: initialStripeAccountId }: CheckoutSettingsProps) {
  const supabase = createClient();
  const [mode, setMode] = useState<'online' | 'quote_only'>(initialMode);
  const [stripeAccountId, setStripeAccountId] = useState(initialStripeAccountId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const isStripeConnected = !!stripeAccountId;

  async function handleModeChange(newMode: 'online' | 'quote_only') {
    setMode(newMode);
    setSaving(true);
    setSaved(false);
    await supabase.from('sites').update({ checkout_mode: newMode }).eq('id', siteId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/stripe/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStripeAccountId(null);
        setMode('quote_only');
        setShowDisconnectConfirm(false);
      } else {
        alert(data.error || 'Failed to disconnect. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Checkout Mode</h3>
        <p className="text-sm text-gray-500 mb-4">Choose how customers interact with your inventory listings.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quote Only */}
          <button onClick={() => handleModeChange('quote_only')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'quote_only' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${mode === 'quote_only' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <MessageSquare className={`w-5 h-5 ${mode === 'quote_only' ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <p className={`font-semibold mb-1 ${mode === 'quote_only' ? 'text-green-700' : 'text-gray-900'}`}>Quote Requests Only</p>
            <p className="text-xs text-gray-500">Customers fill out a contact form to inquire about products. No online payment.</p>
          </button>

          {/* Online Checkout */}
          <button onClick={() => handleModeChange('online')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'online' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'} ${!isStripeConnected ? 'opacity-60' : ''}`}
            disabled={!isStripeConnected}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${mode === 'online' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <ShoppingCart className={`w-5 h-5 ${mode === 'online' ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <p className={`font-semibold mb-1 ${mode === 'online' ? 'text-green-700' : 'text-gray-900'}`}>Online Checkout</p>
            <p className="text-xs text-gray-500">Customers can add to cart and purchase directly. Requires Stripe connection.</p>
            {!isStripeConnected && (
              <p className="text-xs text-amber-600 font-medium mt-1">⚠ Connect Stripe to enable</p>
            )}
          </button>
        </div>

        {(saving || saved) && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${saved ? 'text-green-600' : 'text-gray-500'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Saved'}
          </div>
        )}
      </div>

      {/* Stripe Connect */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-1">Stripe Account</h3>
        <p className="text-sm text-gray-500 mb-4">Connect your Stripe account to accept online payments from customers.</p>

        {isStripeConnected ? (
          <div>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-800 text-sm">Stripe Connected</p>
                <p className="text-xs text-green-600 font-mono">{stripeAccountId}</p>
              </div>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-green-700 hover:underline">
                Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {!showDisconnectConfirm ? (
              <button onClick={() => setShowDisconnectConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
                <Unlink className="w-4 h-4" />
                Disconnect Stripe Account
              </button>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm font-semibold text-red-800 mb-1">Disconnect Stripe?</p>
                <p className="text-xs text-red-600 mb-3">This will disable online checkout and revert to quote requests only. Existing orders are not affected.</p>
                <div className="flex gap-2">
                  <button onClick={handleDisconnect} disabled={disconnecting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
                    {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                    {disconnecting ? 'Disconnecting...' : 'Yes, Disconnect'}
                  </button>
                  <button onClick={() => setShowDisconnectConfirm(false)}
                    className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">You need a Stripe account to accept online payments. Payments go directly to your account — Fleet Market doesn't take a cut of your sales.</p>
            </div>
            <a href="/api/stripe/connect"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#635BFF] text-white rounded-xl font-semibold text-sm hover:bg-[#5851DF] transition-colors">
              Connect Stripe Account
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
