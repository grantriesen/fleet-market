'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Search, DollarSign, Package, X, Upload, Image as ImageIcon } from 'lucide-react';

interface InventoryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  sale_price?: number;
  manufacturer_id?: string;
  model: string;
  year?: number;
  stock_quantity: number;
  status: string;
  featured: boolean;
  primary_image?: string;
  image_gallery?: string[];
  created_at: string;
}

export default function InventoryManager({ siteId }: { siteId: string }) {
  const supabase = createClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mower',
    condition: 'new',
    price: '',
    sale_price: '',
    model: '',
    year: '',
    stock_quantity: '1',
    status: 'available',
    featured: false,
    primary_image: '',
    image_gallery: [] as string[],
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (data) setItems(data);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'mower',
      condition: 'new',
      price: '',
      sale_price: '',
      model: '',
      year: '',
      stock_quantity: '1',
      status: 'available',
      featured: false,
      primary_image: '',
      image_gallery: [],
    });
    setShowModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'mower',
      condition: item.condition || 'new',
      price: item.price?.toString() || '',
      sale_price: item.sale_price?.toString() || '',
      model: item.model || '',
      year: item.year?.toString() || '',
      stock_quantity: item.stock_quantity?.toString() || '1',
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
        const fileName = `${siteId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('inventory-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          alert(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Add to gallery
      const newGallery = [...formData.image_gallery, ...uploadedUrls];
      setFormData({ ...formData, image_gallery: newGallery });

      // Set first image as primary if none set
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
      // If removed image was primary, set new primary
      primary_image: formData.primary_image === url ? (newGallery[0] || '') : formData.primary_image
    });
  };

  const setPrimaryImage = (url: string) => {
    setFormData({ ...formData, primary_image: url });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.model || !formData.price) {
      alert('Please fill in required fields: Title, Model, and Price');
      return;
    }

    setSaving(true);

    const itemData = {
      site_id: siteId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      condition: formData.condition,
      price: parseFloat(formData.price) || 0,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      model: formData.model,
      year: formData.year ? parseInt(formData.year) : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      status: formData.status,
      featured: formData.featured,
      primary_image: formData.primary_image || null,
      image_gallery: formData.image_gallery.length > 0 ? formData.image_gallery : null,
      display_order: items.length,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('inventory_items')
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
        .from('inventory_items')
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
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } else {
      await loadInventory();
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: items.length,
    available: items.filter(i => i.status === 'available').length,
    sold: items.filter(i => i.status === 'sold').length,
    value: items.reduce((sum, i) => sum + (i.price || 0), 0),
  };

  if (loading) {
    return <div className="p-8 text-center">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Package className="w-4 h-4" />
            Total Items
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-700 text-sm mb-1">Available</div>
          <div className="text-2xl font-bold text-green-700">{stats.available}</div>
        </div>
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="text-gray-600 text-sm mb-1">Sold</div>
          <div className="text-2xl font-bold text-gray-700">{stats.sold}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            Total Value
          </div>
          <div className="text-2xl font-bold text-blue-700">
            ${stats.value.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search equipment..."
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
          Add Equipment
        </button>
      </div>

      {/* Inventory List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Equipment</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Condition</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm || filterCategory !== 'all' 
                    ? 'No equipment found matching your filters' 
                    : 'No equipment in inventory. Click "Add Equipment" to get started.'}
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
                  <td className="px-4 py-3 text-sm capitalize">{item.condition}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">${item.price?.toLocaleString()}</div>
                    {item.sale_price && (
                      <div className="text-sm text-red-600">${item.sale_price.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{item.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'available' ? 'bg-green-100 text-green-700' :
                      item.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
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
                    <h3 className="font-semibold">Product Images</h3>
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

                {/* Image Gallery Grid */}
                {formData.image_gallery.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {formData.image_gallery.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
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
                    <p className="text-sm">Click "Upload Images" to add product photos</p>
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
                    placeholder="John Deere X350 Riding Mower"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="X350"
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
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="4999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sale Price</label>
                  <input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="4499"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
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
                    <option value="sold">Sold</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="featured" className="text-sm font-medium">
                      Feature this item on homepage
                    </label>
                  </div>
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
                {saving ? 'Saving...' : editingItem ? 'Update Equipment' : 'Add Equipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
