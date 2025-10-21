import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons'

export const casino = defineType({
  name: 'casino',
  title: 'Casino',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Casino Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'affiliateLink',
      title: 'Affiliate Link',
      type: 'url',
      description: 'The most important link! Your tracked affiliate URL.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredBanner',
      title: 'Featured Banner',
      type: 'image',
      options: {hotspot: true},
      description: 'Hero/banner image for featured sections (fallback to logo if not provided)',
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1-10)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
    defineField({
      name: 'welcomeBonus',
      title: 'Welcome Bonus',
      type: 'string',
      description:
        'A short summary of the main welcome offer, e.g., "100% up to €200 + 50 Free Spins".',
    }),

    // Review is a separate document for /review/<slug>
    defineField({
      name: 'review',
      title: 'Full Review',
      type: 'reference',
      to: [{type: 'casinoReview'}],
      weak: true, // Weak reference to prevent circular dependency with casinoReview
      description: 'The dedicated review document used for /review/<slug>.',
    }),

    defineField({
      name: 'keyFeatures',
      title: 'Key Features',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Short features like "Fast Payouts", "24/7 Support", etc.',
    }),

    // ✅ Pros & Cons
    defineField({
      name: 'pros',
      title: 'Pros',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'List of positive aspects, e.g., "Fast withdrawals", "Great bonuses", etc.',
    }),
    defineField({
      name: 'cons',
      title: 'Cons',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description:
        'List of downsides, e.g., "Limited payment options", "High wagering requirements", etc.',
    }),

    // ✅ Business & Platform Flags
    defineField({
      name: 'legalEntity',
      title: 'Legal Entity',
      type: 'string',
      description: 'The official registered company name.',
    }),
    defineField({
      name: 'crypto',
      title: 'Supports Crypto',
      type: 'boolean',
      description: 'Does the casino support cryptocurrency payments?',
    }),
    defineField({
      name: 'mobile',
      title: 'Mobile Friendly',
      type: 'boolean',
      description: 'Is the casino optimized for mobile play?',
    }),
    defineField({
      name: 'liveCasino',
      title: 'Live Casino Available',
      type: 'boolean',
      description: 'Does this casino offer live dealer games?',
    }),
    defineField({
      name: 'numberOfGames',
      title: 'Number of Games',
      type: 'number',
      description: 'Approximate total number of games available.',
      validation: (Rule) => Rule.min(0),
    }),

    // ✅ Payments & Providers
    defineField({
      name: 'paymentMethods',
      title: 'Payment Methods',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Supported payment options, e.g., Visa, Mastercard, PayPal, Bitcoin.',
    }),
    defineField({
      name: 'featuredProviders',
      title: 'Featured Providers',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Key game providers such as NetEnt, Evolution, Pragmatic Play, etc.',
    }),

    // ✅ Detailed Ratings (1–5)
    defineField({
      name: 'trustRating',
      title: 'Trust Rating (1–5)',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Overall trustworthiness of the casino.',
    }),
    defineField({
      name: 'bonusRating',
      title: 'Bonuses Rating (1–5)',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'How generous and fair the bonuses are.',
    }),
    defineField({
      name: 'paymentRating',
      title: 'Payments Rating (1–5)',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Ease and reliability of payment methods.',
    }),
    defineField({
      name: 'withdrawalRating',
      title: 'Withdrawals Rating (1–5)',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Speed and reliability of withdrawals.',
    }),

    // ✅ Deposit Limits
    defineField({
      name: 'minimumDeposit',
      title: 'Minimum Deposit',
      type: 'number',
      description: 'The smallest amount a player can deposit.',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'maximumDeposit',
      title: 'Maximum Deposit',
      type: 'number',
      description: 'The largest amount a player can deposit.',
      validation: (Rule) => Rule.min(0),
    }),

    // Existing relations
    defineField({
      name: 'games',
      title: 'Featured Games',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'game'}],
        },
      ],
      description: 'Select the most popular games offered by this casino.',
    }),
    defineField({
      name: 'companyInfo',
      title: 'Company Information',
      type: 'object',
      fields: [
        defineField({
          name: 'licenses',
          title: 'Licenses',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'license', type: 'string', title: 'License'},
                {name: 'licenseNumber', type: 'string', title: 'License Number'},
                {name: 'licenseName', type: 'string', title: 'License Name'},
                {name: 'licenseAuthority', type: 'string', title: 'License Authority'},
                {name: 'issuedBy', type: 'string', title: 'Issued By'},
                {name: 'issueDate', type: 'string', title: 'Issue Date'},
                {name: 'details', type: 'string', title: 'Details'},
                {name: 'company', type: 'string', title: 'Company'},
                {name: 'registrationNumber', type: 'string', title: 'Registration Number'},
                {name: 'number', type: 'string', title: 'Number'},
                {name: 'type', type: 'string', title: 'Type'},
              ],
            },
          ],
        }),
        defineField({
          name: 'websiteUrl',
          title: 'Website URL',
          type: 'url',
        }),
        defineField({
          name: 'establishedYear',
          title: 'Established Year',
          type: 'number',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'rating',
      media: 'logo',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: `⭐ ${subtitle}/10 Rating`,
        media,
      }
    },
  },
})