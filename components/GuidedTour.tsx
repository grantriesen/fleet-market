'use client';

import { useState, useEffect, useCallback } from 'react';

/* ═══════════════════════════════════════════
   TOUR STEP DEFINITIONS
   Each step targets a page + section in the customizer
   ═══════════════════════════════════════════ */
interface TourStep {
  id: string;
  page: string;        // 'index' | 'service' | 'contact' | 'manufacturers'
  section: string;      // section key like 'hero', 'cta', 'servicePage'
  title: string;
  description: string;
  tab?: 'content' | 'design' | 'pages';
  // Hint about where to look in the UI
  focusHint?: string;
  // Which UI area to highlight: 'sidebar' | 'pageNav' | 'designTab' | 'preview'
  focusTarget?: 'sidebar' | 'pageNav' | 'designTab' | 'preview';
  // If true, this step only shows for templates that have this section
  templateSections?: string[];
}

// Universal tour steps that work across all templates
const BASE_TOUR_STEPS: TourStep[] = [
  // ── HOME PAGE ──
  {
    id: 'hero', focusTarget: 'sidebar',
    page: 'index',
    section: 'hero',
    title: 'Hero Section',
    description: 'This is the first thing visitors see. Add a compelling headline, subtitle, and a background image to make a great first impression.',
    focusHint: '👈 Edit the hero fields in the left sidebar. Watch the preview update live on the right.',
  },
  {
    id: 'featured', focusTarget: 'sidebar',
    page: 'index',
    section: 'featured',
    title: 'Featured Products',
    description: 'This section highlights your top equipment. Products from your inventory will display here automatically once you add them.',
    focusHint: '👈 Update the heading and subheading in the sidebar to customize this section.',
  },
  {
    id: 'manufacturers', focusTarget: 'sidebar',
    page: 'index',
    section: 'manufacturers',
    title: 'Manufacturers',
    description: 'Showcase the brands you carry. Add manufacturer logos to build credibility with visitors.',
    focusHint: '👈 Edit manufacturer details in the left sidebar.',
  },
  {
    id: 'testimonials', focusTarget: 'sidebar',
    page: 'index',
    section: 'testimonials',
    title: 'Testimonials',
    description: 'Customer quotes build trust. Add real testimonials from your best customers.',
    focusHint: '👈 Add customer quotes, names, and companies in the sidebar fields.',
  },
  {
    id: 'cta', focusTarget: 'sidebar',
    page: 'index',
    section: 'cta',
    title: 'Call to Action',
    description: 'This section drives visitors to take action — call, visit, or request a quote. Make your message clear and compelling.',
    focusHint: '👈 Write your CTA headline and button text in the sidebar.',
  },
  // Template-specific home sections
  {
    id: 'trustBadges', focusTarget: 'sidebar',
    page: 'index',
    section: 'trustBadges',
    title: 'Trust Badges',
    description: 'Highlight your certifications, guarantees, and key selling points with icons and short descriptions.',
    focusHint: '👈 Customize each badge title, description, and icon in the sidebar.',
    templateSections: ['trustBadges'],
  },
  {
    id: 'stats', focusTarget: 'sidebar',
    page: 'index',
    section: 'stats',
    title: 'Stats & Numbers',
    description: 'Show off your track record with impressive numbers — years in business, customers served, equipment sold.',
    focusHint: '👈 Enter your stats numbers and labels in the sidebar.',
    templateSections: ['stats'],
  },
  {
    id: 'valueProps', focusTarget: 'sidebar',
    page: 'index',
    section: 'valueProps',
    title: 'Value Propositions',
    description: 'Tell visitors why they should choose you. Highlight what makes your dealership different.',
    focusHint: '👈 Edit your value propositions in the sidebar fields.',
    templateSections: ['valueProps'],
  },

  // ── PAGE NAVIGATION HINT ──
  {
    id: 'pageNav', focusTarget: 'pageNav',
    page: 'service',
    section: 'servicePage',
    title: 'Editing Other Pages',
    description: "You've finished the home page! Now let's set up your inner pages. Notice the page tabs above the sidebar — use those to switch between Home, Service, Contact, and Manufacturers pages.",
    focusHint: '👆 Look at the "Editing Page" row at the top of the sidebar. Click the tabs to switch pages.',
  },

  // ── INNER PAGES ──
  {
    id: 'servicePage', focusTarget: 'sidebar',
    page: 'service',
    section: 'servicePage',
    title: 'Service Page',
    description: 'Describe your service and repair offerings. Include details about what you service and how customers can schedule.',
    focusHint: '👈 Fill in your service page heading, description, and service types.',
  },
  {
    id: 'manufacturersPage', focusTarget: 'sidebar',
    page: 'manufacturers',
    section: 'manufacturersPage',
    title: 'Manufacturers Page',
    description: 'Expand on your brand partnerships. Add intro text and highlight why you chose these manufacturers.',
    focusHint: '👈 Add your manufacturers page intro text in the sidebar.',
  },
  {
    id: 'contactPage', focusTarget: 'sidebar',
    page: 'contact',
    section: 'contactPage',
    title: 'Contact Page',
    description: 'Make it easy for customers to reach you. Your address and phone are already filled in from onboarding.',
    focusHint: '👈 Review and customize your contact page content in the sidebar.',
  },

  // ── DESIGN ──
  {
    id: 'colors', focusTarget: 'designTab',
    page: 'index',
    section: 'hero',
    title: 'Colors & Branding',
    description: 'Choose your brand colors. These apply to your entire site — buttons, headers, accents, and more.',
    tab: 'design',
    focusHint: '👈 Click the "Design" tab at the top of the sidebar, then pick your colors.',
  },
];

