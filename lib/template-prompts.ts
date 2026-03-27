// ─────────────────────────────────────────────────────────────────────────────
// Fleet Market — Template-specific AI onboarding prompts
// Each template has its own field list and tone instructions
// ─────────────────────────────────────────────────────────────────────────────

export interface TemplatePromptConfig {
  tone: string;
  alwaysFields: Record<string, string>;
  inventoryFields: Record<string, string>;
  serviceFields: Record<string, string>;
  rentalsFields: Record<string, string>;
}

export const TEMPLATE_PROMPTS: Record<string, TemplatePromptConfig> = {

  // ── GREEN VALLEY INDUSTRIAL ──────────────────────────────────────────────
  'green-valley-industrial': {
    tone: `Write in a professional, hardworking tone. This template is built for serious equipment dealers — commercial landscapers, contractors, municipalities. Copy should be confident and direct. No fluff. Emphasize expertise, reliability, and professional-grade equipment. Sentence case for headings.`,
    alwaysFields: {
      'hero.heading': 'Homepage hero heading (6-10 words, punchy, emphasizes professional-grade equipment)',
      'hero.subheading': 'Hero subheading (1-2 sentences, what they do and who they serve)',
      'hero.ctaButton.text': 'Primary CTA button text (2-4 words)',
      'hero.secondaryButton.text': 'Secondary CTA button text (2-4 words)',
      'featured.heading': 'Featured equipment section heading (2-4 words)',
      'featured.subheading': 'Featured equipment subheading (1 short sentence)',
      'manufacturers.heading': 'Brands section heading (3-5 words)',
      'manufacturers.subheading': 'Brands section subheading (1 short sentence)',
      'testimonials.heading': 'Testimonials section heading (3-5 words)',
      'cta.heading': 'Bottom CTA section heading (5-8 words, compelling)',
      'cta.subheading': 'Bottom CTA subheading (1-2 sentences encouraging contact)',
      'cta.primaryButton.text': 'CTA primary button text (2-4 words)',
      'cta.secondaryButton.text': 'CTA secondary button text (2-4 words)',
      'footer.tagline': 'Footer tagline (5-8 words, professional brand statement)',
      'contactPage.heading': 'Contact page heading (2-4 words)',
      'contactPage.subheading': 'Contact page description (1-2 sentences)',
      'contactPage.formHeading': 'Contact form heading (3-5 words)',
      'contactPage.locationHeading': 'Location section heading (3-5 words)',
      'manufacturersPage.heading': 'Manufacturers page heading (3-5 words)',
      'manufacturersPage.subheading': 'Manufacturers page description (1-2 sentences)',
      'manufacturersPage.introText': 'Manufacturers page intro paragraph (2-3 sentences about being an authorized dealer)',
    },
    inventoryFields: {
      'inventoryPage.heading': 'Inventory page heading (2-4 words)',
      'inventoryPage.subheading': 'Inventory page description (1 sentence)',
      'inventoryPage.ctaHeading': 'Inventory CTA heading for when customer does not see what they want (5-8 words)',
      'inventoryPage.ctaText': 'Inventory CTA description (1 sentence)',
      'inventoryPage.ctaButton.text': 'Inventory CTA button text (2-4 words)',
      'inventoryPage.filterLabel': 'Filter label text (2-4 words)',
    },
    serviceFields: {
      'servicePage.heading': 'Service page heading (3-5 words)',
      'servicePage.subheading': 'Service page description (1-2 sentences)',
      'servicePage.service1Title': 'First service offering title based on their services (2-4 words)',
      'servicePage.service1Description': 'First service description (1-2 sentences)',
      'servicePage.service2Title': 'Second service offering title (2-4 words)',
      'servicePage.service2Description': 'Second service description (1-2 sentences)',
      'servicePage.service3Title': 'Third service offering title (2-4 words)',
      'servicePage.service3Description': 'Third service description (1-2 sentences)',
      'servicePage.whyChooseHeading': 'Why choose our service section heading (3-6 words)',
      'servicePage.why1Title': 'First benefit title (2-4 words)',
      'servicePage.why1Description': 'First benefit description (1 sentence)',
      'servicePage.why2Title': 'Second benefit title (2-4 words)',
      'servicePage.why2Description': 'Second benefit description (1 sentence)',
      'servicePage.why3Title': 'Third benefit title (2-4 words)',
      'servicePage.why3Description': 'Third benefit description (1 sentence)',
      'servicePage.ctaHeading': 'Service CTA heading (4-6 words)',
      'servicePage.urgentHeading': 'Urgent service card heading (3-5 words)',
      'servicePage.urgentText': 'Urgent service card description (1 sentence)',
      'servicePage.formSubheading': 'Service form subheading (1 sentence)',
    },
    rentalsFields: {
      'rentalsPage.heading': 'Rentals page heading (2-4 words)',
      'rentalsPage.subheading': 'Rentals page description (1-2 sentences)',
      'rentalsPage.ctaHeading': 'Rentals CTA heading (4-6 words)',
      'rentalsPage.ctaText': 'Rentals CTA description (1 sentence)',
      'rentalsPage.ctaButton.text': 'Rentals CTA button text (2-4 words)',
      'rentalsPage.rentalInfoHeading': 'Rental information card heading (2-4 words)',
      'rentalsPage.pricingNote': 'Pricing and delivery note (1-2 sentences)',
      'rentalsPage.requirement1': 'Rental requirement 1 (short phrase)',
      'rentalsPage.requirement2': 'Rental requirement 2 (short phrase)',
      'rentalsPage.requirement3': 'Rental requirement 3 (short phrase)',
      'rentalsPage.requirement4': 'Rental requirement 4 (short phrase)',
      'rentalsPage.policy1': 'Rental policy 1 (short phrase)',
      'rentalsPage.policy2': 'Rental policy 2 (short phrase)',
      'rentalsPage.policy3': 'Rental policy 3 (short phrase)',
      'rentalsPage.policy4': 'Rental policy 4 (short phrase)',
    },
  },

  // ── CORPORATE EDGE ───────────────────────────────────────────────────────
  'corporate-edge': {
    tone: `Write in a polished, B2B professional tone. Corporate Edge serves commercial contractors, fleet buyers, and municipalities. Copy should be authoritative and results-oriented. Emphasize authorized dealer status, certified technicians, and professional service. Use title case for headings. Sound like a trusted industry partner, not a retail shop.`,
    alwaysFields: {
      'hero.heading': 'Homepage hero heading (7-10 words, professional, emphasizes trust and expertise)',
      'hero.subheading': 'Hero subheading (1-2 sentences, target commercial/professional customers)',
      'hero.button1.text': 'Primary CTA button text (2-4 words)',
      'hero.button2.text': 'Secondary CTA button text (2-4 words)',
      // Stats numbers are saved directly from dealer input, not AI-generated
      'stats.stat1Label': 'Stat 1 label (2-4 words, e.g. Years in Business)',
      'stats.stat2Label': 'Stat 2 label (2-4 words, e.g. Machines Serviced)',
      'stats.stat3Label': 'Stat 3 label (2-4 words, e.g. Brand Partners)',
      'stats.stat4Label': 'Stat 4 label (2-4 words, e.g. Customer Satisfaction)',
      'featured.heading': 'Featured equipment section heading (2-4 words)',
      'featured.subheading': 'Featured equipment subheading (1 short sentence for professionals)',
      'trustBadges.badge1Title': 'Trust badge 1 title (2-3 words)',
      'trustBadges.badge1Text': 'Trust badge 1 description (short phrase)',
      'trustBadges.badge2Title': 'Trust badge 2 title (2-3 words)',
      'trustBadges.badge2Text': 'Trust badge 2 description (short phrase)',
      'trustBadges.badge3Title': 'Trust badge 3 title (2-3 words)',
      'trustBadges.badge3Text': 'Trust badge 3 description (short phrase)',
      'trustBadges.badge4Title': 'Trust badge 4 title (2-3 words)',
      'trustBadges.badge4Text': 'Trust badge 4 description (short phrase)',
      'manufacturers.heading': 'Brands section heading (3-5 words)',
      'manufacturers.subheading': 'Brands section subheading (1 short sentence)',
      'testimonials.heading': 'Testimonials section heading (3-5 words)',
      'testimonials.subheading': 'Testimonials subheading (1 short sentence)',
      'cta.heading': 'Bottom CTA heading (5-8 words)',
      'cta.subheading': 'Bottom CTA subheading (1-2 sentences)',
      'footer.tagline': 'Footer tagline (5-8 words, professional)',
      'contactPage.heading': 'Contact page heading (2-4 words)',
      'contactPage.subheading': 'Contact page description (1-2 sentences)',
      'contactPage.formHeading': 'Contact form heading (3-5 words)',
      'contactPage.locationHeading': 'Location heading (3-5 words)',
      'contactPage.emergencyHeading': 'Emergency card heading (3-5 words)',
      'contactPage.emergencyText': 'Emergency card description (1 sentence)',
      'manufacturersPage.heading': 'Manufacturers page heading (3-5 words)',
      'manufacturersPage.subheading': 'Manufacturers page description (1-2 sentences)',
      'manufacturersPage.introText': 'Manufacturers intro paragraph (2-3 sentences)',
      'manufacturersPage.whyHeading': 'Why authorized dealer heading (4-6 words)',
      'manufacturersPage.whySubheading': 'Why authorized dealer subheading (1-2 sentences)',
      'manufacturersPage.benefit1Title': 'Benefit 1 title (2-3 words)',
      'manufacturersPage.benefit1Text': 'Benefit 1 description (short phrase)',
      'manufacturersPage.benefit2Title': 'Benefit 2 title (2-3 words)',
      'manufacturersPage.benefit2Text': 'Benefit 2 description (short phrase)',
      'manufacturersPage.benefit3Title': 'Benefit 3 title (2-3 words)',
      'manufacturersPage.benefit3Text': 'Benefit 3 description (short phrase)',
      'manufacturersPage.benefit4Title': 'Benefit 4 title (2-3 words)',
      'manufacturersPage.benefit4Text': 'Benefit 4 description (short phrase)',
      'manufacturersPage.ctaHeading': 'Manufacturers CTA heading (4-6 words)',
      'manufacturersPage.ctaText': 'Manufacturers CTA text (1 sentence)',
      'manufacturersPage.ctaPrimaryText': 'Manufacturers CTA primary button (2-4 words)',
      'manufacturersPage.ctaSecondaryText': 'Manufacturers CTA secondary button (2-4 words)',
    },
    inventoryFields: {
      'inventoryPage.heading': 'Inventory page heading (2-4 words, professional)',
      'inventoryPage.subheading': 'Inventory page description (1 sentence, for commercial buyers)',
      'inventoryPage.filterLabel': 'Filter label (2-4 words)',
    },
    serviceFields: {
      'servicePage.heading': 'Service page heading (3-5 words)',
      'servicePage.subheading': 'Service page description (1-2 sentences)',
      'servicePage.gridHeading': 'Services section heading (3-5 words)',
      'servicePage.gridSubheading': 'Services section subheading (1-2 sentences)',
      'servicePage.service1Title': 'Service 1 title (2-4 words)',
      'servicePage.service1Text': 'Service 1 description (1-2 sentences)',
      'servicePage.service2Title': 'Service 2 title (2-4 words)',
      'servicePage.service2Text': 'Service 2 description (1-2 sentences)',
      'servicePage.service3Title': 'Service 3 title (2-4 words)',
      'servicePage.service3Text': 'Service 3 description (1-2 sentences)',
      'servicePage.service4Title': 'Service 4 title (2-4 words)',
      'servicePage.service4Text': 'Service 4 description (1-2 sentences)',
      'servicePage.formHeading': 'Service form heading (3-5 words)',
      'servicePage.formSubheading': 'Service form subheading (1 sentence)',
      'servicePage.ctaHeading': 'Service CTA heading (4-6 words)',
    },
    rentalsFields: {
      'rentalsPage.heading': 'Rentals page heading (2-4 words, professional)',
      'rentalsPage.subheading': 'Rentals page description (1-2 sentences)',
      'rentalsPage.pricingNote': 'Pricing note about volume discounts or contractor rates (1-2 sentences)',
      'rentalsPage.termsHeading': 'Rental terms section heading (3-5 words, e.g. Rental Terms & Conditions)',
      'rentalsPage.includedHeading': 'What is included card heading (2-4 words, e.g. What is Included)',
      'rentalsPage.included1': 'First included item (short phrase, e.g. Equipment orientation and training)',
      'rentalsPage.included2': 'Second included item (short phrase)',
      'rentalsPage.included3': 'Third included item (short phrase)',
      'rentalsPage.requirementsHeading': 'Requirements card heading (1-2 words, e.g. Requirements)',
      'rentalsPage.requirement1': 'First rental requirement (short phrase, e.g. Valid government-issued ID)',
      'rentalsPage.requirement2': 'Second rental requirement (short phrase)',
      'rentalsPage.requirement3': 'Third rental requirement (short phrase)',
    },
  },

  // ── MODERN LAWN SOLUTIONS ────────────────────────────────────────────────
  'modern-lawn-solutions': {
    tone: `Write in a clean, modern, approachable tone. Modern Lawn Solutions serves both professionals and homeowners. Copy should be friendly but knowledgeable. Avoid jargon. Emphasize quality, selection, and expertise. Sentence case for headings. Think of a well-run local dealership that takes pride in knowing their customers.`,
    alwaysFields: {
      'hero.heading': 'Homepage hero heading (4-7 words, modern and clear)',
      'hero.subheading': 'Hero subheading (1-2 sentences, broad appeal to both pros and homeowners)',
      'featured.heading': 'Featured equipment section heading (2-4 words)',
      'featured.subheading': 'Featured section subheading (1 short sentence)',
      'manufacturers.heading': 'Brands section heading (3-5 words)',
      'manufacturers.subheading': 'Brands subheading (1 short sentence)',
      'testimonials.heading': 'Testimonials section heading (3-5 words)',
      'testimonials.testimonial1Quote': 'A realistic positive customer testimonial (1-2 sentences) about equipment selection or service quality',
      'testimonials.testimonial1Author': 'A realistic first name and last initial (e.g. Mike R.)',
      'testimonials.testimonial1Role': 'Customer role (e.g. Landscaping Professional)',
      'testimonials.testimonial2Quote': 'A second realistic testimonial about service or repair turnaround',
      'testimonials.testimonial2Author': 'A realistic first name and last initial',
      'testimonials.testimonial2Role': 'Customer role (e.g. Homeowner)',
      'testimonials.testimonial3Quote': 'A third realistic testimonial about pricing, advice, or trust',
      'testimonials.testimonial3Author': 'A realistic first name and last initial',
      'testimonials.testimonial3Role': 'Customer role (e.g. Property Manager)',
      'cta.heading': 'CTA section heading (5-8 words)',
      'cta.subheading': 'CTA subheading (1-2 sentences encouraging a visit or call)',
      'footer.tagline': 'Footer tagline (5-8 words)',
      'contactPage.heading': 'Contact page heading (2-4 words)',
      'contactPage.subheading': 'Contact page subheading (1-2 sentences, welcoming)',
      'contactPage.formHeading': 'Contact form heading (3-5 words)',
      'manufacturersPage.heading': 'Manufacturers page heading (3-5 words)',
      'manufacturersPage.subheading': 'Manufacturers page subheading (1-2 sentences)',
      'manufacturersPage.introductionText': 'Manufacturers page intro paragraph (2-3 sentences about being an authorized dealer)',
      'manufacturersPage.ctaHeading': 'Manufacturers CTA heading (4-6 words)',
      'manufacturersPage.ctaText': 'Manufacturers CTA supporting text (1 sentence)',
    },
    inventoryFields: {
      'inventoryPage.heading': 'Inventory page heading (2-4 words)',
      'inventoryPage.subheading': 'Inventory page description (1 sentence)',
      'inventoryPage.filterLabel': 'Filter label (2-4 words, e.g. Categories)',
    },
    serviceFields: {
      'servicePage.heading': 'Service page heading (3-5 words)',
      'servicePage.subheading': 'Service page subheading (1-2 sentences)',
      'servicePage.service1Title': 'Service card 1 title based on their services (2-4 words)',
      'servicePage.service1Text': 'Service card 1 description (1-2 sentences)',
      'servicePage.service2Title': 'Service card 2 title (2-4 words)',
      'servicePage.service2Text': 'Service card 2 description (1-2 sentences)',
      'servicePage.service3Title': 'Service card 3 title (2-4 words)',
      'servicePage.service3Text': 'Service card 3 description (1-2 sentences)',
    },
    rentalsFields: {
      'rentalsPage.heading': 'Rentals page heading (2-4 words)',
      'rentalsPage.subheading': 'Rentals page description (1-2 sentences)',
      'rentalsPage.pricingNote': 'Pricing note about rental rates and terms (1-2 sentences)',
    },
  },

  // ── VIBE DYNAMICS ────────────────────────────────────────────────────────
  'vibe-dynamics': {
    tone: `Write with HIGH ENERGY and enthusiasm. Vibe Dynamics is bold, punchy, and direct. Use ALL CAPS for major headings. Keep sentences short and punchy. Use exclamation points. This template appeals to contractors and homeowners who want to get things done. Think action-oriented, no-nonsense, exciting. Copy should feel like it belongs on a truck wrap, not a brochure.`,
    alwaysFields: {
      'hero.title': 'Hero headline (3-6 words, ALL CAPS, punchy action phrase)',
      'hero.subtitle': 'Hero subtitle (3-8 words, ALL CAPS, benefit statement)',
      'hero.description': 'Hero description (1-2 sentences, energetic, first person plural)',
      'hero.ctaPrimary': 'Primary button text (2-4 words, action verb)',
      'hero.ctaSecondary': 'Secondary button text (2-4 words)',
      'stats.stat1Value': 'Years in business stat value (just number like "20+")',
      'stats.stat1Label': 'Stat 1 label (2-3 words)',
      'stats.stat2Value': 'Customers served stat value (like "2000+")',
      'stats.stat2Label': 'Stat 2 label (2-3 words)',
      'stats.stat3Value': 'Products in stock estimate (like "300+")',
      'stats.stat3Label': 'Stat 3 label (2-3 words)',
      'stats.stat4Value': 'Support availability (like "6 Days")',
      'stats.stat4Label': 'Stat 4 label (2-3 words)',
      'services.heading': 'Services section heading (ALL CAPS, 2-4 words)',
      'services.service1Title': 'Service 1 title (2-4 words)',
      'services.service1Description': 'Service 1 description (1 punchy sentence)',
      'services.service2Title': 'Service 2 title (2-4 words)',
      'services.service2Description': 'Service 2 description (1 punchy sentence)',
      'services.service3Title': 'Service 3 title (2-4 words)',
      'services.service3Description': 'Service 3 description (1 punchy sentence)',
      'services.service4Title': 'Service 4 title (2-4 words)',
      'services.service4Description': 'Service 4 description (1 punchy sentence)',
      'featured.heading': 'Featured section heading (ALL CAPS, 2-4 words)',
      'featured.subheading': 'Featured subheading (1 energetic sentence)',
      'manufacturers.heading': 'Brands heading (ALL CAPS, 2-4 words)',
      'manufacturers.subheading': 'Brands subheading (1 short sentence)',
      'testimonials.heading': 'Testimonials heading (ALL CAPS)',
      'testimonials.subheading': 'Testimonials subheading (1 short punchy sentence)',
      'cta.heading': 'CTA heading (ALL CAPS, 4-6 words with exclamation)',
      'cta.subheading': 'CTA subheading (1-2 sentences, action-oriented)',
      'cta.primaryText': 'CTA primary button (ALL CAPS, 2-4 words)',
      'cta.secondaryText': 'CTA secondary button (2-4 words)',
      'footer.description': 'Footer description (1 sentence, energetic)',
      'businessInfo.tagline': 'Business tagline (5-8 words, energetic)',
      'businessInfo.aboutShort': 'Short about text (1-2 sentences, first person plural, energetic)',
      'contactPage.heading': 'Contact page heading (ALL CAPS, 2-4 words)',
      'contactPage.subheading': 'Contact page subheading (1-2 sentences)',
      'contactPage.formHeading': 'Form heading (2-4 words)',
      'contactPage.locationHeading': 'Location heading (2-4 words)',
      'manufacturersPage.heading': 'Manufacturers page heading (ALL CAPS)',
      'manufacturersPage.subheading': 'Manufacturers page subheading (1-2 sentences)',
      'manufacturersPage.introText': 'Manufacturers intro (1-2 sentences, energetic)',
      'manufacturersPage.ctaHeading': 'Manufacturers CTA heading (ALL CAPS)',
      'manufacturersPage.ctaText': 'Manufacturers CTA text (1 sentence)',
    },
    inventoryFields: {
      'inventoryPage.heading': 'Inventory page heading (ALL CAPS, 3-5 words with energy)',
      'inventoryPage.subheading': 'Inventory page subheading (1 punchy sentence)',
      'inventoryPage.filterLabel': 'Filter label (2-4 words)',
    },
    serviceFields: {
      'servicePage.heading': 'Service page heading (ALL CAPS)',
      'servicePage.subheading': 'Service page subheading (1-2 sentences)',
      'servicePage.service1Title': 'Service 1 title (2-4 words)',
      'servicePage.service1Text': 'Service 1 description (1 punchy sentence)',
      'servicePage.service2Title': 'Service 2 title (2-4 words)',
      'servicePage.service2Text': 'Service 2 description (1 punchy sentence)',
      'servicePage.service3Title': 'Service 3 title (2-4 words)',
      'servicePage.service3Text': 'Service 3 description (1 punchy sentence)',
      'servicePage.service4Title': 'Service 4 title (2-4 words)',
      'servicePage.service4Text': 'Service 4 description (1 punchy sentence)',
      'servicePage.ctaHeading': 'Service CTA heading (ALL CAPS)',
      'servicePage.formHeading': 'Service form heading (2-4 words)',
      'servicePage.formSubheading': 'Service form subheading (1 sentence)',
      'servicePage.repairsHeading': 'Repairs section heading (ALL CAPS)',
      'servicePage.serviceAreaHeading': 'Service area heading (ALL CAPS)',
    },
    rentalsFields: {
      'rentalsPage.heading': 'Rentals page heading (ALL CAPS, energetic)',
      'rentalsPage.subheading': 'Rentals page subheading (1-2 sentences, fun/energetic)',
      'rentalsPage.step1Title': 'Step 1 title (2-4 words)',
      'rentalsPage.step1Text': 'Step 1 description (1 sentence)',
      'rentalsPage.step2Title': 'Step 2 title (2-4 words)',
      'rentalsPage.step2Text': 'Step 2 description (1 sentence)',
      'rentalsPage.step3Title': 'Step 3 title (2-4 words)',
      'rentalsPage.step3Text': 'Step 3 description (1 sentence)',
      'rentalsPage.ctaHeading': 'Rentals CTA heading (ALL CAPS)',
      'rentalsPage.pricingNote': 'Pricing note (1 punchy sentence)',
    },
  },

  // ── WARM EARTH DESIGNS ───────────────────────────────────────────────────
  'warm-earth-designs': {
    tone: `Write with warmth, authenticity, and a connection to the land. Warm Earth is for family-owned dealerships that serve farmers, homesteaders, and rural communities. Copy should feel personal and community-rooted. Use "folks", "neighbors", "the land" naturally. Avoid corporate language. This is a trusted local business, not a franchise. Sentence case for headings.`,
    alwaysFields: {
      'hero.heading': 'Hero heading (5-9 words, warm and grounded, connected to land/community)',
      'hero.subheading': 'Hero subheading (1-2 sentences, personal and community-focused)',
      'hero.ctaPrimary': 'Primary button text (2-4 words)',
      'hero.ctaSecondary': 'Secondary button text (2-4 words)',
      'hero.statValue': 'A meaningful stat number like years in business or items in stock',
      'hero.statLabel': 'Stat label (2-4 words)',
      'valueProps.valueProp1.text': 'Value prop 1 title (2-4 words, e.g. Quality Equipment)',
      'valueProps.valueProp1.description': 'Value prop 1 description (1 sentence)',
      'valueProps.valueProp2.text': 'Value prop 2 title (2-4 words, e.g. Expert Service)',
      'valueProps.valueProp2.description': 'Value prop 2 description (1 sentence)',
      'valueProps.valueProp3.text': 'Value prop 3 title (2-4 words, e.g. Local Trust)',
      'valueProps.valueProp3.description': 'Value prop 3 description (1 sentence)',
      'featured.heading': 'Featured section heading (2-4 words, warm)',
      'featured.subheading': 'Featured subheading (1 sentence)',
      'manufacturers.heading': 'Brands section heading (3-5 words)',
      'manufacturers.subheading': 'Brands subheading (1 sentence, about sharing values)',
      'testimonials.heading': 'Testimonials heading (3-5 words, community feel)',
      'cta.heading': 'CTA heading (5-8 words, inviting)',
      'cta.subheading': 'CTA subheading (1-2 sentences, warm invitation)',
      'footer.tagline': 'Footer tagline (5-8 words, warm and grounded)',
      'businessInfo.tagline': 'Business tagline (5-8 words, community/land focused)',
      'contactPage.heading': 'Contact page heading (2-4 words, friendly)',
      'contactPage.subheading': 'Contact page subheading (1-2 sentences, welcoming)',
      'contactPage.introHeading': 'Contact intro heading (3-6 words)',
      'contactPage.introText': 'Contact intro text (2-3 sentences, warm and inviting)',
      'contactPage.formHeading': 'Contact form heading (3-5 words)',
      'contactPage.locationHeading': 'Location heading (3-5 words)',
      'manufacturersPage.heading': 'Manufacturers page heading (3-5 words)',
      'manufacturersPage.subheading': 'Manufacturers page subheading (1-2 sentences)',
      'manufacturersPage.introText': 'Manufacturers intro (2-3 sentences)',
      'manufacturersPage.whyHeading': 'Why section heading (3-6 words)',
      'manufacturersPage.whyText1': 'Why paragraph 1 (2-3 sentences about brand selection philosophy)',
      'manufacturersPage.whyText2': 'Why paragraph 2 (2-3 sentences about authorized dealer benefits)',
      'manufacturersPage.ctaHeading': 'Manufacturers CTA heading (4-6 words)',
      'manufacturersPage.ctaText': 'Manufacturers CTA text (1-2 sentences)',
      'manufacturersPage.ctaPrimaryText': 'CTA primary button (2-4 words)',
      'manufacturersPage.ctaSecondaryText': 'CTA secondary button (2-4 words)',
    },
    inventoryFields: {
      'inventoryPage.heading': 'Inventory page heading (2-4 words, warm)',
      'inventoryPage.subheading': 'Inventory page description (1 sentence)',
      'inventoryPage.filterLabel': 'Filter label (2-4 words)',
    },
    serviceFields: {
      'servicePage.heading': 'Service page heading (3-5 words)',
      'servicePage.subheading': 'Service page subheading (1-2 sentences)',
      'servicePage.gridHeading': 'Services grid heading (3-5 words)',
      'servicePage.service1.text': 'Service 1 title (2-4 words)',
      'servicePage.service1Description': 'Service 1 description (1-2 sentences)',
      'servicePage.service2.text': 'Service 2 title (2-4 words)',
      'servicePage.service2Description': 'Service 2 description (1-2 sentences)',
      'servicePage.service3.text': 'Service 3 title (2-4 words)',
      'servicePage.service3Description': 'Service 3 description (1-2 sentences)',
      'servicePage.ctaHeading': 'Service CTA heading (3-6 words)',
      'servicePage.formHeading': 'Service form heading (3-5 words)',
      'servicePage.formSubheading': 'Service form subheading (1 sentence)',
    },
    rentalsFields: {
      'rentalsPage.heading': 'Rentals page heading (2-4 words, warm)',
      'rentalsPage.subheading': 'Rentals page description (1-2 sentences, emphasize try before you buy)',
      'rentalsPage.pricingNote': 'Pricing note (1-2 sentences)',
      'rentalsPage.ctaHeading': 'Rentals CTA heading (4-6 words)',
      'rentalsPage.ctaText': 'Rentals CTA text (1 sentence)',
      'rentalsPage.ctaButtonText': 'Rentals CTA button text (2-4 words)',
    },
  },

  // ── ZENITH LAWN ──────────────────────────────────────────────────────────
  'zenith-lawn': {
    tone: `Write in a minimalist, premium, editorial tone. Zenith Lawn is for high-end equipment dealers targeting sophisticated buyers — golf course managers, estate owners, premium landscapers. Copy should be refined and confident. Short sentences. No filler words. Think luxury brand language applied to outdoor equipment. Sentence case. Understated elegance over excitement.`,
    alwaysFields: {
      'hero.heading': 'Hero heading (4-8 words, refined, can be a statement or question)',
      'hero.subheading': 'Hero subheading (1-2 sentences, elevated and precise)',
      'hero.ctaPrimary': 'Primary button text (2-4 words, elegant)',
      'featured.heading': 'Featured section heading (1-3 words, minimal)',
      'manufacturers.heading': 'Brands section label (1-4 words)',
      'cta.heading': 'CTA heading (4-7 words, sophisticated)',
      'footer.tagline': 'Footer tagline (4-7 words, refined)',
      'contactPage.heading': 'Contact page heading (1-3 words, minimal)',
      'contactPage.subheading': 'Contact page subheading (1 sentence)',
      'contactPage.formHeading': 'Form heading (2-4 words)',
      'contactPage.locationHeading': 'Location heading (2-4 words)',
      'manufacturersPage.heading': 'Manufacturers page heading (2-4 words)',
      'manufacturersPage.subheading': 'Manufacturers page subheading (1-2 sentences)',
      'manufacturersPage.introText': 'Manufacturers intro (2-3 sentences, sophisticated)',
    },
    inventoryFields: {
      'inventoryPage.heading': 'Inventory page heading (1-3 words, minimal)',
      'inventoryPage.subheading': 'Inventory page description (1 precise sentence)',
      'inventoryPage.filterLabel': 'Filter label (2-3 words)',
    },
    serviceFields: {
      'servicePage.heading': 'Service page heading (2-4 words)',
      'servicePage.subheading': 'Service page subheading (1-2 sentences, premium tone)',
      'servicePage.service1Title': 'Service 1 title (1-3 words)',
      'servicePage.service1Description': 'Service 1 description (1 sentence)',
      'servicePage.service2Title': 'Service 2 title (1-3 words)',
      'servicePage.service2Description': 'Service 2 description (1 sentence)',
      'servicePage.service3Title': 'Service 3 title (1-3 words)',
      'servicePage.service3Description': 'Service 3 description (1 sentence)',
      'servicePage.ctaHeading': 'Service CTA heading (3-5 words)',
    },
    rentalsFields: {
      'rentalsPage.heading': 'Rentals page heading (1-3 words, minimal)',
      'rentalsPage.subheading': 'Rentals page description (1-2 sentences, refined)',
      'rentalsPage.pricingNote': 'Pricing note (1 sentence)',
    },
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// Build AI prompt from template config
// ─────────────────────────────────────────────────────────────────────────────
export function buildOnboardingPrompt(
  templateSlug: string,
  form: {
    businessName: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    weekdayHours: string;
    saturdayHours: string;
    sundayHours: string;
    yearsInBusiness: string;
    serviceArea: string;
    servicesDescription: string;
    selectedBrands: string[];
    businessDescription: string;
    machinesServiced?: string;
    customerSatisfaction?: string;
  },
  addons: string[]
): string {
  const config = TEMPLATE_PROMPTS[templateSlug] || TEMPLATE_PROMPTS['green-valley-industrial'];

  // Build field JSON schema
  const buildFieldSchema = (fields: Record<string, string>) =>
    Object.entries(fields).map(([key, desc]) => `  "${key}": "${desc}"`).join(',\n');

  const addonFields = [
    ...(addons.includes('inventory') ? Object.entries(config.inventoryFields) : []),
    ...(addons.includes('service') ? Object.entries(config.serviceFields) : []),
    ...(addons.includes('rentals') ? Object.entries(config.rentalsFields) : []),
  ];

  const allFields = {
    ...config.alwaysFields,
    ...(addons.includes('inventory') ? config.inventoryFields : {}),
    ...(addons.includes('service') ? config.serviceFields : {}),
    ...(addons.includes('rentals') ? config.rentalsFields : {}),
  };

  const fieldSchema = buildFieldSchema(allFields);

  return `You are writing website copy for an outdoor power equipment and landscape contractor dealer.

TONE INSTRUCTIONS:
${config.tone}

BUSINESS INFORMATION:
Business Name: ${form.businessName}
Location: ${form.city}, ${form.state}
Phone: ${form.phone}
Email: ${form.email}
Hours: ${form.weekdayHours}${form.saturdayHours ? ', ' + form.saturdayHours : ''}${form.sundayHours ? ', ' + form.sundayHours : ''}
Years in Business: ${form.yearsInBusiness || 'established'}
Service Area: ${form.serviceArea || 'local area'}
Services Offered: ${form.servicesDescription}
Brands Carried: ${form.selectedBrands.join(', ') || 'various brands'}

In their own words: "${form.businessDescription}"${form.machinesServiced ? `\nMachines Serviced: ${form.machinesServiced}` : ''}${form.customerSatisfaction ? `\nCustomer Satisfaction: ${form.customerSatisfaction}` : ''}

INSTRUCTIONS:
- Use the tone instructions above strictly — this is critical for brand consistency
- Reference their specific details where possible (brands, location, years, services)
- Write copy that fits the character limits described for each field
- Do not use placeholder text — every field should be specific to this business

Return ONLY a valid JSON object with these exact keys. No markdown, no backticks, no extra text:

{
${fieldSchema}
}`;
}
