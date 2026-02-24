'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  config_json: any;
}

export default function CreateSitePage({ params }: { params: { templateId: string } }) {
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [siteName, setSiteName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    loadTemplate();
  }, [params.templateId]);

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', params.templateId)
        .single();

      if (error) throw error;
      
      setTemplate(data);
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Template not found');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSiteNameChange = (name: string) => {
    setSiteName(name);
    // Auto-generate slug from site name
    if (!slug || slug === generateSlug(siteName)) {
      setSlug(generateSlug(name));
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if slug is already taken
      const { data: existingSite } = await supabase
        .from('sites')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingSite) {
        setError('This URL is already taken. Please choose a different one.');
        setCreating(false);
        return;
      }

      // Create the site
      const { data: newSite, error: siteError } = await supabase
        .from('sites')
        .insert({
          user_id: user.id,
          template_id: params.templateId,
          site_name: siteName,
          slug: slug,
          deployment_status: 'draft',
          subscription_tier: 'basic'
        })
        .select()
        .single();

      if (siteError) throw siteError;

      // Initialize site content from template config
      if (template?.config_json && newSite) {
        const contentEntries = [];
        
        // Extract default content from template config
        if (template.config_json.sections) {
          for (const [sectionKey, sectionValue] of Object.entries(template.config_json.sections)) {
            for (const [fieldKey, fieldValue] of Object.entries(sectionValue as any)) {
              if ((fieldValue as any).default !== undefined) {
                contentEntries.push({
                  site_id: newSite.id,
                  field_key: `${sectionKey}.${fieldKey}`,
                  value: (fieldValue as any).default,
                  field_type: (fieldValue as any).type
                });
              }
            }
          }
        }

        // Initialize customizations (colors, fonts)
        if (template.config_json.colors) {
          const colorConfig: any = {};
          for (const [key, value] of Object.entries(template.config_json.colors)) {
            colorConfig[key] = (value as any).default;
          }
          
          await supabase.from('site_customizations').insert({
            site_id: newSite.id,
            customization_type: 'colors',
            config_json: colorConfig
          });
        }

        if (template.config_json.fonts) {
          const fontConfig: any = {};
          for (const [key, value] of Object.entries(template.config_json.fonts)) {
            fontConfig[key] = (value as any).default;
          }
          
          await supabase.from('site_customizations').insert({
            site_id: newSite.id,
            customization_type: 'fonts',
            config_json: fontConfig
          });
        }

        // Insert all content entries
        if (contentEntries.length > 0) {
          await supabase.from('site_content').insert(contentEntries);
        }
      }

      // Redirect to customizer
      router.push(`/customize/${newSite.id}`);
      
    } catch (err: any) {
      console.error('Error creating site:', err);
      setError(err.message || 'Failed to create site. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h2>
          <Link href="/templates" className="btn btn-primary">
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/templates" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
            <ArrowLeft size={20} />
            <span>Back to Templates</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Template Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h3>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  {template?.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-500">Template Preview</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{template?.name}</h4>
                  <p className="text-gray-600">{template?.description}</p>
                </div>
              </div>
            </div>

            {/* Create Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Details</h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleCreateSite} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="siteName" className="label">
                      Site Name *
                    </label>
                    <input
                      id="siteName"
                      type="text"
                      required
                      className="input"
                      value={siteName}
                      onChange={(e) => handleSiteNameChange(e.target.value)}
                      placeholder="Smith's Lawn Equipment"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This will be your site's display name
                    </p>
                  </div>

                  <div>
                    <label htmlFor="slug" className="label">
                      Site URL *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">siteforge.com/</span>
                      <input
                        id="slug"
                        type="text"
                        required
                        className="input flex-1"
                        value={slug}
                        onChange={(e) => setSlug(generateSlug(e.target.value))}
                        placeholder="smiths-lawn-equipment"
                        pattern="[a-z0-9-]+"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Lowercase letters, numbers, and hyphens only
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What happens next?</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">1.</span>
                        <span>Your site will be created with this template</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">2.</span>
                        <span>You'll customize the content and design</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">3.</span>
                        <span>Deploy your site when ready</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={creating || !siteName || !slug}
                    className="btn btn-primary w-full py-3 text-lg"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="inline animate-spin mr-2" size={20} />
                        Creating Site...
                      </>
                    ) : (
                      'Create Site & Customize'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