/* ═══════════════════════════════════════════
   GET TOUR STEPS FOR A SPECIFIC TEMPLATE
   Filters out steps for sections the template doesn't have
   and skips premium features the user hasn't subscribed to
   ═══════════════════════════════════════════ */
export function getTourSteps(
  templateSections: Record<string, any>,
  subscriptionTier: string = 'base'
): TourStep[] {
  const sectionKeys = Object.keys(templateSections || {});
  const hasPremium = ['professional', 'enterprise'].includes(subscriptionTier);

  return BASE_TOUR_STEPS.filter(step => {
    // Filter by template sections
    if (step.templateSections && !step.templateSections.some(s => sectionKeys.includes(s))) {
      return false;
    }
    // Filter premium pages — inventory and rentals pages require professional tier
    if (!hasPremium && (step.page === 'inventory' || step.page === 'rentals')) {
      return false;
    }
    // Filter premium sections — inventoryPage and rentalsPage sections
    if (!hasPremium && (step.section === 'inventoryPage' || step.section === 'rentalsPage')) {
      return false;
    }
    return true;
  });
}

/* ═══════════════════════════════════════════
   COMPLETION CHECKLIST
   Checks which sections have non-default content
   ═══════════════════════════════════════════ */
interface ChecklistItem {
  id: string;
  label: string;
  page: string;
  section: string;
  complete: boolean;
}

