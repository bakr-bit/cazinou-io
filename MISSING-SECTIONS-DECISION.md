# Missing Sections - Decision Required

Based on the URL mapping analysis, **56 URLs** from your WordPress site don't have a direct match in the Next.js site. You need to decide what to do with these sections.

## 📊 Summary by Section

| Section | Count | Decision Needed |
|---------|-------|-----------------|
| **Bonusuri** | 24 | Migrate content or redirect? |
| **Sport** | 15 | Migrate content or redirect? |
| **Category Archives** | 7 | Redirect to related pages? |
| **Author Pages** | 5 | Create author pages or redirect? |
| **Ghid (Guides)** | 3 | Migrate content or redirect? |
| **Blog Pagination** | 2 | Auto-handled by Next.js? |

---

## 1. 🎁 Bonusuri Section (24 URLs)

**What it is:** Casino bonus reviews and bonus-related content

**Sample URLs:**
- `/bonusuri/vavada-casino-bonus`
- `/bonusuri/ice-casino-bonus`
- `/bonusuri/50-rotiri-gratuite-fara-depunere`
- `/bonusuri/rolletto-bonus-fara-depunere`

### Options:

**Option A: Migrate to Next.js** (Recommended if content is valuable)
- Create new `bonusuri` document type in Sanity
- Create `/bonusuri/[slug]` route in Next.js
- Migrate 24 articles to Sanity
- ✅ Preserves SEO value
- ✅ Keeps all content
- ❌ Requires development time

**Option B: Redirect to Casino Reviews**
- Map each bonus page to its related casino review
- Example: `/bonusuri/vavada-casino-bonus` → `/casino/vavada-casino`
- ✅ Quick solution
- ❌ Loses some SEO value
- ❌ Less specific content

**Option C: Redirect to Homepage or Generic Bonus Page**
- Redirect all to a generic bonus category page
- ❌ Significant SEO loss
- ❌ Poor user experience

### Recommendation:
**Option A** - Migrate if bonusuri content drives significant traffic. Check Google Analytics to see if these 24 pages are valuable.

---

## 2. ⚽ Sport Section (15 URLs)

**What it is:** Sports betting guides and information

**Sample URLs:**
- `/sport/calendar-sportiv-2025`
- `/sport/pariuri-darts`
- `/sport/cat-dureaza-un-meci-de-volei`
- `/sport/pariuri-pe-cornere`

### Options:

**Option A: Keep in Next.js as Info Pages**
- If content is mostly informational, could be `infoPage` type
- Create `/sport/[slug]` route
- ✅ Preserves content and SEO
- ❌ Requires development

**Option B: Remove Sports Content**
- If sports betting is not your focus, redirect to homepage
- ❌ SEO loss
- ❌ 404s for users

### Recommendation:
If sports betting is part of your business model, **migrate it**. If not, consider if these 15 pages drive traffic worth keeping.

---

## 3. 📚 Ghid Section (3 URLs)

**What it is:** Gaming guides

**URLs:**
- `/ghid/reguli-razboi` (War rules)
- `/ghid/cum-sa-castigi-la-aparate` (How to win at slots)
- `/ghid/cat-castigi-cu-o-linie-de-septari` (Winnings calculation)

### Options:

**Option A: Convert to Info Pages**
- These could be regular `infoPage` type in Sanity
- Move to root level: `/reguli-razboi`, `/cum-sa-castigi-la-aparate`
- Add redirects from `/ghid/*` to root level
- ✅ Simple migration
- ✅ Keeps SEO value

**Option B: Keep /ghid/ Structure**
- Create `/ghid/[slug]` route
- Keep URL structure identical
- ✅ No redirect needed
- ❌ Extra route to maintain

### Recommendation:
**Option A** - Convert to root-level info pages with redirects. Only 3 pages, easy to migrate.

---

## 4. 📑 Category Archives (7 URLs)

**What it is:** WordPress category archive pages

