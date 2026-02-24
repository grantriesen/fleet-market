'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, Search, CheckCircle2, Circle } from 'lucide-react';

interface Manufacturer {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  category: string | null;
}

interface ManufacturerSelectorProps {
  siteId: string;
  onUpdate?: () => void;
}

export default function ManufacturerSelector({ siteId, onUpdate }: ManufacturerSelectorProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [allManufacturers, setAllManufacturers] = useState<Manufacturer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadManufacturers();
  }, [siteId]);

  const loadManufacturers = async () => {
    try {
      // Load all available manufacturers from library
      const { data: libraryData, error: libraryError } = await supabase
        .from('manufacturer_library')
        .select('*')
        .order('display_order');

      if (libraryError) throw libraryError;
      setAllManufacturers(libraryData || []);

      // Load site's selected manufacturers
      const { data: selectedData } = await supabase
        .from('manufacturers')
        .select('name')
        .eq('site_id', siteId);

      if (selectedData) {
        const selected = new Set(selectedData.map(m => m.name));
        setSelectedIds(selected);
      }

    } catch (error) {
      console.error('Error loading manufacturers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleManufacturer = (manufacturer: Manufacturer) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(manufacturer.name)) {
        newSet.delete(manufacturer.name);
      } else {
        newSet.add(manufacturer.name);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      // Delete all existing manufacturers for this site
      await supabase
        .from('manufacturers')
        .delete()
        .eq('site_id', siteId);

      // Insert selected manufacturers
      const manufacturersToInsert = allManufacturers
        .filter(m => selectedIds.has(m.name))
        .map((m, index) => ({
          site_id: siteId,
          name: m.name,
          logo_url: m.logo_url,
          website_url: m.website_url,
          display_order: index,
          is_featured: false
        }));

      if (manufacturersToInsert.length > 0) {
        const { error } = await supabase
          .from('manufacturers')
          .insert(manufacturersToInsert);

        if (error) throw error;
      }

      setSaveMessage(`✓ Saved ${selectedIds.size} manufacturers`);
      if (onUpdate) onUpdate();
      
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error) {
      console.error('Error saving manufacturers:', error);
      setSaveMessage('✗ Error saving manufacturers');
    } finally {
      setSaving(false);
    }
  };

  const filteredManufacturers = allManufacturers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Manufacturers You Carry
        </h3>
        <p className="text-sm text-gray-600">
          Select all the brands you sell or service. These will appear on your website.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search manufacturers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Selected Count */}
      <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg p-3">
        <span className="text-sm text-primary-900">
          <strong>{selectedIds.size}</strong> manufacturers selected
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-sm"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Saving...
            </>
          ) : (
            'Save Selection'
          )}
        </button>
      </div>

      {saveMessage && (
        <div className={`text-sm ${saveMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {saveMessage}
        </div>
      )}

      {/* Manufacturer Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
        {filteredManufacturers.map((manufacturer) => {
          const isSelected = selectedIds.has(manufacturer.name);
          
          return (
            <button
              key={manufacturer.id}
              onClick={() => toggleManufacturer(manufacturer)}
              className={`
                relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Checkbox */}
              <div className="flex-shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="text-primary-600" size={24} />
                ) : (
                  <Circle className="text-gray-300" size={24} />
                )}
              </div>

              {/* Logo Placeholder */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${
                  isSelected ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {manufacturer.name}
                </p>
                {manufacturer.category && (
                  <p className="text-xs text-gray-500 capitalize">
                    {manufacturer.category}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredManufacturers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No manufacturers found matching "{searchQuery}"
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Select all brands you're an authorized dealer for</li>
          <li>• Manufacturers will appear in order on your site</li>
          <li>• You can change this selection anytime</li>
          <li>• Missing a brand? Let us know and we'll add it!</li>
        </ul>
      </div>
    </div>
  );
}
