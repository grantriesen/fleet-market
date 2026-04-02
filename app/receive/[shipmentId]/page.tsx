'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import {
  Package, CheckCircle2, Loader2, DollarSign, AlertCircle,
  Truck, ChevronLeft, ScanLine, X, Check, Star
} from 'lucide-react';

const FM = { navy: '#1E3A6E', navyDark: '#152C54', orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.1)' };

interface ShipmentItem {
  id: string;
  title: string;
  model: string | null;
  sku: string | null;
  category: string | null;
  description: string | null;
  primary_image: string | null;
  images: string[];
  specifications: Record<string, string>;
  msrp: number | null;
  dealer_cost: number | null;
  quantity: number;
  brand_name: string | null;
  serial_numbers: string | null;
  received_inventory_ids: string[];
}

interface Shipment {
  id: string;
  shipment_code: string;
  status: string;
  notes: string | null;
  item_count: number;
  shipped_at: string | null;
  received_at: string | null;
  created_at: string;
  partner: { company_name: string } | null;
  site_id: string;
}

// Per-item overrides the dealer fills in during receiving
interface ItemOverride {
  price: number | null;       // listing price (can default to MSRP)
  purchase_price: number | null; // cost basis (can default to dealer_cost)
  is_allocated: boolean;
  include: boolean;           // toggle to skip items
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

export default function ReceiveShipmentPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.shipmentId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [overrides, setOverrides] = useState<Record<string, ItemOverride>>({});
  const [receiving, setReceiving] = useState(false);
  const [received, setReceived] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [siteId, setSiteId] = useState<string | null>(null);

