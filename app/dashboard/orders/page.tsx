'use client';
// app/dashboard/orders/page.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Package, CheckCircle, XCircle, Clock, Loader2, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Order {
  id: string;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  items: any[];
  total: number;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:   { label: 'Pending',   color: '#d97706', bg: '#fffbeb', icon: Clock         },
  paid:      { label: 'Paid',      color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle   },
  fulfilled: { label: 'Fulfilled', color: '#2563eb', bg: '#eff6ff', icon: Package       },
  canceled:  { label: 'Canceled',  color: '#6b7280', bg: '#f9fafb', icon: XCircle       },
  refunded:  { label: 'Refunded',  color: '#dc2626', bg: '#fef2f2', icon: XCircle       },
};

function OrdersPageInner() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [site, setSite] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { loadOrders(); }, []);

  // Mark inventory-related lead_captures as read when this page is visited
  useEffect(() => {
    if (!site) return;
    const INVENTORY_SOURCES = ['product_quote_request', 'order', 'inventory'];
    supabase.from('lead_captures').update({ read: true }).eq('site_id', site.id).eq('read', false).in('source', INVENTORY_SOURCES);
  }, [site]);

  async function loadOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: userSite } = await supabase
        .from('sites').select('*').eq('user_id', user.id).maybeSingle();
      if (!userSite) { router.push('/onboarding'); return; }
      setSite(userSite);

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('site_id', userSite.id)
        .order('created_at', { ascending: false });

      const loaded = orderData || [];
      setOrders(loaded);
      // Auto-select from ?highlight= param
      const highlightId = searchParams?.get('highlight') || new URLSearchParams(window.location.search).get('highlight');
      if (highlightId) {
        const found = loaded.find((o: any) => o.id === highlightId);
        if (found) setSelectedOrder(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status } : prev);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    pending: orders.filter(o => o.status === 'pending').length,
    revenue: orders.filter(o => ['paid', 'fulfilled'].includes(o.status)).reduce((s, o) => s + (o.total / 100), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-500">{site?.site_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Paid',         value: stats.paid,    icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending',      value: stats.pending, icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Revenue',      value: '$' + stats.revenue.toLocaleString(), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm">Orders will appear here when customers complete a purchase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders list */}
            <div className="lg:col-span-2 space-y-3">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <button key={order.id} onClick={() => setSelectedOrder(order)}
                    className={`w-full bg-white rounded-xl border p-5 text-left hover:shadow-md transition-shadow ${selectedOrder?.id === order.id ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{order.customer_name || order.customer_email}</p>
                        <p className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · ${(order.total / 100).toLocaleString()}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                  </button>
                );
              })}
            </div>

            {/* Order detail */}
            {selectedOrder ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3 mb-6 text-sm">
                  <div><span className="text-gray-500">Customer</span><p className="font-medium">{selectedOrder.customer_name || '—'}</p></div>
                  <div><span className="text-gray-500">Email</span><p className="font-medium">{selectedOrder.customer_email}</p></div>
                  {selectedOrder.customer_phone && <div><span className="text-gray-500">Phone</span><p className="font-medium">{selectedOrder.customer_phone}</p></div>}
                  {selectedOrder.customer_address && <div><span className="text-gray-500">Address</span><p className="font-medium">{selectedOrder.customer_address}</p></div>}
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.title} × {item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-sm pt-2 border-t">
                      <span>Total</span>
                      <span>${(selectedOrder.total / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.stripe_payment_intent_id && (
                  <a href={`https://dashboard.stripe.com/payments/${selectedOrder.stripe_payment_intent_id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-600 hover:underline mb-4">
                    <ExternalLink className="w-3 h-3" /> View in Stripe
                  </a>
                )}

                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(['paid', 'fulfilled', 'canceled', 'refunded'] as const).map(s => (
                      <button key={s} onClick={() => updateStatus(selectedOrder.id, s)}
                        disabled={selectedOrder.status === s}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedOrder.status === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center text-gray-400 text-sm">
                Select an order to view details
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>}>
      <OrdersPageInner />
    </Suspense>
  );
}
