# Cazinou.io - Complete Project Documentation

> A Romanian casino review portal built with Next.js 15 and Sanity CMS

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Project Overview](#2-project-overview)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Sanity CMS & Studio](#4-sanity-cms--studio)
5. [Key Files Reference](#5-key-files-reference)
6. [Common Tasks & Workflows](#6-common-tasks--workflows)
7. [Content Editor Guide](#7-content-editor-guide)
8. [Deployment](#8-deployment)
9. [Troubleshooting](#9-troubleshooting)
10. [Appendices](#10-appendices)

---

## 1. Quick Start

### Prerequisites

- **Node.js** 18.17 or later
- **npm** (comes with Node.js)
- Access to the Sanity project (project ID: `78bidtls`)
- Access to external APIs (SlotsLaunch, Upstash Redis)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cazinou-io

# Install dependencies (installs both frontend and studio workspaces)
npm install
```

### Environment Setup

#### Frontend (`/frontend/.env.local`)

Copy `/frontend/.env.example` to `/frontend/.env.local` and fill in:

```env
# Sanity Configuration (Required)
NEXT_PUBLIC_SANITY_PROJECT_ID="78bidtls"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2025-09-25"
SANITY_API_READ_TOKEN="<your-sanity-read-token>"

# Optional - defaults to http://localhost:3333
NEXT_PUBLIC_SANITY_STUDIO_URL=""

# SlotsLaunch API (Required for game data)
SLOTSLAUNCH_TOKEN="<your-slotslaunch-token>"
SLOTSLAUNCH_ORIGIN="cazinou.io"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://cazinou.io"

# Redis Cache (Required)
UPSTASH_REDIS_REST_URL="<your-upstash-url>"
UPSTASH_REDIS_REST_TOKEN="<your-upstash-token>"

# Cron Jobs
CRON_SECRET="<random-secret-for-cron>"
```

#### Studio (`/studio/.env.local`)

Copy `/studio/.env.example` to `/studio/.env.local`:

```env
SANITY_STUDIO_PROJECT_ID="78bidtls"
SANITY_STUDIO_DATASET="production"
SANITY_STUDIO_PREVIEW_URL="http://localhost:3000"
```

### Running Development Servers

```bash
# Start both frontend and studio simultaneously
npm run dev

# Or run them individually:
npm run dev:next    # Frontend only (http://localhost:3000)
npm run dev:studio  # Studio only (http://localhost:3333)
```

### Verification Checklist

After setup, verify everything works:

- [ ] Frontend loads at http://localhost:3000
- [ ] Sanity Studio loads at http://localhost:3333
- [ ] Content appears on the frontend (fetched from Sanity)
- [ ] Images load correctly (Sanity CDN and SlotsLaunch)
- [ ] No console errors related to missing environment variables

---

## 2. Project Overview

### What is Cazinou.io?

Cazinou.io is a Romanian online casino review and gaming portal. It provides:

- Casino reviews and rankings
- Free slot game demos (via SlotsLaunch API)
- Lottery results and information
- Payment method guides
- Blog content and guides

### Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Frontend Framework | Next.js | 15.5.7 |
| React | React | 19.1.1 |
| Styling | Tailwind CSS | 4.1.12 |
| CMS | Sanity.io | 4.10.2 |
| Language | TypeScript | 5.9.2 |
| Caching | Upstash Redis | - |
| Hosting | Vercel | - |
| Analytics | Google Tag Manager | - |

### Monorepo Structure

```
cazinou-io/
├── frontend/          # Next.js 15 application
├── studio/            # Sanity CMS Studio
├── package.json       # Root workspace configuration
├── node_modules/      # Shared dependencies
└── DOCUMENTATION.md   # This file
```

The project uses **npm workspaces** to manage the two packages:

- `frontend` - The public-facing website
- `studio` - The content management admin interface

### External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Sanity.io** | Headless CMS for all content | Project ID: `78bidtls` |
| **SlotsLaunch** | Slot game data and demo iframes | API token required |
| **Upstash Redis** | Caching layer for performance | REST API |
| **Vercel** | Hosting and deployment | Automatic via Git |
| **Google Tag Manager** | Analytics and tracking | GTM container |

---

## 3. Frontend Architecture

### Directory Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── [slug]/            # Dynamic pages
│   ├── api/               # API routes
│   ├── author/            # Author profile pages
│   ├── casino/            # Casino review pages
│   ├── cazinouri-online/  # Casino listings
│   ├── components/        # React components (47 total)
│   ├── loto-online-keno/  # Lottery pages
│   ├── metode-de-plata/   # Payment method pages
│   ├── pacanele/          # Slot game pages (real money)
│   ├── pacanele-gratis/   # Free slot pages
│   ├── posts/             # Blog posts
│   ├── recenzii/          # Reviews listing
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── robots.ts          # Robots.txt generation
│   └── sitemap.ts         # XML sitemap generation
├── lib/                   # Utility libraries
├── public/                # Static assets
├── sanity/                # Sanity client configuration
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

### Routing (App Router)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Homepage with hero, toplists, content |
| `/[slug]` | `app/[slug]/page.tsx` | Dynamic pages from Sanity |
| `/casino/[slug]` | `app/casino/[slug]/page.tsx` | Individual casino reviews |
| `/casino` | `app/casino/page.tsx` | Casino listing page |
| `/recenzii` | `app/recenzii/page.tsx` | All reviews listing |
| `/pacanele/[slug]` | `app/pacanele/[slug]/page.tsx` | Slot game pages |
| `/pacanele-gratis` | `app/pacanele-gratis/page.tsx` | Free slots listing |
| `/pacanele-gratis/[slug]` | `app/pacanele-gratis/[slug]/page.tsx` | Free slot demo pages |
| `/loto-online-keno` | `app/loto-online-keno/page.tsx` | Lottery listing |
| `/loto-online-keno/[slug]` | `app/loto-online-keno/[slug]/page.tsx` | Individual lottery pages |
| `/metode-de-plata` | `app/metode-de-plata/page.tsx` | Payment methods listing |
| `/metode-de-plata/[slug]` | `app/metode-de-plata/[slug]/page.tsx` | Payment method pages |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | Blog posts |
| `/author/[slug]` | `app/author/[slug]/page.tsx` | Author profile pages |
| `/autori` | `app/autori/page.tsx` | Authors listing |

### Components Overview

Components are located in `/frontend/app/components/`. Here are the key ones:

**Layout Components:**
- `Header.tsx` - Site header with navigation
- `Footer.tsx` - Site footer
- `DesktopNavigation.tsx` - Desktop menu
- `MobileMenu.tsx` - Mobile hamburger menu

**Content Components:**
- `PageBuilder.tsx` - Dynamic page builder from Sanity blocks
- `ContentSections.tsx` - Renders mixed content sections
- `PortableText.tsx` - Sanity rich text renderer
- `Toplist.tsx` - Casino ranking lists (highly configurable)

**Casino/Review Components:**
- `FeaturedCasino.tsx` - Featured casino display
- `ReviewCard.tsx` - Casino review card
- `ReviewMethodology.tsx` - Review criteria display

**Game Components:**
- `GameCard.tsx` - Individual game card
- `GameGrid.tsx` - Grid of games
- `GameIframe.tsx` - Game demo player
- `SlotsFilteredGrid.tsx` - Filtered slots grid
- `FeaturedGamesGrid.tsx` - Featured games display

**Utility Components:**
- `FAQSection.tsx` - FAQ accordion
- `BeginnersGuide.tsx` - Beginner guide sections
- `BonusCalculator.tsx` - Interactive bonus calculator
- `JsonLd.tsx` - Structured data (SEO)

### Styling with Tailwind CSS

The project uses Tailwind CSS 4 with custom configuration:

**Configuration:** `/frontend/tailwind.config.ts`

- Custom color palette (cyan, gray, red, orange, yellow, green)
- Custom fonts: Inter (sans), Inter Tight (mono)
- Typography plugin for rich text
- Custom container utility

**Global Styles:** `/frontend/app/globals.css`

```css
@import 'tailwindcss';

/* Custom utilities defined here */
.container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}
```

### Data Fetching

Data is fetched from Sanity using the `next-sanity` library:

**Client Configuration:** `/frontend/sanity/lib/client.ts`

```typescript
import { sanityFetch } from '@/sanity/lib/live'

// Example: Fetching a page
const { data } = await sanityFetch({
  query: pageQuery,
  params: { slug },
})
```

**Queries Location:** `/frontend/sanity/lib/queries.ts`

All GROQ queries are centralized here. Example:

```groq
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    content[],
    seo
  }
`
```

### Caching Strategy

- **ISR:** Pages use Incremental Static Regeneration with 1-hour revalidation
- **React Cache:** `cache()` for request deduplication
- **Redis:** External API calls cached via Upstash
- **HTTP Headers:** CDN caching configured in `next.config.ts`

```typescript
// Cache headers in next.config.ts
{
  key: 'Cache-Control',
  value: 'public, s-maxage=3600, stale-while-revalidate=86400',
}
```

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/draft-mode/enable` | Enables Sanity preview mode |
| `/api/slots` | Slots filtering and pagination API |
| `/api/lotto/[game]` | Lottery game data |
| `/api/lotto/refresh` | Refresh lottery data |

---

## 4. Sanity CMS & Studio

### Accessing the Studio

- **Local:** http://localhost:3333 (run `npm run dev:studio`)
- **Production:** Deployed via `sanity deploy` command

### Content Models

#### Document Types (Multiple instances)

| Type | Description | Key Fields |
|------|-------------|------------|
| `casino` | Casino entities | name, slug, rating, welcomeBonus, affiliateLink |
| `casinoReview` | Detailed reviews | casino (ref), author, content, faq |
| `game` | Slot games | name, slug, provider, rtp, volatility |
| `provider` | Game providers | name, slug, logo |
| `person` | Authors/staff | name, slug, bio, expertise |
| `post` | Blog posts | title, slug, author, content |
| `page` | Generic pages | name, slug, content (page builder) |
| `infoPage` | Info pages | Similar to page with different structure |
| `themedSlotsPage` | Theme-specific slot pages | theme, games filter |
| `reviewsPage` | Reviews listing page | Configuration for reviews |
| `loto` | Lottery pages | game info, results |

#### Singleton Types (Single instance)

| Type | Description |
|------|-------------|
| `settings` | Global site settings |
| `homePage` | Homepage configuration |
| `slotsPageSettings` | Slots page settings |
| `lotoPageSettings` | Lottery page settings |

#### Object Types (Reusable components)

| Type | Description |
|------|-------------|
| `blockContent` | Rich text editor content |
| `topListObject` | Casino ranking list |
| `featuredCasino` | Featured casino section |
| `featuredGame` | Featured game section |
| `faqSection` | FAQ block |
| `bonusCalculator` | Bonus calculator widget |
| `reviewMethodology` | Review methodology display |
| `beginnersGuide` | Beginner guide sections |
| `authorComment` | Author commentary box |
| `callToAction` | CTA buttons |
| `simpleButton` | Button component |
| `youtubeEmbed` | YouTube video embed |

### Schema Files Location

```
studio/src/schemaTypes/
├── index.ts              # Exports all schemas
├── documents/            # Document type schemas
│   ├── casino.ts
│   ├── casinoReview.ts
│   ├── game.ts
│   ├── provider.ts
│   ├── person.ts
│   ├── post.ts
│   ├── page.ts
│   ├── infoPage.ts
│   ├── themedSlotsPage.ts
│   ├── reviewsPage.ts
│   ├── loto.ts
│   └── slotsPageSettings.ts
├── singletons/           # Singleton schemas
│   ├── settings.tsx
│   ├── homePage.ts
│   └── lotoPageSettings.ts
└── objects/              # Object type schemas
    ├── blockContent.tsx
    ├── topListObject.ts
    ├── featuredCasino.ts
    ├── faqSection.ts
    └── ... (more)
```

### Page Builder System

Many pages use a modular "page builder" approach. Content editors can add sections in any order:

1. **Rich Text** (blockContent)
2. **Top Lists** (topListObject)
3. **Featured Casino** (featuredCasino)
4. **Featured Games** (featuredGamesGrid)
5. **FAQ Section** (faqSection)
6. **Beginner's Guide** (beginnersGuide)
7. **Call to Action** (callToAction)
8. **And more...**

The `PageBuilder.tsx` component renders these dynamically based on the `_type` of each block.

### Visual Editing

Sanity's Presentation Tool enables real-time visual editing:

1. Open Studio at http://localhost:3333
2. Click "Presentation" in the sidebar
3. The frontend preview loads with edit overlays
4. Click any editable element to modify it
5. Changes appear instantly in the preview

---

## 5. Key Files Reference

### Root Level

| File | Purpose |
|------|---------|
| `package.json` | Workspace configuration, root scripts |
| `TOPLIST-MIGRATION.md` | Migration documentation example |

### Frontend Configuration

| File | Purpose |
|------|---------|
| `frontend/next.config.ts` | Next.js config: images, redirects, headers |
| `frontend/tailwind.config.ts` | Tailwind CSS customization |
| `frontend/tsconfig.json` | TypeScript configuration |
| `frontend/postcss.config.mjs` | PostCSS plugins |
| `frontend/.env.example` | Environment variable template |

### Frontend Source

| File | Purpose |
|------|---------|
| `frontend/app/layout.tsx` | Root layout with fonts, analytics |
| `frontend/app/globals.css` | Global CSS and Tailwind imports |
| `frontend/lib/navigation.ts` | Site navigation structure |
| `frontend/lib/utils.ts` | Utility functions (cn, etc.) |
| `frontend/lib/iconMapper.ts` | Maps strings to Lucide icons |
| `frontend/lib/slotslaunch.ts` | SlotsLaunch API integration |
| `frontend/sanity/lib/client.ts` | Sanity client configuration |
| `frontend/sanity/lib/queries.ts` | All GROQ queries |

### Studio Configuration

| File | Purpose |
|------|---------|
| `studio/sanity.config.ts` | Main Sanity Studio configuration |
| `studio/sanity.cli.ts` | CLI configuration |
| `studio/src/structure/index.ts` | Custom Studio structure |
| `studio/src/schemaTypes/index.ts` | Schema exports |
| `studio/.env.example` | Studio environment template |

### Environment Variables Reference

#### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Sanity dataset (production) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | API version (defaults to latest) |
| `SANITY_API_READ_TOKEN` | Yes | Sanity read token |
| `SLOTSLAUNCH_TOKEN` | Yes | SlotsLaunch API token |
| `SLOTSLAUNCH_ORIGIN` | Yes | Your domain for SlotsLaunch |
| `NEXT_PUBLIC_SITE_URL` | No | Site URL for metadata |
| `UPSTASH_REDIS_REST_URL` | Yes | Redis cache URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Redis cache token |
| `CRON_SECRET` | No | Secret for cron endpoints |

#### Studio Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SANITY_STUDIO_PROJECT_ID` | Yes | Same as frontend |
| `SANITY_STUDIO_DATASET` | Yes | Same as frontend |
| `SANITY_STUDIO_PREVIEW_URL` | No | Frontend URL for preview |

---

## 6. Common Tasks & Workflows

### Content Tasks

#### Adding a New Casino

1. Open Sanity Studio
2. Click **Casino** in the sidebar
3. Click **+ Create**
4. Fill in required fields:
   - Name, Slug (URL-friendly)
   - Logo, Rating (1-5)
   - Welcome Bonus, Affiliate Link
   - Features, Payment Methods
5. **Publish** when complete

#### Creating a Casino Review

1. In Studio, click **Casino Review**
2. Click **+ Create**
3. Select the **Casino** to review
4. Select the **Author**
5. Write content using the rich text editor
6. Add FAQ items
7. Fill in SEO fields
8. **Publish**

#### Importing Games from SlotsLaunch

Use the CLI tool:

```bash
cd studio
npm run import-game -- --slug="game-slug-from-slotslaunch"
```

This will:
- Fetch game data from SlotsLaunch API
- Create the game document in Sanity
- Create the provider if it doesn't exist

#### Modifying Navigation

Edit `/frontend/lib/navigation.ts`:

```typescript
export const navigationData: NavigationCategory[] = [
  {
    label: 'Section Name',
    href: '/section-url',
    items: [
      { label: 'Item 1', href: '/item-1' },
      { label: 'Item 2', href: '/item-2' },
    ],
  },
  // ... more categories
]
```

### Development Tasks

#### Adding a New Page Route

1. Create folder in `frontend/app/`:
   ```
   frontend/app/new-section/
   ├── page.tsx           # Listing page
   └── [slug]/
       └── page.tsx       # Individual pages
   ```

2. Create the page component:
   ```typescript
   // frontend/app/new-section/page.tsx
   import { sanityFetch } from '@/sanity/lib/live'

   export default async function NewSectionPage() {
     const { data } = await sanityFetch({ query: myQuery })
     return <div>{/* render data */}</div>
   }
   ```

3. Add GROQ query to `/frontend/sanity/lib/queries.ts`

4. If needed, add redirect rules in `next.config.ts`

#### Creating a New Component

1. Create file in `frontend/app/components/`:
   ```typescript
   // frontend/app/components/MyComponent.tsx
   interface MyComponentProps {
     title: string
     // ... props
   }

   export function MyComponent({ title }: MyComponentProps) {
     return (
       <div className="container">
         <h2 className="text-2xl font-bold">{title}</h2>
       </div>
     )
   }
   ```

2. Import and use in pages

#### Adding a New Sanity Schema Type

1. Create schema file in `studio/src/schemaTypes/documents/` or `objects/`:
   ```typescript
   // studio/src/schemaTypes/documents/myType.ts
   import { defineType, defineField } from 'sanity'

   export const myType = defineType({
     name: 'myType',
     title: 'My Type',
     type: 'document',
     fields: [
       defineField({
         name: 'title',
         title: 'Title',
         type: 'string',
       }),
       // ... more fields
     ],
   })
   ```

2. Export from `studio/src/schemaTypes/index.ts`:
   ```typescript
   import { myType } from './documents/myType'

   export const schemaTypes = [
     // ... existing types
     myType,
   ]
   ```

3. Regenerate types:
   ```bash
   cd frontend
   npm run typegen
   ```

#### Adding Redirects

Edit `frontend/next.config.ts`:

```typescript
async redirects() {
  return [
    // ... existing redirects
    {
      source: '/old-url',
      destination: '/new-url',
      permanent: true, // 301 redirect
    },
  ]
}
```

---

## 7. Content Editor Guide

### Accessing Sanity Studio

1. Go to your Studio URL (local: http://localhost:3333)
2. Log in with your Sanity account
3. You'll see the content dashboard

### Studio Navigation

- **Left Sidebar:** Content types
- **Main Area:** Content list or editor
- **Top Bar:** Search, user menu, tools

### Creating Content

1. Click a content type in the sidebar
2. Click **+ Create** or the **+** button
3. Fill in the fields
4. Click **Publish** to make live

### Using the Rich Text Editor

The block content editor supports:

- **Bold, Italic, Underline** - Standard formatting
- **Headers** (H2, H3, H4) - Use for structure
- **Lists** - Bulleted and numbered
- **Links** - Internal and external
- **Images** - Upload or use Unsplash
- **Custom Blocks:**
  - Author Comment
  - YouTube Embed
  - Call to Action
  - And more...

### Using the Page Builder

Pages with page builder fields allow you to add sections:

1. Click **Add item** in the content section
2. Choose block type:
   - **Block Content** - Rich text
   - **Top List** - Casino rankings
   - **Featured Casino** - Highlight a casino
   - **FAQ Section** - Q&A pairs
   - **etc.**
3. Configure the block
4. Drag to reorder sections

### Top List Configuration

The Top List block has many options:

| Option | Description |
|--------|-------------|
| Casinos | Select which casinos to include (drag to reorder) |
| Show Rank Badge | Display #1, #2, etc. |
| Show Rating | Display star rating |
| Show Welcome Bonus | Display bonus text |
| Show Features | Display feature chips |
| Show Payment Methods | Display payment icons |
| Expanded First | First item expanded by default |
| Max Items | Limit displayed items |

### Preview and Publishing

**Draft Mode:**
- Content is auto-saved as drafts
- Use Presentation tool to preview

**Publishing:**
1. Review your content
2. Click **Publish** (green button)
3. Content goes live within ~1 hour (caching)

**Immediate Updates:**
- For urgent updates, content may take up to 1 hour due to caching
- Contact developer if immediate refresh is needed

### Image Management

**Uploading Images:**
1. Click image field
2. Upload from computer or use Unsplash
3. Add alt text for accessibility

**Image Best Practices:**
- Use WebP format when possible
- Keep file sizes reasonable (<500KB)
- Always add descriptive alt text

### SEO Fields

Most content types have SEO fields:

| Field | Description |
|-------|-------------|
| Meta Title | Page title for search results |
| Meta Description | Description for search results |
| OG Image | Image for social sharing |
| No Index | Hide from search engines |

**Tips:**
- Keep meta titles under 60 characters
- Keep descriptions under 160 characters
- Use unique titles/descriptions per page

---

## 8. Deployment

### Vercel Setup

The site is hosted on Vercel with automatic deployments:

1. **Production:** Deploys from `main` branch
2. **Preview:** Deploys from pull requests

### Environment Variables (Vercel)

Configure these in Vercel Dashboard → Settings → Environment Variables:

**Required for Production:**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=78bidtls
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=<token>
SLOTSLAUNCH_TOKEN=<token>
SLOTSLAUNCH_ORIGIN=cazinou.io
NEXT_PUBLIC_SITE_URL=https://cazinou.io
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>
```

### Deployment Checklist

Before deploying major changes:

- [ ] Test locally with `npm run build`
- [ ] Check for TypeScript errors: `npm run type-check`
- [ ] Check for lint errors: `npm run lint`
- [ ] Test on preview deployment first
- [ ] Verify critical pages load correctly
- [ ] Check console for errors
- [ ] Test on mobile devices
- [ ] Verify analytics tracking

### Deploying Sanity Studio

To deploy Studio to Sanity's hosting:

```bash
cd studio
npm run deploy
```

This uploads the Studio to `<your-project>.sanity.studio`

### Cache Invalidation

Content updates may take up to 1 hour due to caching. To force refresh:

1. **Vercel Dashboard:** Redeploy the site
2. **Sanity Webhook:** Configure webhook to trigger on publish (advanced)

### Manual Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 9. Troubleshooting

### Common Development Issues

#### "Cannot find module" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules frontend/node_modules studio/node_modules
npm install
```

#### TypeScript errors after schema changes

```bash
# Regenerate Sanity types
cd frontend
npm run typegen
```

#### Images not loading

1. Check image domain is in `next.config.ts` `remotePatterns`
2. Verify Sanity CDN URL format
3. Check browser console for specific errors

#### Slow development server

Use Turbopack (already configured):
```bash
npm run dev  # Uses --turbopack flag
```

### Build Errors

#### "GROQ query failed"

1. Check Sanity Studio is accessible
2. Verify `SANITY_API_READ_TOKEN` is valid
3. Test query in Sanity Vision tool

#### Out of memory during build

```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Sanity Issues

#### Content not appearing

1. Verify content is **published** (not just saved)
2. Check the GROQ query filters match your content
3. Clear browser cache
4. Wait for cache to expire (~1 hour)

#### Studio login issues

1. Clear browser cookies for sanity.io
2. Try incognito window
3. Verify project ID is correct

### API/External Service Issues

#### SlotsLaunch connection timeouts

The API may have IPv6 issues. The dev scripts use IPv4:
```bash
NODE_OPTIONS='--dns-result-order=ipv4first' npm run dev
```

This is already configured in `package.json` scripts.

#### Redis connection errors

1. Verify `UPSTASH_REDIS_REST_URL` and token
2. Check Upstash dashboard for quota/errors
3. Redis is optional - site works without it (slower)

### Production Issues

#### 404 on dynamic routes

1. Check route exists in Sanity
2. Verify slug matches exactly
3. Check redirect rules aren't catching the URL

#### Stale content

1. Cache TTL is 1 hour
2. Trigger Vercel redeploy for immediate update
3. Check `stale-while-revalidate` behavior

#### Slow page loads

1. Check Vercel analytics for specific pages
2. Look for heavy GROQ queries
3. Verify images are optimized
4. Check third-party script impact

---

## 10. Appendices

### A. Full Route Map

```
/                           # Homepage
/[slug]                     # Dynamic pages (from Sanity)
/casino                     # Casino listing
/casino/[slug]              # Individual casino reviews
/recenzii                   # All reviews
/pacanele-gratis            # Free slots listing
/pacanele-gratis/[slug]     # Individual free slot pages
/pacanele/[slug]            # Slot game pages
/loto-online-keno           # Lottery listing
/loto-online-keno/[slug]    # Individual lottery pages
/metode-de-plata            # Payment methods listing
/metode-de-plata/[slug]     # Individual payment pages
/posts/[slug]               # Blog posts
/author/[slug]              # Author profiles
/autori                     # Authors listing
/cazinouri-online           # Online casinos page
/api/draft-mode/enable      # Draft mode API
/api/slots                  # Slots API
/api/lotto/[game]           # Lottery data API
```

### B. Component Index

| Component | Path | Description |
|-----------|------|-------------|
| AboutUs | `components/AboutUs.tsx` | About us section |
| Analytics | `components/Analytics.tsx` | GTM integration |
| AuthorCard | `components/AuthorCard.tsx` | Author profile card |
| AuthorIntro | `components/AuthorIntro.tsx` | Author introduction |
| Avatar | `components/Avatar.tsx` | User avatar display |
| BeginnersGuide | `components/BeginnersGuide.tsx` | Beginner guide sections |
| BlockRenderer | `components/BlockRenderer.tsx` | Renders content blocks |
| BonusCalculator | `components/BonusCalculator.tsx` | Interactive calculator |
| ContentSections | `components/ContentSections.tsx` | Mixed content renderer |
| CoverImage | `components/CoverImage.tsx` | Cover image display |
| Cta | `components/Cta.tsx` | Call-to-action blocks |
| Date | `components/Date.tsx` | Date formatting |
| DesktopNavigation | `components/DesktopNavigation.tsx` | Desktop menu |
| DraftModeToast | `components/DraftModeToast.tsx` | Draft mode notification |
| DropdownMenu | `components/DropdownMenu.tsx` | Dropdown component |
| FAQSection | `components/FAQSection.tsx` | FAQ accordion |
| FeaturedCasino | `components/FeaturedCasino.tsx` | Featured casino display |
| FeaturedCasinoBanner | `components/FeaturedCasinoBanner.tsx` | Casino banner |
| FeaturedGame | `components/FeaturedGame.tsx` | Featured game display |
| FeaturedGamesGrid | `components/FeaturedGamesGrid.tsx` | Games grid |
| FeaturedSlotsGrid | `components/FeaturedSlotsGrid.tsx` | Slots grid |
| Footer | `components/Footer.tsx` | Site footer |
| GameCard | `components/GameCard.tsx` | Game card |
| GameFilters | `components/GameFilters.tsx` | Game filtering UI |
| GameGrid | `components/GameGrid.tsx` | Game grid layout |
| GameIframe | `components/GameIframe.tsx` | Game player iframe |
| Header | `components/Header.tsx` | Site header |
| InfoSection | `components/InfoSection.tsx` | Info section layout |
| JsonLd | `components/JsonLd.tsx` | Structured data |
| MobileMenu | `components/MobileMenu.tsx` | Mobile navigation |
| PageBuilder | `components/PageBuilder.tsx` | Page builder renderer |
| Pagination | `components/Pagination.tsx` | Pagination controls |
| PortableText | `components/PortableText.tsx` | Rich text renderer |
| Posts | `components/Posts.tsx` | Post listing |
| ResolvedLink | `components/ResolvedLink.tsx` | Link resolver |
| ResponsibleGamingDisclaimer | `components/ResponsibleGamingDisclaimer.tsx` | Gaming disclaimer |
| ReviewCard | `components/ReviewCard.tsx` | Review card |
| ReviewMethodology | `components/ReviewMethodology.tsx` | Review methodology |
| ReviewFAQ | `components/review/ReviewFAQ.tsx` | Review FAQ |
| SideBySideIcons | `components/SideBySideIcons.tsx` | Icon comparison |
| SimpleButton | `components/SimpleButton.tsx` | Button component |
| SlotsFilteredGrid | `components/SlotsFilteredGrid.tsx` | Filtered slots |
| ThemedGamesGrid | `components/ThemedGamesGrid.tsx` | Themed game grid |
| Toplist | `components/Toplist.tsx` | Casino ranking list |

### C. Sanity Schema Index

**Documents:**
- `casino` - Casino entities
- `casinoReview` - Casino reviews
- `game` - Slot games
- `provider` - Game providers
- `person` - Authors/staff
- `post` - Blog posts
- `page` - Generic pages
- `infoPage` - Info pages
- `themedSlotsPage` - Themed slot pages
- `reviewsPage` - Reviews listing
- `loto` - Lottery pages
- `slotsPageSettings` - Slots settings

**Singletons:**
- `settings` - Site settings
- `homePage` - Homepage config
- `lotoPageSettings` - Lottery settings

**Objects:**
- `blockContent` - Rich text
- `topListObject` - Casino top list
- `featuredCasino` - Featured casino
- `featuredGame` - Featured game
- `featuredGamesGrid` - Games grid
- `faqItem` - FAQ item
- `faqSection` - FAQ section
- `bonusCalculator` - Calculator widget
- `reviewMethodology` - Review criteria
- `beginnersGuide` - Beginner guide
- `aboutUs` - About us section
- `authorComment` - Author comment
- `callToAction` - CTA block
- `simpleButton` - Button
- `link` - Link object
- `linkableImage` - Image with link
- `youtubeEmbed` - YouTube embed
- `infoSection` - Info section

### D. npm Scripts Reference

**Root (run from project root):**

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start both frontend and studio |
| `dev:next` | `npm run dev:next` | Start frontend only |
| `dev:studio` | `npm run dev:studio` | Start studio only |
| `lint` | `npm run lint` | Lint frontend code |
| `type-check` | `npm run type-check` | TypeScript check all workspaces |
| `format` | `npm run format` | Format code with Prettier |
| `import-sample-data` | `npm run import-sample-data` | Import sample Sanity data |

**Frontend (run from /frontend):**

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Development server (Turbopack) |
| `build` | `npm run build` | Production build |
| `start` | `npm run start` | Start production server |
| `lint` | `npm run lint` | ESLint |
| `type-check` | `npm run type-check` | TypeScript check |
| `typegen` | `npm run typegen` | Generate Sanity types |

**Studio (run from /studio):**

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Development server |
| `build` | `npm run build` | Production build |
| `deploy` | `npm run deploy` | Deploy to Sanity hosting |
| `extract-types` | `npm run extract-types` | Extract schema types |
| `import-game` | `npm run import-game -- --slug="<slug>"` | Import game from SlotsLaunch |

---

## Document History

- **Created:** December 2024
- **Last Updated:** December 2024

---

*This documentation was created to enable seamless project handoff to new team members.*