export function getCompletionChecklist(
  content: Record<string, string>,
  templateSections: Record<string, any>
): ChecklistItem[] {
  const sectionKeys = Object.keys(templateSections || {});

  const items: ChecklistItem[] = [
    {
      id: 'hero', focusTarget: 'sidebar', label: 'Hero Section', page: 'index', section: 'hero',
      complete: !!(content['hero.heading'] || content['hero.headline'] || content['hero.title']),
    },
    {
      id: 'testimonials', focusTarget: 'sidebar', label: 'Testimonials', page: 'index', section: 'testimonials',
      complete: !!(content['testimonials.quote'] || content['testimonials.testimonial1Quote'] || content['testimonials.heading']),
    },
    {
      id: 'cta', focusTarget: 'sidebar', label: 'Call to Action', page: 'index', section: 'cta',
      complete: !!(content['cta.heading'] || content['cta.headline']),
    },
    {
      id: 'manufacturers', label: 'Manufacturers', page: 'index', section: 'manufacturers',
      complete: !!(content['manufacturers.heading']),
    },
    {
      id: 'servicePage', focusTarget: 'sidebar', label: 'Service Page', page: 'service', section: 'servicePage',
      complete: !!(content['servicePage.heading']),
    },
    {
      id: 'contactPage', focusTarget: 'sidebar', label: 'Contact Page', page: 'contact', section: 'contactPage',
      complete: !!(content['contactPage.heading']),
    },
    {
      id: 'hours', label: 'Business Hours', page: 'index', section: 'businessHours',
      complete: !!(content['hours.weekdays']),
    },
  ];

  // Add template-specific items
  if (sectionKeys.includes('trustBadges')) {
    items.splice(1, 0, {
      id: 'trustBadges', focusTarget: 'sidebar', label: 'Trust Badges', page: 'index', section: 'trustBadges',
      complete: !!(content['trustBadges.badge1Title']),
    });
  }
  if (sectionKeys.includes('stats')) {
    items.splice(2, 0, {
      id: 'stats', focusTarget: 'sidebar', label: 'Stats', page: 'index', section: 'stats',
      complete: !!(content['stats.stat1Number'] || content['stats.stat1Value']),
    });
  }
  if (sectionKeys.includes('valueProps')) {
    items.splice(1, 0, {
      id: 'valueProps', focusTarget: 'sidebar', label: 'Value Props', page: 'index', section: 'valueProps',
      complete: !!(content['valueProps.prop1Title']),
    });
  }

  return items;
}

/* ═══════════════════════════════════════════
   GET CURRENT FOCUS TARGET
   Used by the customizer to highlight UI areas
   ═══════════════════════════════════════════ */
export function getCurrentFocusTarget(
  steps: TourStep[],
  currentStep: number
): string | undefined {
  return steps[currentStep]?.focusTarget;
}

/* ═══════════════════════════════════════════
   GUIDED TOUR OVERLAY COMPONENT
   ═══════════════════════════════════════════ */
