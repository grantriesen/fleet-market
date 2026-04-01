'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { GuidedTourOverlay, CompletionChecklist, getTourSteps, getCompletionChecklist, getCurrentFocusTarget } from '@/components/GuidedTour';

type Tab = 'content' | 'design' | 'pages';

// ── ButtonFieldWidget — standalone to prevent focus loss on re-render ──
interface ButtonFieldWidgetProps {
  fieldKey: string;
  field: any;
  content: Record<string, string>;
  updateContent: (key: string, value: string) => void;
  templateConfig: any;
}

function ButtonFieldWidget({ fieldKey, field, content, updateContent, templateConfig }: ButtonFieldWidgetProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const btnTextKey = `${fieldKey}.text`;
  const btnDestKey = `${fieldKey}.destination`;
  const btnTextVal = content[btnTextKey] !== undefined ? content[btnTextKey] : (field.defaultText || field.default || '');
  const btnDestVal = content[btnDestKey] !== undefined ? content[btnDestKey] : (field.defaultDestination || '');
  const bfPages = templateConfig?.pages || [];
  const selectedPage = bfPages.find((p: any) => p.slug === btnDestVal);
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {field.label}
        {(field.helpText || field.help) && (
          <span className="text-xs text-gray-500 block mt-1">{field.helpText || field.help}</span>
        )}
      </label>
      <div className="flex gap-1.5 items-stretch">
        <input
          type="text"
          value={btnTextVal}
          onChange={(e) => updateContent(btnTextKey, e.target.value)}
          className="flex-1 px-3 py-2 border rounded text-sm"
          placeholder={field.defaultText || field.default || 'Button label'}
        />
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            title={selectedPage ? `Links to: ${selectedPage.name}` : 'Set link destination'}
            className={`h-full px-2.5 border rounded flex items-center justify-center transition-colors ${selectedPage || btnDestVal ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-400'}`}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded shadow-lg min-w-[160px]">
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { updateContent(btnDestKey, ''); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${!btnDestVal ? 'font-semibold text-blue-600' : 'text-gray-500'}`}
                >
                  No link
                </button>
                <div className="border-t my-1" />
                {bfPages.map((p: any) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => { updateContent(btnDestKey, p.slug); setOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${btnDestVal === p.slug ? 'font-semibold text-blue-600' : 'text-gray-700'}`}
                  >
                    {p.name}
                  </button>
                ))}
                <div className="border-t my-1" />
                <button
                  type="button"
                  onClick={() => { updateContent(btnDestKey, '__custom'); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${btnDestVal === '__custom' ? 'font-semibold text-blue-600' : 'text-gray-500'}`}
                >
                  Custom URL...
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {btnDestVal === '__custom' && (
        <input
          type="text"
          value={content[`${btnDestKey}_url`] || ''}
          onChange={(e) => updateContent(`${btnDestKey}_url`, e.target.value)}
          className="w-full px-3 py-2 border rounded mt-2 text-sm"
          placeholder="https://example.com"
        />
      )}
      {selectedPage && !open && (
        <p className="text-xs text-blue-500 mt-1">→ {selectedPage.name}</p>
      )}
    </div>
  );
}

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Site data
  const [siteName, setSiteName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateSlug, setTemplateSlug] = useState('');
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [subscriptionTier, setSubscriptionTier] = useState('basic');
  const [siteAddons, setSiteAddons] = useState<string[]>([]);
  
  // Guided Tour state
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  
  // Addon helpers — replaces hasProfessionalAccess
  const hasInventory = (addons = siteAddons) => addons.includes('inventory');
  const hasService   = (addons = siteAddons) => addons.includes('service') || addons.includes('service_scheduling');
  const hasRentals   = (addons = siteAddons) => addons.includes('rentals') || addons.includes('rental_scheduling');
  
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

  // Publish / Deploy state
  const [showDeployPanel, setShowDeployPanel] = useState(false);
  const [published, setPublished] = useState(false);
  const [siteSlug, setSiteSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [sitePassword, setSitePassword] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadSiteData();
  }, []);

  // Reload preview when switching pages
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const ts = Date.now();
      iframe.src = `/api/preview/${params.siteId}?page=${currentPage}&t=${ts}`;
    } else {
      // Fallback for initial load before ref is set
      setPreviewKey(Date.now());
    }
  }, [currentPage]);

  const loadSiteData = async () => {
    try {
      // Load site with template config
      const { data: site } = await supabase
        .from('sites')
        .select(`
          id,
          site_name,
          slug,
          subscription_tier,
          addons,
          published,
          custom_domain,
          site_password,
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
        const addons: string[] = site.addons || [];
        setSiteAddons(addons);
        setPublished(site.published || false);
        setSiteSlug(site.slug || '');
        setCustomDomain(site.custom_domain || '');
        setSitePassword(site.site_password || '');
        
        // Initialize section visibility from template sections
        const sections = site.template.config_json.sections || {};
        const initialVisibility: Record<string, boolean> = {};
        Object.keys(sections).forEach(key => {
          initialVisibility[key] = true;
        });
        // Lock addon-gated sections based on purchased addons
        if (!hasInventory(addons)) {
          initialVisibility.featured = false;
          initialVisibility.inventoryPage = false;
        }
        if (!hasRentals(addons)) {
          initialVisibility.rentalsPage = false;
        }
        setSectionVisibility(initialVisibility);

        // Default addon-gated pages to hidden if addon not purchased
        const initialPageVis: Record<string, boolean> = {};
        (site.template.config_json.pages || []).forEach((p: any) => {
          if (p.slug === 'inventory') initialPageVis[p.slug] = hasInventory(addons);
          else if (p.slug === 'rentals') initialPageVis[p.slug] = hasRentals(addons);
          else initialPageVis[p.slug] = true;
        });
        setPageVisibility(initialPageVis);
      }

      // Load content
      const { data: contentData } = await supabase
        .from('site_content')
        .select('field_key, value')
        .eq('site_id', params.siteId);

      const loadedContent: Record<string, string> = {};
      contentData?.forEach((item: any) => {
        loadedContent[item.field_key] = item.value || '';
      });
      setContent(loadedContent);

      // Load customizations
      const { data: customData } = await supabase
        .from('site_customizations')
        .select('customization_type, config_json')
        .eq('site_id', params.siteId);

      customData?.forEach((item: any) => {
        if (item.customization_type === 'colors') {
          setColors(item.config_json);
        } else if (item.customization_type === 'fonts') {
          setFonts(item.config_json);
        } else if (item.customization_type === 'section_visibility') {
          const savedVisibility = item.config_json;
          const currentAddons: string[] = site?.addons || [];
          if (!hasInventory(currentAddons)) {
            savedVisibility.featured = false;
            savedVisibility.inventoryPage = false;
          }
          if (!hasRentals(currentAddons)) {
            savedVisibility.rentalsPage = false;
          }
          setSectionVisibility(savedVisibility);
        } else if (item.customization_type === 'page_visibility') {
          const savedPageVis = item.config_json;
          const currentAddons: string[] = site?.addons || [];
          if (!hasInventory(currentAddons)) savedPageVis.inventory = false;
          if (!hasRentals(currentAddons)) savedPageVis.rentals = false;
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
    
    // Template-specific field exclusions to prevent duplicate UI fields
    // zenith-lawn uses hero.image; hero.backgroundImage is redundant
    const templateFieldExclusions: Record<string, Record<string, string[]>> = {
      'zenith-lawn': { hero: ['backgroundImage'] },
    };
    const templateExcludes = templateFieldExclusions[templateSlug]?.[sectionKey] || [];

    return Object.entries(section)
      .filter(([key]) => !excludedKeys.includes(key) && !templateExcludes.includes(key))
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

      // Force preview to reload by directly setting iframe src — avoids React key remount race
      setTimeout(() => {
        const iframe = iframeRef.current;
        if (iframe) {
          const ts = Date.now();
          iframe.src = `/api/preview/${params.siteId}?page=${currentPage}&t=${ts}`;
        }
      }, 300);
      
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
    // Block addon-gated sections if addon not purchased
    const addonGatedSections: Record<string, () => boolean> = {
      'featured':      () => !hasInventory(),
      'inventoryPage': () => !hasInventory(),
      'rentalsPage':   () => !hasRentals(),
    };
    if (addonGatedSections[section]?.()) return;

    setSectionVisibility({
      ...sectionVisibility,
      [section]: !sectionVisibility[section],
    });
  };

  const togglePageVisibility = (page: string) => {
    // Block addon-gated pages if addon not purchased
    const addonGatedPages: Record<string, () => boolean> = {
      'inventory': () => !hasInventory(),
      'rentals':   () => !hasRentals(),
    };
    if (addonGatedPages[page]?.()) return;

    setPageVisibility({
      ...pageVisibility,
      [page]: !pageVisibility[page],
    });
  };

  // Maps customizer section keys to template data-section attribute values
  const SECTION_KEY_MAP: Record<string, string> = {
    // Home page sections
    'hero':          'hero',
    'featured':      'featured',
    'manufacturers': 'manufacturers',
    'testimonials':  'testimonials',
    'cta':           'cta',
    'about':         'about',
    'whyChoose':     'whyChoose',
    'stats':         'stats',
    // Subpage sections
    'contactPage':      'contactForm',
    'manufacturersPage':'manufacturersList',
    'servicePage':      'serviceTypes',
    'inventoryPage':    'inventoryGrid',
    'rentalsPage':      'rentalsList',
  };

  // Debounce ref — prevents re-scrolling on every keystroke
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrolledSection = useRef<string>('');

  const scrollToSection = (section: string) => {
    // Always update active section and scroll the tab
    setActiveSection(section);
    setTimeout(() => {
      const button = document.querySelector(`button[data-section="${section}"]`);
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 50);

    // Only scroll the preview if we're moving to a different section
    // and debounce so rapid field-to-field tabbing doesn't cause thrashing
    if (lastScrolledSection.current === section) return;

    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      lastScrolledSection.current = section;
      const mappedSection = SECTION_KEY_MAP[section] || section;
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'scrollToSection', section: mappedSection },
          '*'
        );
      }
    }, 150);
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

      case 'iconText': {
        const iconKey = `${fieldKey}.icon`;
        const textKey = `${fieldKey}.text`;
        const descKey = `${fieldKey}.description`;
        const iconVal = content[iconKey] !== undefined ? content[iconKey] : (field.defaultIcon || '🔧');
        const textVal = content[textKey] !== undefined ? content[textKey] : (field.defaultText || field.default || '');
        const descVal = content[descKey] !== undefined ? content[descKey] : (field.defaultDescription || '');
        const iconIsImage = iconVal.startsWith('http') || iconVal.startsWith('/');
        const emojiVal = iconIsImage ? (field.defaultIcon || '🔧') : iconVal;
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {(field.helpText || field.help) && (
                <span className="text-xs text-gray-500 block mt-1">{field.helpText || field.help}</span>
              )}
            </label>
            <div className="flex gap-3 items-start">
              <div className="flex flex-col gap-1.5 flex-shrink-0" style={{width: '88px'}}>
                <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden mx-auto">
                  {iconIsImage
                    ? <img src={iconVal} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl leading-none">{iconVal}</span>
                  }
                </div>
                <input
                  type="text"
                  value={emojiVal}
                  onChange={(e) => updateContent(iconKey, e.target.value)}
                  className="w-full px-2 py-1 border rounded text-center text-base"
                  placeholder="🔧"
                  title="Type an emoji"
                  maxLength={4}
                />
                <span className="text-xs text-center text-gray-400 leading-none">or upload</span>
                <ImageUpload
                  value={iconIsImage ? iconVal : ''}
                  onChange={(url) => updateContent(iconKey, url || emojiVal || (field.defaultIcon || '🔧'))}
                  siteId={params.siteId}
                  fieldKey={iconKey}
                  label=""
                  helpText=""
                  compact={true}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={textVal}
                  onChange={(e) => updateContent(textKey, e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder={field.defaultText || field.default || 'Label'}
                />
                {field.withDescription && (
                  <textarea
                    value={descVal}
                    onChange={(e) => updateContent(descKey, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder={field.defaultDescription || 'Description...'}
                  />
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'buttonField':
        return <ButtonFieldWidget key={field.key} fieldKey={fieldKey} field={field} content={content} updateContent={updateContent} templateConfig={templateConfig} />;

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

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const deployedUrl = customDomain
        ? `https://${customDomain}`
        : `https://${siteSlug}.fleetmarket.us`;

      const { error } = await supabase
        .from('sites')
        .update({
          published: true,
          deployed_url: deployedUrl,
          deployment_status: 'live',
          last_deployed_at: new Date().toISOString(),
          custom_domain: customDomain || null,
          site_password: sitePassword || null,
        })
        .eq('id', params.siteId);

      if (error) throw error;
      setPublished(true);
      setShowDeployPanel(false);
      setToast({ message: '🚀 Site is now live!', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Failed to publish: ${e.message}`, type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      await supabase
        .from('sites')
        .update({ published: false, deployment_status: 'draft' })
        .eq('id', params.siteId);
      setPublished(false);
      setToast({ message: 'Site unpublished.', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Failed to unpublish: ${e.message}`, type: 'error' });
    }
  };

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
      {/* Deploy / Publish Panel */}
      {showDeployPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeployPanel(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Go Live</h2>
              <button onClick={() => setShowDeployPanel(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex-1 px-6 py-6 space-y-6">

              {/* Status */}
              <div className={`flex items-center gap-3 p-4 rounded-lg ${published ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${published ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-semibold text-sm">{published ? 'Live' : 'Draft'}</p>
                  {published && (
                    <a
                      href={`https://${siteSlug}.fleetmarket.us`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {siteSlug}.fleetmarket.us ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Custom Domain */}
              <div>
                <label className="block text-sm font-medium mb-1">Custom Domain <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="www.yourdealer.com"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Enter your domain exactly as you want it to appear (e.g. <code className="bg-gray-100 px-1 rounded">www.mydealer.com</code> or <code className="bg-gray-100 px-1 rounded">mydealer.com</code>).</p>

                {/* DNS Setup Instructions */}
                <div className="mt-3 border border-blue-100 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3">
                    <p className="text-sm font-semibold text-blue-800">📋 How to connect your domain</p>
                    <p className="text-xs text-blue-600 mt-0.5">Follow these steps in your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)</p>
                  </div>
                  <div className="px-4 py-3 space-y-3 text-sm">

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                      <div>
                        <p className="font-medium text-gray-800">Log in to your domain registrar</p>
                        <p className="text-xs text-gray-500 mt-0.5">Go to the DNS settings or DNS Management section for your domain.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                      <div>
                        <p className="font-medium text-gray-800">Add a CNAME record</p>
                        <p className="text-xs text-gray-500 mt-0.5">Create a new DNS record with these values:</p>
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2 font-mono text-xs space-y-1">
                          <div className="grid grid-cols-3 gap-2 text-gray-400 uppercase text-[10px] font-sans font-semibold pb-1 border-b border-gray-200">
                            <span>Type</span><span>Name / Host</span><span>Value / Points To</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-gray-700">
                            <span className="text-blue-600 font-bold">CNAME</span>
                            <span>www</span>
                            <span>cname.vercel-dns.com</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">If connecting a root/apex domain (mydealer.com without www), use an <strong>A record</strong> pointing to <code className="bg-gray-100 px-0.5 rounded">76.76.21.21</code> instead.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                      <div>
                        <p className="font-medium text-gray-800">Enter your domain above and save</p>
                        <p className="text-xs text-gray-500 mt-0.5">Type your domain in the field above, then click <strong>Update & Republish</strong>. SSL is provisioned automatically.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">4</span>
                      <div>
                        <p className="font-medium text-gray-800">Wait for DNS to propagate</p>
                        <p className="text-xs text-gray-500 mt-0.5">DNS changes typically take 5–30 minutes, sometimes up to 24 hours depending on your registrar. Your site will go live automatically once propagation completes.</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-xs text-amber-700 flex gap-2">
                      <span className="flex-shrink-0">⚠️</span>
                      <span>Need help? Contact us at <strong>support@fleetmarket.us</strong> and we'll walk you through it.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Protection */}
              <div>
                <label className="block text-sm font-medium mb-1">Password Protection <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={sitePassword}
                  onChange={(e) => setSitePassword(e.target.value)}
                  placeholder="Leave blank for public access"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Visitors will need this password to view the site.</p>
              </div>

              {/* Publish / Unpublish */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold"
                >
                  {publishing ? 'Publishing...' : published ? 'Update & Republish' : '🚀 Publish Site'}
                </button>
                {published && (
                  <button
                    onClick={handleUnpublish}
                    className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-lg text-sm font-medium"
                  >
                    Unpublish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
          <button
            onClick={() => setShowDeployPanel(true)}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              published
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${published ? 'bg-green-300' : 'bg-orange-300'}`} />
            {published ? 'Live' : 'Go Live'}
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
                  const pageSlug = page.slug === 'home' ? 'index' : page.slug;
                  const isLocked =
                    (pageSlug === 'inventory' && !hasInventory()) ||
                    (pageSlug === 'rentals'   && !hasRentals());
                  const lockedLabel =
                    pageSlug === 'inventory' ? 'Inventory Management add-on required.' :
                    pageSlug === 'rentals'   ? 'Rental Management add-on required.'    : '';
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
                          <p className="font-semibold mb-1">Add-on Required</p>
                          <p className="text-gray-300">{lockedLabel}</p>
                          <button
                            onClick={() => router.push('/pricing')}
                            className="text-[#E85525] font-medium mt-1.5 hover:text-[#F06A3E] cursor-pointer"
                          >
                            View add-ons →
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
                    {!hasInventory() ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="font-bold text-gray-700 text-lg mb-2">Inventory Management</h3>
                        <p className="text-sm text-gray-500 mb-4">Add the Inventory add-on to manage your equipment catalog, upload product images, and display listings on your site.</p>
                        <button
                          onClick={() => router.push('/pricing')}
                          className="bg-[#E85525] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#D13A24] transition-colors"
                        >
                          Add Inventory →
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
                              onClick={() => router.push('/dashboard/inventory')}
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
                            onClick={() => router.push('/dashboard/service')}
                            className="bg-[#1E3A6E] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#152C54] transition-colors inline-flex items-center gap-2"
                          >
                            Open Service Settings →
                          </button>
                        </div>
                      </div>
                    </div>
                    {!hasService() && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">🔒</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-700 text-sm mb-1">Service Scheduling Add-On</h4>
                            <p className="text-xs text-gray-500 mb-3">Let customers book service appointments directly from your website with online scheduling.</p>
                            <button
                              onClick={() => router.push('/pricing')}
                              className="bg-[#E85525] text-white px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-[#D13A24] transition-colors"
                            >
                              Add Service Scheduling →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentPage === 'rentals' && (
                  <div className="space-y-4">
                    {!hasRentals() ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="font-bold text-gray-700 text-lg mb-2">Rental Management</h3>
                        <p className="text-sm text-gray-500 mb-4">Add the Rental Management add-on to manage rental equipment, set rates, track availability, and accept online bookings.</p>
                        <button
                          onClick={() => router.push('/pricing')}
                          className="bg-[#E85525] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#D13A24] transition-colors"
                        >
                          Add Rental Management →
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
                              onClick={() => router.push('/dashboard/rentals')}
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
                            onClick={() => router.push('/dashboard/manufacturers')}
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
                            onClick={() => router.push('/dashboard/testimonials')}
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
                            onClick={() => router.push('/dashboard/manufacturers')}
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
                            onClick={() => router.push('/dashboard/inventory')}
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
                      const addonRequired: Record<string, { label: string; addon: string }> = {
                        'inventory': { label: 'Inventory Management', addon: 'inventory' },
                        'rentals':   { label: 'Rental Management',    addon: 'rentals'   },
                      };
                      const requirement = addonRequired[page.slug];
                      const isLocked = requirement && (
                        requirement.addon === 'inventory' ? !hasInventory() : !hasRentals()
                      );
                      
                      return (
                        <div key={page.slug} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${isLocked ? 'bg-gray-50 border border-gray-200' : ''}`}>
                          <label className={`flex items-center gap-3 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={isLocked ? false : pageVisibility[page.slug] !== false}
                              onChange={() => togglePageVisibility(page.slug)}
                              className="rounded"
                              disabled={!!isLocked}
                            />
                            <span className={`font-medium ${isLocked ? 'text-gray-400' : ''}`}>
                              {isLocked && '🔒 '}{page.name}
                            </span>
                          </label>
                          {isLocked && (
                            <button
                              onClick={() => router.push('/pricing')}
                              className="text-xs text-[#E85525] font-semibold hover:underline whitespace-nowrap"
                            >
                              Add-on required →
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
                      // Addon-gated sections
                      const addonGated: Record<string, { label: string; locked: boolean }> = {
                        'featured':      { label: 'Inventory Management', locked: !hasInventory() },
                        'inventoryPage': { label: 'Inventory Management', locked: !hasInventory() },
                        'rentalsPage':   { label: 'Rental Management',    locked: !hasRentals()   },
                      };
                      const gate = addonGated[section.key];
                      const isLocked = gate?.locked ?? false;
                      
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
                              <p className="font-semibold mb-1">Add-on Required</p>
                              <p className="text-gray-300">{gate.label} add-on is required to edit this section.</p>
                              <button
                                onClick={() => router.push('/pricing')}
                                className="text-[#E85525] font-medium mt-1.5 hover:text-[#F06A3E] cursor-pointer"
                              >
                                View add-ons →
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
                    ref={iframeRef}
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
