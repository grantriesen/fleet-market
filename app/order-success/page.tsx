'use client';
// app/order-success/page.tsx
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

function OrderSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Brief delay to let webhook process
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            Order ref: {sessionId.slice(-8).toUpperCase()}
          </p>
        )}
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
