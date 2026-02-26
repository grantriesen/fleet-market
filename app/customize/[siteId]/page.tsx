'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { GuidedTourOverlay, CompletionChecklist, getTourSteps, getCompletionChecklist, getCurrentFocusTarget } from '@/components/GuidedTour';

type Tab = 'content' | 'design' | 'pages';

export default function CustomizePage({ params }: { params: { siteId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState('index');
  const [previewKey, setPreviewKey] = useState(Date.now());
  
  // Site data
  const [siteName, setSiteName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateSlug, setTemplateSlug] = useState('');
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [subscriptionTier, setSubscriptionTier] = useState('basic');
  
  // Guided Tour state
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  
  // Helper: check if current tier allows professional features
  const hasProfessionalAccess = (tier: string) => ['professional', 'enterprise'].includes(tier);
  
  // Content
  const [content, setContent] = useState<Record<string, string>>({});
  
  // Design
  const [colors, setColors] = useState({
    primary: '#2D5016',
    secondary: '#F97316',
    accent: '#059669',
  });
  
  const [fonts, setFonts] = useState({
    heading: 'Inter',
    body: 'Inter',
  });
  
  // Section visibility (dynamic based on template)
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  
  // Page visibility
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSiteData();
  }, []);

  // Reload preview when switching pages
  useEffect(() => {
    setPreviewKey(Date.now());
  }, [currentPage]);

  const loadSiteData = async () => {
    try {
      // Load site with template config
      const { data: site } = await supabase
        .from('sites')
        .select(`
          id,
          site_name,
          subscription_tier,
          onboarding_tour_completed,
          template:templates (
            name,
            slug,
            config_json
          )
        `)
        .eq('id', params.siteId)
        .single();

      if (site) {
        setSiteName(site.site_name);
        setTemplateName(site.template.name);
        setTemplateSlug(site.template.slug);
        setTemplateConfig(site.template.config_json);
        setSubscriptionTier(site.subscription_tier || 'basic');
        
        // Initialize section visibility from template sections
        const sections = site.template.config_json.sections || {};
        const initialVisibility: Record<string, boolean> = {};
        Object.keys(sections).forEach(key => {
          initialVisibility[key] = true;
        });
        // Default premium sections to hidden for basic tier
        if (!hasProfessionalAccess(site.subscription_tier || 'basic')) {
          initialVisibility.featured = false;
          initialVisibility.inventoryPage = false;
          initialVisibility.rentalsPage = false;
        }
        setSectionVisibility(initialVisibility);

        // Default premium pages to hidden for basic tier
        if (!hasProfessionalAccess(site.subscription_tier || 'basic')) {
          const initialPageVis: Record<string, boolean> = {};
          (site.template.config_json.pages || []).forEach((p: any) => {
            const premiumPageSlugs = ['inventory', 'rentals'];
            initialPageVis[p.slug] = !premiumPageSlugs.includes(p.slug);
          });
          setPageVisibility(initialPageVis);
        }
      }

      // Load content
      const { data: contentData } = await supabase
        .from('site_content')
        .select('field_key, value')
        .eq('site_id', params.siteId);

      const loadedContent: Record<string, string> = {};
      contentData?.forEach((item) => {
        loadedContent[item.field_key] = item.value || '';
      });
      setContent(loadedContent);

      // Load customizations
      const { data: customData } = await supabase
        .from('site_customizations')
        .select('customization_type, config_json')
        .eq('site_id', params.siteId);

      customData?.forEach((item) => {
        if (item.customization_type === 'colors') {
          setColors(item.config_json);
        } else if (item.customization_type === 'fonts') {
          setFonts(item.config_json);
        } else if (item.customization_type === 'section_visibility') {
          const savedVisibility = item.config_json;
          // Force premium sections to hidden for basic tier
          const tier = site?.subscription_tier || 'basic';
          if (!hasProfessionalAccess(tier)) {
            if (savedVisibility.featured === undefined) {
              savedVisibility.featured = false;
            }
            savedVisibility.inventoryPage = false;
            savedVisibility.rentalsPage = false;
          }
          setSectionVisibility(savedVisibility);
        } else if (item.customization_type === 'page_visibility') {
          const savedPageVis = item.config_json;
          // Force premium pages to hidden for basic tier
          const tier = site?.subscription_tier || 'basic';
          if (!hasProfessionalAccess(tier)) {
            savedPageVis.inventory = false;
            savedPageVis.rentals = false;
          }
          setPageVisibility(savedPageVis);
        }
      });

      setLoading(false);

      // Initialize guided tour if ?tour=true
      if (searchParams.get('tour') === 'true' && site?.template?.config_json?.sections) {
        const steps = getTourSteps(site.template.config_json.sections, site.subscription_tier || 'base');
        if (steps.length > 0) {
          setTourActive(true);
          setShowChecklist(false);
        }
      } else {
        // Show checklist widget if tour was completed but there's still incomplete content
        setShowChecklist(true);
      }
    } catch (error) {
      console.error('Error loading site data:', error);
      setLoading(false);
    }
  };

  // Get sections for current page
  const getSectionsForCurrentPage = () => {
    if (!templateConfig?.sections) return [];
    
    const sections = templateConfig.sections;
    
    // Map page slugs to their corresponding section key prefixes
    const pageToSectionPrefix: Record<string, string> = {
      'index': '', // Home page gets non-page-specific sections
      'service': 'servicePage',
      'contact': 'contactPage',
      'manufacturers': 'manufacturersPage',
      'inventory': 'inventoryPage',
      'rentals': 'rentalsPage',
    };
    
    const currentPrefix = pageToSectionPrefix[currentPage] || '';
    
    return Object.entries(sections)
      .filter(([key, section]: [string, any]) => {
        const isPageSection = key.endsWith('Page');
        
        if (currentPage === 'index') {
          // On home page: show only non-page sections (hero, featured, cta, etc.)
          return !isPageSection;
        } else {
          // On a specific page: only show that page's section(s)
          return key === currentPrefix;
        }
      })
      .map(([key, section]: [string, any]) => ({
        key,
        label: section.label || key.charAt(0).toUpperCase() + key.slice(1),
        icon: section.icon || '📄',
        displayOrder: section.displayOrder || 999,
        premium: section.premium || false,
        requiredFeature: section.requiredFeature || null,
        subsections: section.subsections || null,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  // Get fields for active section
  const getFieldsForSection = (sectionKey: string) => {
    if (!templateConfig?.sections?.[sectionKey]) return [];
    
    const section = templateConfig.sections[sectionKey];
    const excludedKeys = ['label', 'icon', 'pageSpecific', 'pages', 'premium', 'requiredFeature', 'displayOrder', 'subsections'];
    
    return Object.entries(section)
      .filter(([key]) => !excludedKeys.includes(key))
      .filter(([, value]: [string, any]) => value && typeof value === 'object' && value.type)
      .map(([key, field]: [string, any]) => ({
        key,
        ...field
      }))
      .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  };

  // Extract subsections from _heading markers within a page section
  const getSubsectionsForPageSection = (sectionKey: string) => {
    if (!templateConfig?.sections?.[sectionKey]) return [];
    
    const section = templateConfig.sections[sectionKey];
    const headings: { key: string; label: string; displayOrder: number }[] = [];
    
    Object.entries(section).forEach(([key, value]: [string, any]) => {
      if (key.startsWith('_') && value?.type === 'heading') {
        headings.push({
          key,
          label: value.label || key.replace(/^_/, '').replace(/Heading$/, ''),
          displayOrder: value.displayOrder || 999,
        });
      }
    });
    
    return headings.sort((a, b) => a.displayOrder - b.displayOrder);
  };

  // Group fields by their subsection (heading markers)
  const getGroupedFieldsForSection = (sectionKey: string) => {
    const allFields = getFieldsForSection(sectionKey);
    const subsections = getSubsectionsForPageSection(sectionKey);
    
    if (subsections.length === 0) {
      return [{ key: 'all', label: '', fields: allFields }];
    }
    
    const groups: { key: string; label: string; fields: any[] }[] = [];
    let currentGroup: { key: string; label: string; fields: any[] } | null = null;
    
    for (const field of allFields) {
      if (field.type === 'heading' && field.key.startsWith('_')) {
        // Start a new group
        currentGroup = { key: field.key, label: field.label, fields: [] };
        groups.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.fields.push(field);
      } else {
        // Fields before any heading go into an unnamed group
        if (groups.length === 0 || groups[0].key !== '_ungrouped') {
          groups.unshift({ key: '_ungrouped', label: 'General', fields: [] });
        }
        groups[0].fields.push(field);
      }
    }
    
    return groups.filter(g => g.fields.length > 0 || g.key.startsWith('_'));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save content - filter out empty values and ensure valid data
      const contentUpdates = Object.entries(content)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')
        .map(([field_key, value]) => {
          // Derive field_type from template config (e.g., "hero.backgroundImage" → sections.hero.backgroundImage.type)
          let field_type = 'text';
          const parts = field_key.split('.');
          if (parts.length === 2 && templateConfig?.sections?.[parts[0]]?.[parts[1]]?.type) {
            field_type = templateConfig.sections[parts[0]][parts[1]].type;
          }
          return {
            site_id: params.siteId,
            field_key,
            value: String(value),
            field_type,
          };
        });

      // Find fields that were cleared (empty string) so we can delete them
      const clearedFields = Object.entries(content)
        .filter(([key, value]) => value === '' || value === null || value === undefined)
        .map(([field_key]) => field_key);

      if (contentUpdates.length > 0) {
        const { error: contentError } = await supabase
          .from('site_content')
          .upsert(contentUpdates, {
            onConflict: 'site_id,field_key',
          });

        if (contentError) {
          console.error('Error saving content:', contentError);
          setToast({ message: `Error saving content: ${contentError.message}`, type: 'error' });
          setTimeout(() => setToast(null), 4000);
          setSaving(false);
          return;
        }
      }

      // Delete cleared fields from database
      if (clearedFields.length > 0) {
        const { error: deleteError } = await supabase
          .from('site_content')
          .delete()
          .eq('site_id', params.siteId)
          .in('field_key', clearedFields);

        if (deleteError) {
          console.error('Error deleting cleared fields:', deleteError);
        }
      }

      // Save customizations
      const customizationUpdates = [
        {
          site_id: params.siteId,
          customization_type: 'colors',
          config_json: colors,
        },
        {
          site_id: params.siteId,
          customization_type: 'fonts',
          config_json: fonts,
        },
        {
          site_id: params.siteId,
          customization_type: 'section_visibility',
          config_json: sectionVisibility,
        },
      ];

      const { error: customError } = await supabase
        .from('site_customizations')
        .upsert(customizationUpdates, {
          onConflict: 'site_id,customization_type',
        });

      if (customError) {
        console.error('Error saving customizations:', customError);
        setToast({ message: `Error saving customizations: ${customError.message}`, type: 'error' });
        setTimeout(() => setToast(null), 4000);
        setSaving(false);
        return;
      }

      // Save page visibility
      const { error: pageError } = await supabase
        .from('site_customizations')
        .upsert(
          {
            site_id: params.siteId,
            customization_type: 'page_visibility',
            config_json: pageVisibility,
          },
          {
            onConflict: 'site_id,customization_type',
          }
        );
      
      if (pageError) console.error('Error saving page visibility:', pageError);

      // Force preview to reload
      setPreviewKey(Date.now());
      
      // After iframe reloads, scroll back to the section being edited
      const scrollAfterLoad = () => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          const handleLoad = () => {
            setTimeout(() => {
              iframe.contentWindow?.postMessage(
                { type: 'scrollToSection', section: activeSection },
                '*'
              );
            }, 300);
            iframe.removeEventListener('load', handleLoad);
          };
          iframe.addEventListener('load', handleLoad);
        }
      };
      // Small delay to let React update the iframe src first
      setTimeout(scrollAfterLoad, 50);
      
      setToast({ message: 'Changes saved successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setToast({ message: 'Error saving changes', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (key: string, value: string) => {
    setContent({ ...content, [key]: value });
  };

  const toggleSectionVisibility = (section: string) => {
    // Block premium sections for basic tier
    const premiumSections: Record<string, string> = {
      'inventoryPage': 'professional',
      'rentalsPage': 'professional',
    };
    if (premiumSections[section] && (!hasProfessionalAccess(subscriptionTier))) return;
    
    setSectionVisibility({
      ...sectionVisibility,
      [section]: !sectionVisibility[section],
    });
  };

  const togglePageVisibility = (page: string) => {
    // Block premium pages for basic tier
    const premiumPages: Record<string, string> = {
      'inventory': 'professional',
      'rentals': 'professional',
    };
    if (premiumPages[page] && (!hasProfessionalAccess(subscriptionTier))) return;
    
    setPageVisibility({
      ...pageVisibility,
      [page]: !pageVisibility[page],
    });
  };

  const scrollToSection = (section: string) => {
    // First, update the active section immediately
    setActiveSection(section);
    
    // Scroll the section tab into view
    setTimeout(() => {
      const button = document.querySelector(`button[data-section="${section}"]`);
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 50);
    
    // Then try to scroll in the preview iframe
    const iframe = document.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: 'scrollToSection', section },
        '*'
      );
    }
  };

  // Render field based on type
  const renderField = (sectionKey: string, field: any) => {
    const fieldKey = `${sectionKey}.${field.key}`;
    const value = content[fieldKey] || field.default || '';

    switch (field.type) {
      case 'heading':
        return (
          <div key={field.key} className="pt-5 pb-1 border-t border-gray-200 first:border-t-0 first:pt-0">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {field.label}
            </h4>
          </div>
        );

      case 'text':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {(field.helpText || field.help) && (
                <span className="text-xs text-gray-500 block mt-1">{field.helpText || field.help}</span>
              )}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateContent(fieldKey, e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder={field.default || ''}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {(field.helpText || field.help) && (
                <span className="text-xs text-gray-500 block mt-1">{field.helpText || field.help}</span>
              )}
            </label>
            <textarea
              value={value}
              onChange={(e) => updateContent(fieldKey, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded"
              placeholder={field.default || ''}
            />
          </div>
        );

      case 'image':
        return (
          <div key={field.key}>
            <ImageUpload
              value={value}
              onChange={(url) => updateContent(fieldKey, url)}
              siteId={params.siteId}
              fieldKey={fieldKey}
              label={field.label}
              helpText={field.helpText}
            />
          </div>
        );

      case 'pageLink':
        // Dropdown of site pages so the user can pick where a button links
        const pages = templateConfig?.pages || [];
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {(field.helpText || field.help) && (
                <span className="text-xs text-gray-500 block mt-1">{field.helpText || field.help}</span>
              )}
            </label>
            <select
              value={value}
              onChange={(e) => updateContent(fieldKey, e.target.value)}
              className="w-full px-3 py-2 border rounded bg-white"
            >
              <option value="">Default ({field.default || 'auto'})</option>
              {pages.map((p: any) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
              <option value="__custom">Custom URL...</option>
            </select>
            {value === '__custom' && (
              <input
                type="text"
                value={content[`${fieldKey}_custom`] || ''}
                onChange={(e) => updateContent(`${fieldKey}_custom`, e.target.value)}
                className="w-full px-3 py-2 border rounded mt-2"
                placeholder="https://example.com"
              />
            )}
          </div>
        );

      case 'email':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.helpText && (
                <span className="text-xs text-gray-500 block mt-1">{field.helpText}</span>
              )}
              {field.help && (
                <span className="text-xs text-gray-500 block mt-1">{field.help}</span>
              )}
            </label>
            <input
              type="email"
              value={value}
              onChange={(e) => updateContent(fieldKey, e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder={field.default || ''}
            />
          </div>
        );

      default:
        // Render any unknown field types as text inputs so nothing gets dropped
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.helpText && (
                <span className="text-xs text-gray-500 block mt-1">{field.helpText}</span>
              )}
              {field.help && (
                <span className="text-xs text-gray-500 block mt-1">{field.help}</span>
              )}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateContent(fieldKey, e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder={field.default || ''}
            />
          </div>
        );
    }
  };

  // ── Tour logic (hooks must be above any early returns) ──
  const tourSteps = templateConfig?.sections ? getTourSteps(templateConfig.sections, subscriptionTier) : [];
  const checklistItems = templateConfig?.sections ? getCompletionChecklist(content, templateConfig.sections) : [];
  const tourFocusTarget = tourActive ? getCurrentFocusTarget(tourSteps, tourStep) : undefined;

  const navigateToTourStep = useCallback((stepIndex: number) => {
    const step = tourSteps[stepIndex];
    if (!step) return;

    if (step.tab === 'design') {
      setActiveTab('design');
    } else {
      setActiveTab('content');
    }

    const pageSlug = step.page === 'index' ? 'index' : step.page;
    if (currentPage !== pageSlug) {
      setCurrentPage(pageSlug);
    }

    setTimeout(() => {
      setActiveSection(step.section);
      scrollToSection(step.section);
    }, 100);
  }, [tourSteps, currentPage]);

  const handleTourNext = useCallback(() => {
    const nextStep = tourStep + 1;
    if (nextStep < tourSteps.length) {
      setTourStep(nextStep);
      navigateToTourStep(nextStep);
    }
  }, [tourStep, tourSteps.length, navigateToTourStep]);

  const handleTourPrev = useCallback(() => {
    const prevStep = tourStep - 1;
    if (prevStep >= 0) {
      setTourStep(prevStep);
      navigateToTourStep(prevStep);
    }
  }, [tourStep, navigateToTourStep]);

  const handleTourFinish = useCallback(async () => {
    setTourActive(false);
    setTourCompleted(true);
    setShowChecklist(true);
    try {
      await supabase.from('sites').update({ onboarding_tour_completed: true }).eq('id', params.siteId);
    } catch (e) {
      console.error('Failed to save tour completion:', e);
    }
    router.replace(`/customize/${params.siteId}`, { scroll: false });
  }, [params.siteId]);

  const handleTourSkip = handleTourFinish;

  const handleChecklistItemClick = useCallback((item: any) => {
    setActiveTab('content');
    const pageSlug = item.page === 'index' ? 'index' : item.page;
    setCurrentPage(pageSlug);
    setTimeout(() => {
      setActiveSection(item.section);
      scrollToSection(item.section);
    }, 100);
  }, []);

  const handleStartTour = useCallback(() => {
    setTourStep(0);
    setTourActive(true);
    setShowChecklist(false);
    navigateToTourStep(0);
  }, [navigateToTourStep]);

  // Start tour navigation on first load
  useEffect(() => {
    if (tourActive && tourSteps.length > 0 && !loading) {
      navigateToTourStep(0);
    }
  }, [tourActive, tourSteps.length, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const sections = getSectionsForCurrentPage();
  const fields = getFieldsForSection(activeSection);
  
  // For subpages: extract subsections from heading markers for step navigation
  const isSubpage = currentPage !== 'index';
  const subsections = isSubpage && sections.length === 1 ? getSubsectionsForPageSection(sections[0].key) : [];
  const groupedFields = isSubpage && sections.length === 1 ? getGroupedFieldsForSection(sections[0].key) : [];
  const hasSubsections = subsections.length > 1;

  return (
    <div className="flex flex-col h-screen">
      {/* Guided Tour Overlay */}
      <GuidedTourOverlay
        active={tourActive}
        steps={tourSteps}
        currentStep={tourStep}
        onNext={handleTourNext}
        onPrev={handleTourPrev}
        onSkip={handleTourSkip}
        onFinish={handleTourFinish}
      />

      {/* Completion Checklist (shown after tour ends) */}
      {showChecklist && !tourActive && checklistItems.length > 0 && (
        <CompletionChecklist
          items={checklistItems}
          onItemClick={handleChecklistItemClick}
          onStartTour={handleStartTour}
        />
      )}
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-[#1E3A6E] text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span className="font-medium text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold">{siteName}</h1>
            <p className="text-sm text-gray-500">{templateName}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/dashboard/settings/${params.siteId}`)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
          >
            ⚙️ Settings
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden lg:block">Save to update preview</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1E3A6E] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#152C54] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600">
            Deploy
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor Only - Fixed width, no horizontal scroll */}
        <div className="w-96 border-r bg-white flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div className="border-b flex-shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 px-4 py-3 font-medium border-b-2 ${
                  activeTab === 'content'
                    ? 'border-[#1E3A6E] text-[#1E3A6E]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 px-4 py-3 font-medium border-b-2 ${
                  activeTab === 'design'
                    ? 'border-[#1E3A6E] text-[#1E3A6E]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                } `}
              >
                Design
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex-1 px-4 py-3 font-medium border-b-2 ${
                  activeTab === 'pages'
                    ? 'border-[#1E3A6E] text-[#1E3A6E]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pages
              </button>
            </div>
          </div>

          {/* Page Navigator */}
          {activeTab === 'content' && templateConfig?.pages && (
            <div className="border-b px-4 py-3 flex-shrink-0 bg-gray-50 overflow-visible relative z-20">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Editing Page</label>
              <div className="flex flex-wrap gap-1.5">
                {templateConfig.pages.map((page: any) => {
                  // Define which pages are premium add-ons
                  const premiumPages: Record<string, { requiredTier: string; label: string }> = {
                    'inventory': { requiredTier: 'professional', label: 'Inventory Management' },
                    'rentals': { requiredTier: 'professional', label: 'Rental Scheduling' },
                  };
                  const pageSlug = page.slug === 'home' ? 'index' : page.slug;
                  const addOn = premiumPages[pageSlug];
                  const isLocked = addOn && !hasProfessionalAccess(subscriptionTier);
                  const isActive = currentPage === pageSlug || (currentPage === 'index' && page.slug === 'home');
                  
                  return (
                    <div key={page.slug} className="relative group/tip">
                      <button
                        onClick={() => {
                          if (isLocked) return;
                          const newPage = page.slug === 'home' ? 'index' : page.slug;
                          setCurrentPage(newPage);
                          setActiveSubsection(null);
                          if (newPage === 'index') {
                            setActiveSection('hero');
                          } else {
                            const pageSection = newPage + 'Page';
                            if (templateConfig?.sections?.[pageSection]) {
                              setActiveSection(pageSection);
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          isLocked
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : isActive
                              ? 'bg-[#1E3A6E] text-white shadow-sm'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {isLocked && <span className="mr-1">🔒</span>}
                        {page.name}
                      </button>
                      {isLocked && (
                        <div className="absolute left-0 top-full mt-1 w-52 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
                          <div className="absolute bottom-full left-4 mb-[-4px] w-2 h-2 bg-gray-900 rotate-45"></div>
                          <p className="font-semibold mb-1">Premium Add-On</p>
                          <p className="text-gray-300">{addOn.label} requires a {addOn.requiredTier} plan.</p>
                          <button
                            onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=billing`)}
                            className="text-[#E85525] font-medium mt-1.5 hover:text-[#F06A3E] cursor-pointer"
                          >
                            Upgrade to unlock →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content - Editor Fields - Only vertical scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Content Fields - Grouped with alternating backgrounds */}
                {isSubpage && hasSubsections ? (
                  /* SUBPAGE: Show grouped fields by subsection with alternating backgrounds */
                  <div className="space-y-0">
                    {groupedFields
                      .filter(group => {
                        // If a subsection is selected, only show that group
                        if (activeSubsection !== null) return group.key === activeSubsection;
                        return true;
                      })
                      .map((group, groupIndex) => (
                        <div
                          key={group.key}
                          className={`px-4 py-5 -mx-2 rounded-lg ${
                            groupIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'
                          }`}
                        >
                          {/* Subsection heading */}
                          {group.label && (
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                              <div className="w-1 h-5 rounded-full bg-[#E85525]"></div>
                              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                                {group.label}
                              </h3>
                            </div>
                          )}
                          {group.fields.map((field: any) => renderField(activeSection, field))}
                          {group.fields.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No editable fields in this section.</p>
                          )}
                        </div>
                      ))}
                    {groupedFields.length === 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-3xl mb-3">📝</div>
                        <p className="text-sm font-medium text-gray-700 mb-1">No editable fields</p>
                        <p className="text-xs text-gray-500">This section doesn&apos;t have any customizable content fields.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* HOME PAGE: Standard single-section rendering */
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">
                      {sections.find(s => s.key === activeSection)?.label || 'Content'}
                    </h3>
                    {fields.map((field) => renderField(activeSection, field))}
                    {fields.length === 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-3xl mb-3">📝</div>
                        <p className="text-sm font-medium text-gray-700 mb-1">No editable fields</p>
                        <p className="text-xs text-gray-500">This section doesn&apos;t have any customizable content fields.</p>
                      </div>
                    )}
                  </div>
                )}


                {/* Management cards for special pages */}
                {currentPage === 'inventory' && (
                  <div className="space-y-4">
                    {!hasProfessionalAccess(subscriptionTier) ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="font-bold text-gray-700 text-lg mb-2">Inventory Management</h3>
                        <p className="text-sm text-gray-500 mb-4">Upgrade to a Professional plan to manage your equipment inventory, upload product images, and sync your catalog.</p>
                        <button
                          onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=billing`)}
                          className="bg-[#1E3A6E] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#152C54] transition-colors"
                        >
                          Upgrade Plan →
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-blue-900 text-lg mb-2">Manage Inventory</h3>
                            <p className="text-sm text-blue-700 mb-4">Add products, update stock levels, upload images, and manage your equipment catalog from the Settings page.</p>
                            <button
                              onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=inventory`)}
                              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                            >
                              Open Inventory Settings →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentPage === 'service' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-[#1E3A6E]/20 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#1E3A6E] rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🔧</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-[#0C1B33] text-lg mb-2">Manage Services</h3>
                          <p className="text-sm text-[#1E3A6E] mb-4">Configure your service offerings and descriptions that display on your service page.</p>
                          <button
                            onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=service`)}
                            className="bg-[#1E3A6E] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#152C54] transition-colors inline-flex items-center gap-2"
                          >
                            Open Service Settings →
                          </button>
                        </div>
                      </div>
                    </div>
                    {!hasProfessionalAccess(subscriptionTier) && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">🔒</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-700 text-sm mb-1">Service Scheduling Add-On</h4>
                            <p className="text-xs text-gray-500 mb-3">Let customers book service appointments directly from your website with online scheduling.</p>
                            <button
                              onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=billing`)}
                              className="bg-[#1E3A6E] text-white px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-[#152C54] transition-colors"
                            >
                              Upgrade to Unlock →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentPage === 'rentals' && (
                  <div className="space-y-4">
                    {!hasProfessionalAccess(subscriptionTier) ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="font-bold text-gray-700 text-lg mb-2">Rental Scheduling</h3>
                        <p className="text-sm text-gray-500 mb-4">Upgrade to a Professional plan to manage rental equipment, set rates, track availability, and accept online bookings.</p>
                        <button
                          onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=billing`)}
                          className="bg-[#1E3A6E] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#152C54] transition-colors"
                        >
                          Upgrade Plan →
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🚜</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-orange-900 text-lg mb-2">Manage Rentals</h3>
                            <p className="text-sm text-orange-700 mb-4">Add rental equipment, set daily/weekly rates, manage availability calendar, and track rental bookings.</p>
                            <button
                              onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=rentals`)}
                              className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
                            >
                              Open Rentals Settings →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentPage === 'manufacturers' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          🏭
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-purple-900 text-lg mb-2">
                            Manage Manufacturers
                          </h3>
                          <p className="text-sm text-purple-700 mb-4">
                            Add manufacturer logos, descriptions, and links. Showcase which brands you're an authorized dealer for.
                          </p>
                          <button
                            onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=manufacturers`)}
                            className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                          >
                            Open Manufacturers Settings →
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <strong>💡 Tip:</strong> Upload manufacturer logos for a professional look. Recommended size: 200x100px.
                      </p>
                    </div>
                  </div>
                )}

                {currentPage === 'contact' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          📧
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-cyan-900 text-lg mb-2">
                            Contact Form Settings
                          </h3>
                          <p className="text-sm text-cyan-700 mb-4">
                            Configure where contact form submissions are sent and set up email notifications for new inquiries.
                          </p>
                          <button
                            onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=contact`)}
                            className="bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-cyan-700 transition-colors inline-flex items-center gap-2"
                          >
                            Open Contact Settings →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add management cards for homepage sections */}
                {currentPage === 'index' && activeSection === 'testimonials' && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          💬
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-pink-900 mb-1.5">
                            Manage Testimonials
                          </h4>
                          <p className="text-xs text-pink-700 mb-3">
                            Add, edit, or remove customer testimonials from Settings.
                          </p>
                          <button
                            onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=testimonials`)}
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
                          >
                            Manage Testimonials →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 'index' && activeSection === 'manufacturers' && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          🏭
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-900 mb-1.5">
                            Manage Manufacturers
                          </h4>
                          <p className="text-xs text-purple-700 mb-3">
                            Add manufacturer logos, descriptions, and links from Settings.
                          </p>
                          <button
                            onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=manufacturers`)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                          >
                            Manage Manufacturers →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 'index' && activeSection === 'featured' && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          ⭐
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1.5">
                            Manage Inventory
                          </h4>
                          <p className="text-xs text-blue-700 mb-3">
                            Add products to your inventory to display in this section.
                          </p>
                          <button
                            onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=inventory`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                          >
                            Manage Inventory →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Colors</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Color</label>
                      <input
                        type="color"
                        value={colors.primary}
                        onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Secondary Color</label>
                      <input
                        type="color"
                        value={colors.secondary}
                        onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Accent Color</label>
                      <input
                        type="color"
                        value={colors.accent}
                        onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Typography</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Heading Font</label>
                      <select
                        value={fonts.heading}
                        onChange={(e) => setFonts({ ...fonts, heading: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>Open Sans</option>
                        <option>Montserrat</option>
                        <option>Lato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Body Font</label>
                      <select
                        value={fonts.body}
                        onChange={(e) => setFonts({ ...fonts, body: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>Open Sans</option>
                        <option>Lato</option>
                        <option>Source Sans Pro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Page Visibility</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control which pages appear in your navigation menu
                  </p>
                  <div className="space-y-3">
                    {templateConfig?.pages?.map((page: any) => {
                      const premiumPages: Record<string, { requiredTier: string; label: string }> = {
                        'inventory': { requiredTier: 'professional', label: 'Inventory Management' },
                        'rentals': { requiredTier: 'professional', label: 'Rental Scheduling' },
                      };
                      const addOn = premiumPages[page.slug];
                      const isLocked = addOn && (!hasProfessionalAccess(subscriptionTier));
                      
                      return (
                        <div key={page.slug} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${isLocked ? 'bg-gray-50 border border-gray-200' : ''}`}>
                          <label className={`flex items-center gap-3 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={isLocked ? false : pageVisibility[page.slug] !== false}
                              onChange={() => togglePageVisibility(page.slug)}
                              className="rounded"
                              disabled={isLocked}
                            />
                            <span className={`font-medium ${isLocked ? 'text-gray-400' : ''}`}>
                              {isLocked && '🔒 '}{page.name}
                            </span>
                          </label>
                          {isLocked && (
                            <button
                              onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=billing`)}
                              className="text-xs text-[#1E3A6E] font-semibold hover:text-[#1E3A6E] whitespace-nowrap"
                            >
                              Upgrade →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview with Top Controls */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          {/* Top Bar - Sections & Visibility */}
          {activeTab === 'content' && (
            <div className="bg-white border-b flex-shrink-0">
              {/* Section/Subsection Tabs - Scrollable with indicators */}
              <div className="relative">
                {/* Left shadow indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                
                {/* Scrollable tabs */}
                <div className="px-4 py-3 border-b overflow-x-auto scrollbar-thin scroll-smooth">
                  <div className="flex gap-2 pb-2">
                    {/* For subpages with subsections: show subsection tabs */}
                    {isSubpage && hasSubsections ? (
                      <>
                        {/* "All" tab to show everything */}
                        <div className="relative flex-shrink-0">
                          <button
                            data-section="all"
                            onClick={() => {
                              setActiveSubsection(null);
                              // Scroll preview to top of page
                              const iframe = document.querySelector('iframe');
                              if (iframe?.contentWindow) {
                                iframe.contentWindow.postMessage({ type: 'scrollToSection', section: 'top' }, '*');
                              }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                              activeSubsection === null
                                ? 'bg-[#E85525] text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span>📋</span>
                            <span>All Sections</span>
                          </button>
                        </div>
                        {subsections.map((sub) => {
                          const subIcons: Record<string, string> = {
                            '_heroHeading': '🖼',
                            '_servicesHeading': '⚙',
                            '_service1Heading': '🔧',
                            '_service2Heading': '🔧',
                            '_service3Heading': '🔧',
                            '_whyChooseHeading': '⭐',
                            '_ctaHeading': '▶',
                            '_formHeading': '✉',
                            '_filtersHeading': '◧',
                            '_rentalInfoHeading': '↻',
                            '_contentHeading': '◈',
                          };
                          return (
                          <div key={sub.key} className="relative flex-shrink-0">
                            <button
                              data-section={sub.key}
                              onClick={() => {
                                setActiveSubsection(sub.key);
                                // Scroll preview to this subsection
                                const iframe = document.querySelector('iframe');
                                if (iframe?.contentWindow) {
                                  iframe.contentWindow.postMessage({ type: 'scrollToSection', section: sub.key }, '*');
                                }
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                activeSubsection === sub.key
                                  ? 'bg-[#E85525] text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <span>{subIcons[sub.key] || '📄'}</span>
                              <span>{sub.label}</span>
                            </button>
                          </div>
                        )})}
                      </>
                    ) : (
                      /* For home page: show regular section tabs */
                      sections.map((section) => {
                      // Check if this is a premium add-on section
                      const premiumAddOns: Record<string, { requiredTier: string; label: string }> = {
                        'inventoryPage': { requiredTier: 'professional', label: 'Inventory Management' },
                        'rentalsPage': { requiredTier: 'professional', label: 'Rental Scheduling' },
                      };
                      const addOn = premiumAddOns[section.key];
                      const isLocked = addOn && !hasProfessionalAccess(subscriptionTier);
                      
                      return (
                        <div key={section.key} className="relative group/sec flex-shrink-0">
                          <button
                            data-section={section.key}
                            onClick={() => {
                              if (!isLocked) {
                                scrollToSection(section.key);
                              }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                              isLocked
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : activeSection === section.key
                                  ? 'bg-[#E85525] text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span>{isLocked ? '🔒' : section.icon}</span>
                            <span>{section.label}</span>
                          </button>
                          {isLocked && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/sec:opacity-100 transition-opacity z-50 shadow-lg">
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-4px] w-2 h-2 bg-gray-900 rotate-45"></div>
                              <p className="font-semibold mb-1">Premium Add-On</p>
                              <p className="text-gray-300">{addOn.label} requires a {addOn.requiredTier} plan or above.</p>
                              <button
                                onClick={() => router.push(`/dashboard/settings/${params.siteId}?tab=billing`)}
                                className="text-[#E85525] font-medium mt-1.5 hover:text-[#F06A3E] cursor-pointer"
                              >
                                Upgrade to unlock →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                    )}
                  </div>
                </div>
                
                {/* Right shadow indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              </div>

              {/* Section Visibility Controls */}
              <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
                {isSubpage && hasSubsections ? (
                  /* Subpage: visibility toggles for subsections */
                  <>
                    {subsections.map((sub) => {
                      const visKey = `${activeSection}.${sub.key}`;
                      const isVisible = sectionVisibility[visKey] !== false;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setSectionVisibility({
                              ...sectionVisibility,
                              [visKey]: !isVisible,
                            });
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            isVisible 
                              ? 'bg-[#E8DDD3] text-[#1E3A6E] hover:bg-[#D4C4B5]' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 line-through'
                          }`}
                          title={isVisible ? `Hide ${sub.label}` : `Show ${sub.label}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                          {sub.label}
                        </button>
                      );
                    })}
                    <span className="text-xs text-gray-400 ml-auto">
                      {subsections.filter(s => sectionVisibility[`${activeSection}.${s.key}`] !== false).length}/{subsections.length} visible
                    </span>
                  </>
                ) : (
                  /* Home page: visibility toggles for sections */
                  <>
                    {sections.map((section) => {
                      const isVisible = sectionVisibility[section.key] !== false;
                      return (
                        <button
                          key={section.key}
                          onClick={() => toggleSectionVisibility(section.key)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            isVisible 
                              ? 'bg-[#E8DDD3] text-[#1E3A6E] hover:bg-[#D4C4B5]' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 line-through'
                          }`}
                          title={isVisible ? `Hide ${section.label}` : `Show ${section.label}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                          {section.label}
                        </button>
                      );
                    })}
                    <span className="text-xs text-gray-400 ml-auto">
                      {sections.filter(s => sectionVisibility[s.key] !== false).length}/{sections.length} visible
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Preview - Fixed in place, no horizontal scroll */}
          <div className="flex-1 p-4 overflow-hidden flex items-center justify-center">
            <div className="w-full max-w-6xl h-full">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F5F0EB]0"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-400">
                    Preview
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    key={previewKey}
                    src={`/api/preview/${params.siteId}?page=${currentPage}&t=${previewKey}`}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
