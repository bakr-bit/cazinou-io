import {defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons'

/**
 * Featured Casino schema object for hero/banner sections.
 * Displays a single casino prominently with optional custom messaging.
 */

export const featuredCasino = defineType({
  name: 'featuredCasino',
  title: 'Featured Casino',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Optional heading above the casino (e.g., "Casino of the Month")',
    }),
    defineField({
      name: 'casino',
      title: 'Casino',
      type: 'reference',
      to: [{type: 'casino'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Custom Text',
      type: 'text',
      rows: 3,
      description: 'Additional promotional text or description',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'Custom CTA button text (defaults to "Play Now")',
    }),
    defineField({
      name: 'showRating',
      title: 'Show Rating',
      type: 'boolean',
      description: 'Display the casino rating badge',
      initialValue: true,
    }),
    defineField({
      name: 'displayOptions',
      title: 'Display Options',
      type: 'object',
      description: 'Choose which additional information to display',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'showBonus',
          type: 'boolean',
          title: 'Show Welcome Bonus',
          initialValue: true,
          description: 'Display the welcome bonus text',
        }),
        defineField({
          name: 'showKeyFeatures',
          type: 'boolean',
          title: 'Show Key Features',
          initialValue: false,
          description: 'Display key feature bullet points',
        }),
        defineField({
          name: 'showPaymentMethods',
          type: 'boolean',
          title: 'Show Payment Methods',
          initialValue: false,
          description: 'Display payment method badges',
        }),
        defineField({
          name: 'showPlatformBadges',
          type: 'boolean',
          title: 'Show Platform Badges',
          initialValue: false,
          description: 'Show Mobile/Live Casino/Crypto badges',
        }),
        defineField({
          name: 'showDepositLimits',
          type: 'boolean',
          title: 'Show Deposit Limits',
          initialValue: false,
          description: 'Display min/max deposit amounts',
        }),
        defineField({
          name: 'showGameCount',
          type: 'boolean',
          title: 'Show Number of Games',
          initialValue: false,
          description: 'Display total game count',
        }),
        defineField({
          name: 'showEstablishedYear',
          type: 'boolean',
          title: 'Show Established Year',
          initialValue: false,
          description: 'Display when casino was founded',
        }),
        defineField({
          name: 'showLicense',
          type: 'boolean',
          title: 'Show License',
          initialValue: false,
          description: 'Display licensing information',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      casino: 'casino', // Select whole reference to avoid nested field access
    },
    prepare({heading, casino}: {heading?: string; casino?: {name?: string; logo?: unknown}}) {
      return {
        title: heading || casino?.name || 'Featured Casino',
        subtitle: casino?.name ? `Featuring: ${casino.name}` : 'No casino selected',
        media: casino?.logo,
      }
    },
  },
})
