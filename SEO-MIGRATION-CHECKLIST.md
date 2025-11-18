# SEO Migration Checklist - Zero Impact Migration Guide

This checklist ensures your migration from WordPress to Next.js has **zero negative SEO impact**.

## ✅ Pre-Migration (Already Done)

- [x] **Trailing Slashes**: Configured `trailingSlash: true` to match live site
- [x] **Sitemap**: Created comprehensive sitemap with proper https:// URLs
- [x] **Robots.txt**: Added robots.ts with sitemap reference
- [x] **Canonical URLs**: Added canonical URL support to SEO utility
- [x] **Structured Data**: JSON-LD schema.org markup implemented
- [x] **Heading Hierarchy**: Optimized H1/H2/H3 structure for SEO

## 🔍 Pre-Launch Verification (Do Before Going Live)

### 1. URL Mapping & Redirects
- [ ] Export complete list of URLs from current WordPress site
- [ ] Verify all URLs exist in new Next.js sitemap
- [ ] Create 301 redirects for any changed URLs (already have some in next.config.ts)
- [ ] Test that redirects work properly

**Action**: Run a sitemap comparison tool to find missing URLs

### 2. Content Parity
- [ ] Verify all pages have identical content
- [ ] Check all meta titles match (or are improved)
- [ ] Check all meta descriptions match (or are improved)
- [ ] Verify all images have proper alt text
- [ ] Ensure all internal links work

### 3. Technical SEO
- [ ] Add canonical URLs to ALL page types:
  - [ ] Homepage
  - [ ] Casino reviews (`/casino/[slug]`)
  - [ ] Game pages (`/pacanele/[slug]`)
  - [ ] Info pages
  - [ ] Loto pages (`/loto-online-keno/[slug]`)
  - [ ] Themed slots pages (`/pacanele-gratis/[slug]`)
  - [ ] Payment method pages (`/metode-de-plata/[slug]`)
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://cazinou.io` in production environment
- [ ] Verify structured data on all page types using [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Test page speed with [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Verify mobile-friendliness with [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### 4. Sitemap & Indexing
- [ ] Verify sitemap.xml generates correctly in production
- [ ] Check sitemap includes ALL URLs with trailing slashes
- [ ] Verify robots.txt is accessible at `/robots.txt`
- [ ] Ensure no pages are accidentally blocked by robots.txt

### 5. Open Graph & Social
- [ ] Test Open Graph tags on all page types with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test Twitter Cards with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Verify og:image works and displays correctly

## 🚀 Launch Day

### 1. DNS & Deployment
- [ ] Deploy to production hosting
- [ ] Update DNS to point to new site
- [ ] Keep old site accessible at temporary URL for 24 hours (for comparison)

### 2. Immediate Verification
- [ ] Visit homepage and verify it loads correctly
- [ ] Check 5-10 high-traffic pages
- [ ] Test sitemap.xml accessibility
- [ ] Test robots.txt accessibility
- [ ] Verify Google Analytics/tracking codes work

### 3. Search Console Setup
- [ ] Add new site to Google Search Console (if not already)
- [ ] Submit new sitemap to Google Search Console
- [ ] Monitor for crawl errors immediately after launch

## 📊 Post-Launch Monitoring (First 7 Days)

### Day 1-2
- [ ] Check Google Search Console for crawl errors
- [ ] Monitor server logs for 404 errors
- [ ] Fix any broken internal links immediately
- [ ] Check that pages are being indexed (use `site:cazinou.io` in Google)

### Day 3-7
- [ ] Monitor organic traffic in Google Analytics
- [ ] Check Search Console for ranking changes
- [ ] Look for any unexpected 404s or redirects
- [ ] Monitor Core Web Vitals in Search Console

### Week 2-4
- [ ] Compare traffic to pre-migration levels
- [ ] Check keyword rankings with tools like Ahrefs/SEMrush
- [ ] Monitor for any indexing issues
- [ ] Update any external backlinks if needed

## 🛠️ Tools You'll Need

1. **Google Search Console** - Monitor indexing and crawl errors
2. **Google Analytics** - Track traffic changes
3. **Screaming Frog SEO Spider** - Crawl both sites to compare
4. **Ahrefs or SEMrush** - Monitor rankings
5. **PageSpeed Insights** - Verify performance
6. **Rich Results Test** - Verify structured data

## 🚨 Red Flags to Watch For

- Sudden traffic drop > 10% in first week
- Increase in 404 errors in Search Console
- Loss of featured snippets or rich results
- Decrease in indexed pages in Search Console
- Crawl errors or blocked resources

## 📝 Adding Canonical URLs to Remaining Pages

Currently, some pages have canonical URLs set via `alternates` in metadata. You should add canonical URLs to ALL page types. Here's the pattern:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cazinou.io'
  const canonicalUrl = `${siteUrl}/your-page-path/`

  return generateSEO({
    title: 'Your Title',
    description: 'Your description',
    canonicalUrl: canonicalUrl, // Add this
  })
}
```

## 🎯 Expected Outcomes (If Done Correctly)

- **Week 1**: Minor fluctuations (±5-10%) are normal
- **Week 2-4**: Traffic should stabilize to pre-migration levels
- **Month 2-3**: Traffic should improve due to better performance
- **Month 3+**: Rankings should improve due to better UX and Core Web Vitals

## 💡 Pro Tips

1. **Do migration during low-traffic period** (e.g., weekend or night)
2. **Keep old WordPress site backup** for at least 30 days
3. **Monitor search console daily** for first week
4. **Be ready to rollback** if traffic drops > 20% in first 24 hours
5. **Document everything** - keep notes of what you did and when

## 📞 Emergency Rollback Plan

If traffic drops significantly (>20% in 24 hours):

1. Revert DNS to old WordPress site
2. Investigate issues on staging environment
3. Fix problems before attempting migration again
4. Common issues: missing redirects, blocked resources, broken canonical URLs

---

**Remember**: A successful migration means users and search engines don't notice any change. Plan thoroughly, test extensively, and monitor closely.