**URLs:**
- `/category/bonusuri`
- `/category/sport/page/2`
- `/category/loto`
- `/category/ghid`

### Options:

**Option A: Create Category Listing Pages**
- Build dynamic category pages in Next.js
- Show lists of related content
- ✅ Maintains site structure
- ❌ Development effort

**Option B: Redirect to Root or Relevant Sections**
- `/category/bonusuri` → `/bonusuri` (if you keep bonusuri)
- `/category/loto` → `/loto-online-keno`
- `/category/sport` → `/sport` (if you keep sport)
- ✅ Simple solution
- ⚠️ Some SEO impact

**Option C: Let Them 404**
- Category archives typically have low SEO value
- Users rarely land on these pages from Google
- ⚠️ May cause crawl errors

### Recommendation:
**Option B** - Redirect to relevant sections. Category archives usually don't drive much direct traffic.

---

## 5. 👤 Author Pages (5 URLs)

**What it is:** Author profile and article listing pages

**URLs:**
- `/author/cristinar`
- `/author/andreigavrila`
- `/author/cristinar/page/2` (pagination)

### Options:

**Option A: Create Author Pages in Next.js**
- Create `/autori/[slug]` route (Romanian: "autori" = authors)
- Show author bio and article list
- ✅ Good for E-A-T (Expertise, Authoritativeness, Trustworthiness)
- ✅ Important for YMYL content
- ❌ Requires development

**Option B: Redirect to Homepage**
- Simple redirect
- ❌ Loses author attribution visibility
- ❌ SEO impact for author authority

### Recommendation:
For casino/gambling content (YMYL - Your Money Your Life), **author pages are important for E-A-T**. Consider creating them.

---

## 6. 📄 Blog Pagination (2 URLs)

**What it is:** Pagination for blog listing

**URLs:**
- `/blog/page/2`
- `/blog/page/3`

### Decision:

If you have a `/blog` page in Next.js, pagination should be auto-handled. If not, redirect to homepage or create a blog index.

---

## 🎯 Recommended Priority Actions

### HIGH PRIORITY (Do Before Launch):

1. **Bonusuri (24 URLs)** - Check Google Analytics traffic
   - If traffic > 5% of total: Migrate content
   - If traffic < 5%: Redirect to casino reviews

2. **Ghid (3 URLs)** - Convert to info pages + add redirects

3. **Author Pages (5 URLs)** - Create `/autori/[slug]` for E-A-T

### MEDIUM PRIORITY:

4. **Sport (15 URLs)** - Check traffic and business goals
   - Keep if sports betting is core to business
   - Otherwise, redirect to homepage

### LOW PRIORITY:

5. **Category Archives (7 URLs)** - Redirect to relevant sections

6. **Blog Pagination (2 URLs)** - Handle if you have /blog route

---

## 📝 Next Steps

1. **Check Google Analytics:**
   - Export traffic data for these 56 URLs
   - Identify which pages drive the most traffic
   - Focus migration efforts on high-traffic pages

2. **Make Decisions:**
   - Decide which sections to migrate vs redirect
   - Update this document with your decisions

3. **Implementation Plan:**
   - For migrated sections: Create Sanity schemas and Next.js routes
   - For redirects: Add to `next.config.ts`
   - For 404s: Document and accept SEO impact

4. **Test:**
   - Test all redirects work correctly
   - Verify migrated content renders properly
   - Check sitemap includes all new pages

---

## 💡 SEO Impact Assessment

**Low Risk:**
- Category archives (low traffic typically)
- Blog pagination (auto-handled)

**Medium Risk:**
- Sport section (depends on traffic)
- Ghid section (only 3 pages)

**High Risk:**
- Bonusuri section (24 pages, likely high traffic)
- Author pages (E-A-T is important for YMYL)

**Recommendation:** Don't let ANY pages 404 without checking their traffic first. Even low-traffic pages contribute to overall domain authority.
