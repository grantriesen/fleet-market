'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Search, DollarSign, Calendar, Package, X, Upload, Image as ImageIcon } from 'lucide-react';

interface RentalItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  hourly_rate?: number;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  model: string;
  year?: number;
  quantity_total: number;
  quantity_available: number;
  status: string;
  featured: boolean;
  primary_image?: string;
  image_gallery?: string[];
  created_at: string;
}

interface RentalBooking {
  id: string;
  rental_item_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  rental_period: string;
  quantity: number;
  rate_amount: number;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  rental_inventory?: RentalItem;
}

export default function RentalManager({ siteId }: { siteId: string }) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'inventory' | 'bookings'>('inventory');
  
  // Inventory state
  const [items, setItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mower',
    condition: 'good',
    hourly_rate: '',
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    model: '',
    year: '',
    quantity_total: '1',
    quantity_available: '1',
    status: 'available',
    featured: false,
    primary_image: '',
    image_gallery: [] as string[],
  });

  useEffect(() => {
    loadInventory();
    loadBookings();
  }, []);

  const loadInventory = async () => {
    const { data } = await supabase
      .from('rental_inventory')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (data) setItems(data);
    setLoading(false);
  };

  const loadBookings = async () => {
    const { data } = await supabase
      .from('rental_bookings')
      .select('*, rental_inventory(*)')
      .eq('site_id', siteId)
      .order('start_date', { ascending: false });

    if (data) setBookings(data);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'mower',
      condition: 'good',
      hourly_rate: '',
      daily_rate: '',
      weekly_rate: '',
      monthly_rate: '',
      model: '',
      year: '',
      quantity_total: '1',
      quantity_available: '1',
      status: 'available',
      featured: false,
      primary_image: '',
      image_gallery: [],
    });
    setShowModal(true);
  };

  const openEditModal = (item: RentalItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'mower',
      condition: item.condition || 'good',
      hourly_rate: item.hourly_rate?.toString() || '',
      daily_rate: item.daily_rate?.toString() || '',
      weekly_rate: item.weekly_rate?.toString() || '',
      monthly_rate: item.monthly_rate?.toString() || '',
      model: item.model || '',
      year: item.year?.toString() || '',
      quantity_total: item.quantity_total?.toString() || '1',
      quantity_available: item.quantity_available?.toString() || '1',
      status: item.status || 'available',
      featured: item.featured || false,
      primary_image: item.primary_image || '',
      image_gallery: item.image_gallery || [],
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${siteId}/rentals/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('inventory-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const newGallery = [...formData.image_gallery, ...uploadedUrls];
      setFormData({ ...formData, image_gallery: newGallery });

      if (!formData.primary_image && uploadedUrls.length > 0) {
        setFormData({ ...formData, primary_image: uploadedUrls[0], image_gallery: newGallery });
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    const newGallery = formData.image_gallery.filter(img => img !== url);
    setFormData({
      ...formData,
      image_gallery: newGallery,
      primary_image: formData.primary_image === url ? (newGallery[0] || '') : formData.primary_image
    });
  };

  const setPrimaryImage = (url: string) => {
    setFormData({ ...formData, primary_image: url });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.model) {
      alert('Please fill in required fields: Title and Model');
      return;
    }

    if (!formData.hourly_rate && !formData.daily_rate && !formData.weekly_rate && !formData.monthly_rate) {
      alert('Please set at least one rental rate');
      return;
    }

    setSaving(true);

    const itemData = {
      site_id: siteId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      condition: formData.condition,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
      weekly_rate: formData.weekly_rate ? parseFloat(formData.weekly_rate) : null,
      monthly_rate: formData.monthly_rate ? parseFloat(formData.monthly_rate) : null,
      model: formData.model,
      year: formData.year ? parseInt(formData.year) : null,
      quantity_total: parseInt(formData.quantity_total) || 1,
      quantity_available: parseInt(formData.quantity_available) || 1,
      status: formData.status,
      featured: formData.featured,
      primary_image: formData.primary_image || null,
      image_gallery: formData.image_gallery.length > 0 ? formData.image_gallery : null,
      display_order: items.length,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('rental_inventory')
        .update(itemData)
        .eq('id', editingItem.id);

      if (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item');
      } else {
        await loadInventory();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase
        .from('rental_inventory')
        .insert([itemData]);

      if (error) {
        console.error('Error creating item:', error);
        alert('Failed to create item');
      } else {
        await loadInventory();
        setShowModal(false);
      }
    }

    setSaving(false);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this rental item?')) return;

    const { error } = await supabase
      .from('rental_inventory')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } else {
      await loadInventory();
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('rental_bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    } else {
      await loadBookings();
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredBookings = bookings.filter(booking => {
    return filterStatus === 'all' || booking.status === filterStatus;
  });

  const stats = {
    totalItems: items.length,
    available: items.reduce((sum, i) => sum + (i.quantity_available || 0), 0),
    rented: items.reduce((sum, i) => sum + ((i.quantity_total || 0) - (i.quantity_available || 0)), 0),
    activeBookings: bookings.filter(b => b.status === 'active').length,
    revenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  if (loading) {
    return <div className="p-8 text-center">Loading rental management...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Rental Inventory
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Bookings
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Package className="w-4 h-4" />
            Total Items
          </div>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-700 text-sm mb-1">Available</div>
          <div className="text-2xl font-bold text-green-700">{stats.available}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-orange-700 text-sm mb-1">Currently Rented</div>
          <div className="text-2xl font-bold text-orange-700">{stats.rented}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Active Bookings
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.activeBookings}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-700 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            Total Revenue
          </div>
          <div className="text-2xl font-bold text-purple-700">
            ${stats.revenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Filters & Search */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rental equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="mower">Mowers</option>
              <option value="tractor">Tractors</option>
              <option value="trimmer">Trimmers</option>
              <option value="blower">Blowers</option>
              <option value="attachment">Attachments</option>
              <option value="other">Other</option>
            </select>
            <button
              onClick={openAddModal}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rental Item
            </button>
          </div>

          {/* Inventory List */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Equipment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Rates</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Availability</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No rental equipment found. Click "Add Rental Item" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.primary_image && (
                            <img src={item.primary_image} alt={item.title} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-gray-500">{item.model}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{item.category}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.hourly_rate && <div>Hourly: ${item.hourly_rate}</div>}
                        {item.daily_rate && <div>Daily: ${item.daily_rate}</div>}
                        {item.weekly_rate && <div>Weekly: ${item.weekly_rate}</div>}
                        {item.monthly_rate && <div>Monthly: ${item.monthly_rate}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.quantity_available} of {item.quantity_total} available
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'available' ? 'bg-green-100 text-green-700' :
                          item.status === 'unavailable' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Bookings List */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Equipment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Dates</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Period</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500">{booking.customer_email}</div>
                        <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{booking.rental_inventory?.title}</div>
                        <div className="text-sm text-gray-500">Qty: {booking.quantity}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{new Date(booking.start_date).toLocaleDateString()}</div>
                        <div>to {new Date(booking.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{booking.rental_period}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">${booking.total_amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">${booking.rate_amount}/{booking.rental_period}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className={`text-xs font-medium rounded px-2 py-1 border-0 ${
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'active' ? 'bg-green-100 text-green-700' :
                            booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {booking.notes && (
                          <button className="text-sm text-blue-600 hover:text-blue-700">
                            View Notes
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Modal - Similar to Inventory Manager */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Rental Item' : 'Add New Rental Item'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Gallery Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold">Equipment Images</h3>
                  </div>
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {formData.image_gallery.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {formData.image_gallery.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Equipment ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg ${
                            formData.primary_image === url ? 'ring-4 ring-blue-500' : ''
                          }`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                          {formData.primary_image !== url && (
                            <button
                              onClick={() => setPrimaryImage(url)}
                              className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => removeImage(url)}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        {formData.primary_image === url && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No images uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Compact Track Loader"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="T770"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="2024"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Describe the equipment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="mower">Mower</option>
                    <option value="tractor">Tractor</option>
                    <option value="trimmer">Trimmer</option>
                    <option value="blower">Blower</option>
                    <option value="attachment">Attachment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                {/* Rental Rates */}
                <div className="col-span-2">
                  <h3 className="font-semibold mb-3">Rental Rates (set at least one)</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Daily Rate</label>
                  <input
                    type="number"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({...formData, daily_rate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Weekly Rate</label>
                  <input
                    type="number"
                    value={formData.weekly_rate}
                    onChange={(e) => setFormData({...formData, weekly_rate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Rate</label>
                  <input
                    type="number"
                    value={formData.monthly_rate}
                    onChange={(e) => setFormData({...formData, monthly_rate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="3500"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-1">Total Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity_total}
                    onChange={(e) => setFormData({...formData, quantity_total: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Available Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({...formData, quantity_available: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Feature this item
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
