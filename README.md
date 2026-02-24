# SiteForge - Lawn Care Equipment Dealer Platform

A complete SaaS platform for creating and managing websites for lawn care equipment dealerships. Built with Next.js, Supabase, and designed for easy replication across multiple industries.

## 🎯 Overview

SiteForge allows lawn equipment dealers to:
- Choose from professional, industry-specific templates
- Customize content, colors, and branding
- Deploy static websites with dynamic content loading
- Manage premium features (inventory, rentals, service scheduling)

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (platform), Netlify/Cloudflare (customer sites)
- **Content API**: Shared Node.js API (to be built)

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account
- Git

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
cd siteforge-lawn-care
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Create storage buckets:
   - `templates` (private)
   - `user-uploads` (public)
   - `deployed-sites` (public)

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
siteforge-lawn-care/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── content/       # Content delivery endpoints
│   │   ├── sites/         # Site management
│   │   └── templates/     # Template operations
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # User dashboard
│   ├── templates/         # Template gallery
│   ├── deploy/            # Deployment flow
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   └── supabase.ts        # Supabase client
├── utils/                 # Helper utilities
├── public/                # Static assets
├── supabase-schema.sql    # Database schema
├── ARCHITECTURE.md        # System architecture
├── LAWN_CARE_SPEC.md      # Industry specification
└── package.json
```

## 🗄️ Database Schema

See `supabase-schema.sql` for complete schema.

### Core Tables
- `users` - User accounts
- `templates` - Available templates
- `sites` - User-created sites
- `site_content` - Editable content
- `site_customizations` - Colors/fonts/styling
- `manufacturers` - Brand partnerships (FREE feature)

### Premium Feature Tables
- `site_subscriptions` - Feature subscriptions
- `inventory_items` - Product catalog
- `rental_equipment` - Rental fleet
- `rental_bookings` - Rental reservations
- `service_appointments` - Service requests

## 🎨 Features

### Base Platform (All Sites)
- ✅ Professional templates
- ✅ Content customization
- ✅ Manufacturer pages
- ✅ Contact forms
- ✅ Custom domains
- ✅ Mobile responsive

### Premium Add-ons
- 💰 **Inventory Sync** ($29-49/mo) - Product catalog with real-time updates
- 💰 **Rental Scheduling** ($39-59/mo) - Equipment booking system
- 💰 **Service Scheduling** ($39-59/mo) - Appointment management

## 🔄 Industry Replication Process

This platform is designed to be replicated for different industries:

### To Create a New Industry Vertical:

1. **Clone the codebase**
   ```bash
   cp -r siteforge-lawn-care siteforge-new-industry
   ```

2. **Update branding**
   - Logo and colors in `tailwind.config.js`
   - Industry-specific copy in homepage
   - Feature descriptions

3. **Deploy new Supabase instance**
   ```bash
   # Run schema migrations
   # Configure storage buckets
   ```

4. **Create industry-specific templates**
   - Design templates in Lovable
   - Convert using template processor
   - Upload to Supabase storage

5. **Deploy to new domain**
   - Configure `NEXT_PUBLIC_APP_URL`
   - Deploy to Vercel/Railway
   - Point domain

**Time estimate**: 4-8 hours per industry

## 🔧 Next Development Steps

### Phase 1: Core Platform (Current)
- [x] Database schema
- [x] Next.js project setup
- [x] Homepage design
- [ ] Authentication system
- [ ] Template gallery
- [ ] Dynamic customizer
- [ ] User dashboard

### Phase 2: Template System
- [ ] Lovable template converter (enhanced)
- [ ] Template upload interface
- [ ] Template preview system
- [ ] Template configuration parser

### Phase 3: Content API
- [ ] Shared content delivery API
- [ ] Site content endpoints
- [ ] Customization endpoints
- [ ] Public API for customer sites

### Phase 4: Deployment Pipeline
- [ ] Static site generator
- [ ] CDN upload automation
- [ ] Domain configuration
- [ ] SSL certificate management

### Phase 5: Premium Features
- [ ] Inventory management UI
- [ ] Rental calendar system
- [ ] Service booking interface
- [ ] Subscription management (Stripe)

## 📊 Cost Projections

### Per Industry Platform
- Supabase: $25/mo (Pro plan)
- Vercel: Free tier or $20/mo
- **Total**: ~$25-50/mo

### Shared Content API
- Railway/DigitalOcean: $20-50/mo
- Scales to 10,000+ sites

### Per Customer Site
- CDN hosting: $0-5/mo average
- Netlify/Vercel free tier for most sites

### Example Economics (500 sites across 3 industries)
- **Revenue** ($79/mo avg): $39,500/mo
- **Infrastructure**: ~$1,200/mo
- **Gross Margin**: ~97%

## 🔐 Security

- Row Level Security (RLS) on all tables
- User authentication via Supabase Auth
- API rate limiting
- Content sanitization
- CORS restrictions
- Environment variable protection

## 📝 Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System design and tech decisions
- [Lawn Care Specification](./LAWN_CARE_SPEC.md) - Industry-specific features
- [API Documentation](./docs/API.md) - Coming soon
- [Template Guide](./docs/TEMPLATES.md) - Coming soon

## 🤝 Contributing

This is a proprietary project for Good Life Advertising. Internal team members can contribute by:

1. Following the existing code style
2. Writing clear commit messages
3. Testing thoroughly before committing
4. Documenting new features

## 📞 Support

For questions or issues:
- Internal: Contact Grant at Good Life Advertising
- Documentation: Check `/docs` folder
- Database: Review `supabase-schema.sql`

## 🎯 Roadmap

**Q1 2026**
- ✅ Core platform launch (Lawn Care)
- ⏳ Template converter enhancement
- ⏳ Authentication system
- ⏳ Content API development

**Q2 2026**
- Deployment pipeline
- Premium feature development
- Stripe integration
- Industry #2 launch

**Q3 2026**
- Advanced analytics
- Email marketing integration
- Mobile app (optional)
- Industry #3 launch

## 📄 License

Proprietary - Good Life Advertising © 2026

---

**Current Status**: Foundation complete, ready for authentication and template systems

**Last Updated**: January 31, 2026
