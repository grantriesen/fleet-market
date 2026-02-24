'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, X, Loader2 } from 'lucide-react';

interface Testimonial {
  id: string;
  site_id: string;
  author_name: string;
  author_title: string;
  author_company?: string;
  testimonial_text: string;
  rating?: number;
  display_order: number;
  created_at: string;
}

interface TestimonialSelectorProps {
  siteId: string;
  onUpdate: () => void;
}

export default function TestimonialSelector({ siteId, onUpdate }: TestimonialSelectorProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    author_name: '',
    author_title: '',
    author_company: '',
    testimonial_text: '',
    rating: 5
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadTestimonials();
  }, [siteId]);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('site_id', siteId)
        .order('display_order');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('testimonials')
          .update({
            author_name: formData.author_name,
            author_title: formData.author_title,
            author_company: formData.author_company || null,
            testimonial_text: formData.testimonial_text,
            rating: formData.rating
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('testimonials')
          .insert({
            site_id: siteId,
            author_name: formData.author_name,
            author_title: formData.author_title,
            author_company: formData.author_company || null,
            testimonial_text: formData.testimonial_text,
            rating: formData.rating,
            display_order: testimonials.length
          });

        if (error) throw error;
      }

      setFormData({
        author_name: '',
        author_title: '',
        author_company: '',
        testimonial_text: '',
        rating: 5
      });
      setEditingId(null);
      await loadTestimonials();
      onUpdate();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      author_name: testimonial.author_name,
      author_title: testimonial.author_title,
      author_company: testimonial.author_company || '',
      testimonial_text: testimonial.testimonial_text,
      rating: testimonial.rating || 5
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadTestimonials();
      onUpdate();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      author_name: '',
      author_title: '',
      author_company: '',
      testimonial_text: '',
      rating: 5
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing Testimonials */}
      {testimonials.length > 0 && (
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{testimonial.author_name}</p>
                    <span className="text-yellow-500">
                      {'★'.repeat(testimonial.rating || 5)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {testimonial.author_title}
                    {testimonial.author_company && ` • ${testimonial.author_company}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 italic text-sm">"{testimonial.testimonial_text}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-300 rounded-lg bg-white">
        <h3 className="font-semibold text-gray-900">
          {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            required
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title/Role *
          </label>
          <input
            type="text"
            required
            value={formData.author_title}
            onChange={(e) => setFormData({ ...formData, author_title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Property Owner"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company (optional)
          </label>
          <input
            type="text"
            value={formData.author_company}
            onChange={(e) => setFormData({ ...formData, author_company: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Smith Landscaping"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Testimonial *
          </label>
          <textarea
            required
            value={formData.testimonial_text}
            onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Great service and quality equipment..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <select
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              <>
                {editingId ? 'Update' : <><Plus size={16} /> Add</>} Testimonial
              </>
            )}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {testimonials.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No testimonials yet. Add your first one above!
        </p>
      )}
    </div>
  );
}
