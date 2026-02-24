'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CreditCard, 
  Building, 
  Mail, 
  Phone, 
  Save, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Crown,
  Calendar,
  DollarSign
} from 'lucide-react';
import { getPlanById, SubscriptionTier } from '@/lib/pricing-config';
import CancelSubscriptionModal from '@/components/CancelSubscriptionModal';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
}

interface Site {
  id: string;
  site_name: string;
  subscription_tier: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setCompanyName(profile.company_name || '');
      } else {
        // Create profile if it doesn't exist
        setUser({
          id: authUser.id,
          email: authUser.email!,
          full_name: null,
          phone: null,
          company_name: null
        });
      }

      // Load site data
      const { data: userSite } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (userSite) {
        setSite(userSite);
      }

    } catch (error) {
      console.error('Error loading account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName || null,
          phone: phone || null,
          company_name: companyName || null
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Reload data
      await loadAccountData();
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async (reason: string, feedback: string) => {
    if (!site) return;

    try {
      // TODO: Implement actual cancellation logic
      // For now, just downgrade to basic
      const { error } = await supabase
        .from('sites')
        .update({ subscription_tier: 'basic' })
        .eq('id', site.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Subscription cancelled. Your site will remain active until the end of your billing period.' });
      setShowCancelModal(false);
      await loadAccountData();
    } catch (error) {
      console.error('Error cancelling:', error);
      setMessage({ type: 'error', text: 'Failed to cancel subscription. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8472F]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentPlan = site ? getPlanById(site.subscription_tier as SubscriptionTier) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-slate-600 mt-1">Manage your profile and subscription</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600">{user.email}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="flex-1 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Company Name
                </label>
                <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <Building className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Lawn Care"
                    className="flex-1 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subscription */}
          {site && currentPlan && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Subscription</h2>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-[#E8472F]" />
                      <h3 className="text-lg font-bold text-slate-800">{currentPlan.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-800">
                        ${currentPlan.monthlyPrice}
                      </span>
                      <span className="text-slate-600">/month</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-4 py-2 bg-[#E8472F] text-white font-semibold rounded-lg hover:bg-[#D13A24] transition-all"
                  >
                    Add Features
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      Member since {new Date(site.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Billed monthly</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Your Plan Includes:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {currentPlan.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature.replace('✨ ', '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cancel */}
              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Sign Out</h2>
                <p className="text-sm text-slate-600 mt-1">Sign out of your Fleet Market account on this device.</p>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-sm text-slate-600 mb-4">
              Once you delete your account, there is no going back. This will permanently delete your site, data, and cancel your subscription.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        currentPlan={currentPlan?.name || 'Base Package'}
        onCancel={handleCancelSubscription}
      />
    </div>
  );
}
