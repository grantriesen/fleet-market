'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onCancel: (reason: string, feedback: string) => Promise<void>;
}

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  currentPlan,
  onCancel
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<'confirm' | 'reason' | 'feedback'>('confirm');
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [cancelling, setCancelling] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    'Too expensive',
    'Not using enough features',
    'Found a better alternative',
    'Technical issues',
    'Business closing',
    'Other'
  ];

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(selectedReason, feedback);
      onClose();
      // Reset state
      setStep('confirm');
      setSelectedReason('');
      setFeedback('');
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setSelectedReason('');
    setFeedback('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">
            {step === 'confirm' && 'Cancel Subscription?'}
            {step === 'reason' && 'Why are you leaving?'}
            {step === 'feedback' && 'Help us improve'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Confirmation */}
          {step === 'confirm' && (
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-slate-700 mb-4">
                    We're sorry to see you go! Are you sure you want to cancel your <strong>{currentPlan}</strong> subscription?
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-900">Your site will remain active until the end of your billing period</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-900">You can reactivate anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-900">No immediate data loss</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => setStep('reason')}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
                >
                  Continue Cancellation
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Reason */}
          {step === 'reason' && (
            <div>
              <p className="text-slate-600 mb-4">
                Help us understand why you're leaving so we can improve.
              </p>
              
              <div className="space-y-2 mb-6">
                {reasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-[#2C3E7D] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-5 h-5 text-[#2C3E7D]"
                    />
                    <span className="font-medium text-slate-800">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('feedback')}
                  disabled={!selectedReason}
                  className="flex-1 px-4 py-3 bg-[#2C3E7D] text-white font-semibold rounded-lg hover:bg-[#1e2b5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Feedback */}
          {step === 'feedback' && (
            <div>
              <p className="text-slate-600 mb-4">
                We'd love to hear any additional feedback you have. This is optional but very helpful!
              </p>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2C3E7D] focus:border-transparent mb-6 resize-none"
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Final confirmation:</strong> Your subscription will be cancelled and you'll lose access to premium features at the end of your billing period.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('reason')}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
