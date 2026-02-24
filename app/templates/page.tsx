'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  config_json: any;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    checkAuth();
    loadTemplates();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    if (!user) {
      router.push('/auth/signup');
      return;
    }

    // Create a new site with this template
    router.push(`/templates/${templateId}/create`);
  };

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'classic-dealer', label: 'Classic Dealer' },
    { value: 'service-first', label: 'Service First' },
    { value: 'rental-hub', label: 'Rental Hub' },
    { value: 'modern-showroom', label: 'Modern Showroom' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SiteForge</h1>
                <p className="text-xs text-gray-500">Templates</p>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                    Dashboard
                  </Link>
                  <Link href="/templates" className="text-primary-600 font-semibold">
                    Templates
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                  <Link href="/auth/signup" className="btn btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Template
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional, industry-specific templates designed for lawn care equipment dealers. 
            Fully customizable to match your brand.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No templates found in this category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Template Preview */}
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Preview Coming Soon</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {template.category && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                        {template.category.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {template.description || 'Professional template for lawn equipment dealers'}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>Fully customizable</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>Mobile responsive</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>SEO optimized</span>
                    </li>
                  </ul>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {template.preview_url && (
                      <a
                        href={template.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline flex-1 text-center"
                      >
                        Preview
                      </a>
                    )}
                    <button
                      onClick={() => handleSelectTemplate(template.id)}
                      className="btn btn-primary flex-1"
                    >
                      {user ? 'Use Template' : 'Sign Up to Use'}
                      <ArrowRight className="inline ml-2" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {!user && (
          <div className="mt-16 bg-primary-600 text-white rounded-lg p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl mb-8 opacity-90">
              Create your professional lawn equipment dealer website today
            </p>
            <Link href="/auth/signup" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 inline-flex items-center">
              Start Your Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <p className="text-sm mt-4 opacity-75">14 days free • No credit card required</p>
          </div>
        )}
      </div>
    </div>
  );
}