interface GuidedTourProps {
  active: boolean;
  steps: TourStep[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

export function GuidedTourOverlay({
  active,
  steps,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onFinish,
}: GuidedTourProps) {
  if (!active || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Position based on focus target
  const isLeftFocus = step.focusTarget === 'sidebar' || step.focusTarget === 'pageNav' || step.focusTarget === 'designTab';

  return (
    <>
      {/* Subtle overlay to dim the non-focused area */}
      {isLeftFocus && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'calc(100% - 384px)', // everything except the sidebar
          background: 'rgba(0,0,0,0.03)',
          zIndex: 9998,
          pointerEvents: 'none',
        }} />
      )}

      <div
        style={{
          position: 'fixed',
          // If sidebar focused: bottom-left, next to the sidebar. Otherwise: bottom-right
          bottom: 24,
          ...(isLeftFocus
            ? { left: 408, right: 'auto' }
            : { right: 24, left: 'auto' }
          ),
          width: 360,
          zIndex: 9999,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        <div style={{
          background: 'white',
          borderRadius: 14,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Progress Bar */}
          <div style={{ height: 3, background: '#f3f4f6' }}>
            <div style={{
              height: '100%', width: `${progress}%`, background: '#E85525',
              transition: 'width 0.4s ease',
              borderRadius: '0 2px 2px 0',
            }} />
          </div>

          {/* Content */}
          <div style={{ padding: '1.25rem 1.5rem 1rem' }}>
            {/* Step counter + page badge */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#E85525',
              }}>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280',
                padding: '2px 8px', background: '#f3f4f6', borderRadius: 4,
              }}>
                {step.tab === 'design' ? 'Design' : step.page === 'index' ? 'Home' : step.page.charAt(0).toUpperCase() + step.page.slice(1)}
              </span>
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '1rem', fontWeight: 700, color: '#111827',
              marginBottom: 6, lineHeight: 1.3,
            }}>
              {step.title}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.55,
              marginBottom: 14,
            }}>
              {step.description}
            </p>

            {/* Focus hint - with arrow indicator */}
            {step.focusHint && (
              <div style={{
                fontSize: '0.8125rem', color: '#1E3A6E', background: '#FFF5F2',
                padding: '8px 12px', borderRadius: 8, marginBottom: 14,
                border: '1px solid #FDDDD4',
                lineHeight: 1.5, fontWeight: 500,
              }}>
                {step.focusHint}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={onSkip}
                style={{
                  fontSize: '0.8125rem', color: '#9ca3af', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '6px 0',
                }}
              >
                Skip tour
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                {!isFirst && (
                  <button
                    onClick={onPrev}
                    style={{
                      padding: '7px 14px', fontSize: '0.8125rem', fontWeight: 600,
                      background: '#f3f4f6', border: 'none', borderRadius: 8,
                      color: '#374151', cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={isLast ? onFinish : onNext}
                  style={{
                    padding: '7px 18px', fontSize: '0.8125rem', fontWeight: 600,
                    background: '#E85525', border: 'none', borderRadius: 8,
                    color: 'white', cursor: 'pointer',
                  }}
                >
                  {isLast ? 'Finish Tour ✓' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow pointing left toward the sidebar */}
        {isLeftFocus && (
          <div style={{
            position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid white',
            filter: 'drop-shadow(-2px 0 2px rgba(0,0,0,0.06))',
          }} />
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   COMPLETION CHECKLIST WIDGET
   Persistent floating widget showing progress
   ═══════════════════════════════════════════ */
interface ChecklistWidgetProps {
  items: ChecklistItem[];
  onItemClick: (item: ChecklistItem) => void;
  onStartTour: () => void;
}

export function CompletionChecklist({ items, onItemClick, onStartTour }: ChecklistWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const completed = items.filter(i => i.complete).length;
  const total = items.length;
  const progress = Math.round((completed / total) * 100);

  if (completed === total) return null; // All done — hide widget

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {expanded ? (
        <div style={{
          width: 320, background: 'white', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem', background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Setup Progress
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 0' }}>
                {completed}/{total} sections complete
              </p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'none', border: 'none', color: '#9ca3af',
                fontSize: '1.25rem', cursor: 'pointer', padding: 4,
              }}
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: '#e5e7eb' }}>
            <div style={{
              height: '100%', width: `${progress}%`, background: '#E85525',
              transition: 'width 0.3s',
            }} />
          </div>

          {/* Checklist items */}
          <div style={{ padding: '0.5rem 0', maxHeight: 300, overflowY: 'auto' }}>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => { onItemClick(item); setExpanded(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.625rem 1.25rem', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: item.complete ? '#E85525' : '#e5e7eb',
                  color: item.complete ? 'white' : '#9ca3af',
                  fontSize: '0.6875rem', fontWeight: 700,
                }}>
                  {item.complete ? '✓' : ''}
                </div>
                <span style={{
                  fontSize: '0.8125rem', fontWeight: 500,
                  color: item.complete ? '#9ca3af' : '#374151',
                  textDecoration: item.complete ? 'line-through' : 'none',
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Resume tour link */}
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => { onStartTour(); setExpanded(false); }}
              style={{
                width: '100%', padding: '8px', background: '#FFF5F2', border: '1px solid #F9C4B4',
                borderRadius: 8, color: '#E85525', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              Resume Guided Tour →
            </button>
          </div>
        </div>
      ) : (
        // Collapsed pill
        <button
          onClick={() => setExpanded(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', background: 'white', border: 'none',
            borderRadius: 50, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Mini progress ring */}
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
            <circle
              cx="14" cy="14" r="12" fill="none" stroke="#E85525" strokeWidth="2.5"
              strokeDasharray={`${progress * 0.754} 100`}
              strokeLinecap="round"
              transform="rotate(-90 14 14)"
            />
            <text x="14" y="14" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: '0.5rem', fontWeight: 700, fill: '#374151' }}>
              {completed}/{total}
            </text>
          </svg>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
            Setup Progress
          </span>
        </button>
      )}
    </div>
  );
}