  // Load shipment data
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      // Auth check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Save intended destination and redirect to login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('receive_redirect', window.location.pathname);
        }
        router.push('/auth/login');
        return;
      }

      // Get the user's site
      const { data: site } = await supabase
        .from('sites')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!site) {
        setError('No site found for your account.');
        setLoading(false);
        return;
      }
      setSiteId(site.id);

      // Load shipment
      const { data: shipmentData, error: shipErr } = await supabase
        .from('shipments')
        .select('*, partner:manufacturer_partners(company_name)')
        .eq('id', shipmentId)
        .single();

      if (shipErr || !shipmentData) {
        setError('Shipment not found. The link may be invalid or expired.');
        setLoading(false);
        return;
      }

      // Verify this shipment is for the dealer's site
      if (shipmentData.site_id !== site.id) {
        setError('This shipment is not addressed to your dealership.');
        setLoading(false);
        return;
      }

      setShipment(shipmentData);

      // Already received?
      if (shipmentData.status === 'received') {
        setReceived(true);
        setLoading(false);
        return;
      }

      // Load items
      const { data: itemsData } = await supabase
        .from('shipment_items')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at');

      if (itemsData) {
        setItems(itemsData);
        // Initialize overrides with defaults
        const init: Record<string, ItemOverride> = {};
        itemsData.forEach(item => {
          init[item.id] = {
            price: item.msrp,
            purchase_price: item.dealer_cost,
            is_allocated: false,
            include: true,
          };
        });
        setOverrides(init);
      }

      setLoading(false);
    }
    load();
  }, [shipmentId]);

  const updateOverride = (itemId: string, field: keyof ItemOverride, value: any) => {
    setOverrides(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
  };

  const includedCount = Object.values(overrides).filter(o => o.include).length;
  const totalQuantity = items.reduce((sum, item) => {
    const override = overrides[item.id];
    return sum + (override?.include ? item.quantity : 0);
  }, 0);

  // ── RECEIVE SHIPMENT ──
  const handleReceive = useCallback(async () => {
    if (!siteId || !shipment) return;
    setReceiving(true);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const includedItems = items.filter(item => overrides[item.id]?.include);
    setProgress({ done: 0, total: includedItems.reduce((s, i) => s + i.quantity, 0) });

    let totalCreated = 0;

    for (const item of includedItems) {
      const override = overrides[item.id];

      // Resolve brand: find or create brand_id for this site
      let brandId: string | null = null;
      if (item.brand_name) {
        const { data: existingBrand } = await supabase
          .from('brands')
          .select('id')
          .eq('site_id', siteId)
          .ilike('name', item.brand_name)
          .maybeSingle();

        if (existingBrand) {
          brandId = existingBrand.id;
        } else {
          const { data: newBrand } = await supabase
            .from('brands')
            .insert({ site_id: siteId, name: item.brand_name })
            .select('id')
            .single();
          if (newBrand) brandId = newBrand.id;
        }
      }

      // Parse serial numbers if provided
      const serials = item.serial_numbers
        ? item.serial_numbers.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      // Create inventory_items — one per quantity unit
      const createdIds: string[] = [];
      for (let q = 0; q < item.quantity; q++) {
        const slug = (item.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const record = {
          site_id: siteId,
          title: item.title,
          description: item.description || null,
          category: item.category || 'Other',
          condition: 'new',
          model: item.model || null,
          sku: item.sku || null,
          price: override.price,
          purchase_price: override.purchase_price,
          sale_price: null,
          date_received: today,
          is_allocated: override.is_allocated,
          brand_id: brandId,
          serial_number: serials[q] || null,
          primary_image: item.primary_image || null,
          images: item.images || [],
          specifications: item.specifications || {},
          stock_quantity: 1,
          status: 'available',
          featured: false,
          financing_available: false,
          display_order: 0,
          slug: `${slug}-${Date.now()}-${q}`,
          updated_at: now,
        };

        const { data: created, error: insertErr } = await supabase
          .from('inventory_items')
          .insert(record)
          .select('id')
          .single();

        if (created) createdIds.push(created.id);
        totalCreated++;
        setProgress({ done: totalCreated, total: includedItems.reduce((s, i) => s + i.quantity, 0) });
      }

      // Update shipment_item with the created inventory IDs
      if (createdIds.length > 0) {
        await supabase
          .from('shipment_items')
          .update({ received_inventory_ids: createdIds })
          .eq('id', item.id);
      }
    }

    // Mark shipment as received
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('shipments')
      .update({
        status: 'received',
        received_at: now,
        received_by: user?.id || null,
        updated_at: now,
      })
      .eq('id', shipment.id);

    setReceiving(false);
    setReceived(true);
  }, [siteId, shipment, items, overrides]);

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: FM.orange }} />
          <p className="text-sm text-slate-500">Loading shipment...</p>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">Unable to Load Shipment</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg" style={{ background: FM.navy }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── ALREADY RECEIVED STATE ──
  if (received && shipment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Shipment Received!</h1>
          <p className="text-sm text-slate-500 mb-1">
            {shipment.shipment_code} from {shipment.partner?.company_name || 'manufacturer'}
          </p>
          <p className="text-sm text-slate-500 mb-6">
            {shipment.item_count} product{shipment.item_count !== 1 ? 's' : ''} added to your inventory.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/dashboard/inventory')} className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg" style={{ background: FM.orange }}>
              View Inventory
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RECEIVING IN PROGRESS ──
  if (receiving) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: FM.orange }} />
          <h1 className="text-lg font-bold text-slate-800 mb-2">Receiving Shipment...</h1>
          <p className="text-sm text-slate-500 mb-4">Adding {progress.total} item{progress.total !== 1 ? 's' : ''} to your inventory</p>
          <div className="w-full bg-slate-100 rounded-full h-2.5 max-w-xs mx-auto">
            <div
              className="h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`, background: FM.orange }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{progress.done} of {progress.total} processed</p>
        </div>
      </div>
    );
  }

  // ── MAIN RECEIVING VIEW ──
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" style={{ color: FM.orange }} />
              <h1 className="text-base font-bold text-slate-800">Receive Shipment</h1>
            </div>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{shipment?.shipment_code}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Shipment Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: FM.orangeGlow }}>
              <Truck className="w-5 h-5" style={{ color: FM.orange }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-800">{shipment?.partner?.company_name || 'Manufacturer'}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {items.length} product{items.length !== 1 ? 's' : ''} · {totalQuantity} total unit{totalQuantity !== 1 ? 's' : ''}
                {shipment?.shipped_at && ` · Shipped ${new Date(shipment.shipped_at).toLocaleDateString()}`}
              </p>
              {shipment?.notes && (
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2 italic">"{shipment.notes}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-700">Shipment Contents</h3>
            <span className="text-xs text-slate-400">{includedCount} of {items.length} included</span>
          </div>

          {items.map(item => {
            const override = overrides[item.id];
            if (!override) return null;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  override.include ? 'border-slate-200' : 'border-slate-100 opacity-50'
                }`}
              >
                {/* Item header */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={override.include}
                    onChange={(e) => updateOverride(item.id, 'include', e.target.checked)}
                    className="rounded border-slate-300 flex-shrink-0"
                  />
                  {item.primary_image ? (
                    <img src={item.primary_image} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {[item.brand_name, item.model, item.sku && `SKU: ${item.sku}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.quantity > 1 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        ×{item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing & allocation fields (only when included) */}
                {override.include && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Listing Price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="number"
                            value={override.price ?? ''}
                            onChange={(e) => updateOverride(item.id, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="MSRP"
                            className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Your Cost</label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="number"
                            value={override.purchase_price ?? ''}
                            onChange={(e) => updateOverride(item.id, 'purchase_price', e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="Cost"
                            className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer py-2">
                          <input
                            type="checkbox"
                            checked={override.is_allocated}
                            onChange={(e) => updateOverride(item.id, 'is_allocated', e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Allocated</span>
                        </label>
                      </div>
                    </div>
                    {override.price && override.purchase_price ? (
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className="text-slate-400">Margin:</span>
                        <span className={`font-semibold ${override.price - override.purchase_price >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          {formatPrice(override.price - override.purchase_price)} ({((override.price - override.purchase_price) / override.purchase_price * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Receive Button */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky bottom-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {totalQuantity} item{totalQuantity !== 1 ? 's' : ''} ready to receive
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Products will be added to your inventory with today's date
              </p>
            </div>
            <button
              onClick={handleReceive}
              disabled={totalQuantity === 0}
              className="px-6 py-3 text-sm font-bold text-white rounded-xl disabled:opacity-40 flex items-center gap-2 shadow-md"
              style={{ background: FM.orange }}
            >
              <Check className="w-4 h-4" />
              Receive {totalQuantity} Item{totalQuantity !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
