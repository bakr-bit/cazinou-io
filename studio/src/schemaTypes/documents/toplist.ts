import {defineField, defineType} from 'sanity'
import {OlistIcon} from '@sanity/icons'

export const toplist = defineType({
  name: 'toplist',
  title: 'Toplist',
  type: 'document',
  icon: OlistIcon,
  fields: [
    defineField({
      name: 'identifier',
      title: 'Identifier',
      type: 'string',
      description: 'A unique name to identify this toplist (e.g., "main-casino-list", "slots-top-10")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Default Title',
      type: 'string',
      description: 'The default heading for this list. Can be overridden per page.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Default Introduction',
      description: 'A short intro that appears above the list. Can be overridden per page.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'listItems',
      title: 'List Items',
      type: 'array',
      description: 'Drag items to reorder. Position in the list determines the rank.',
      of: [
        {
          type: 'object',
          name: 'listItem',
          fields: [
            defineField({
              name: 'item',
              title: 'Casino or Game to Feature',
              type: 'reference',
              to: [{type: 'casino'}, {type: 'game'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'customDescription',
              title: 'Custom Description',
              type: 'text',
              rows: 2,
              description: 'Why is this item on THIS list?',
            }),
          ],
          preview: {
            select: {
              title: 'item.name',
              subtitle: 'customDescription',
              media: 'item.logo',
            },
            prepare({title, subtitle, media}) {
              return {
                title: title || 'No item selected',
                subtitle,
                media,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'displayOptions',
      title: 'Display Options',
      type: 'object',
      description: 'Choose which features to show in this toplist',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        // Core Features (always recommended)
        defineField({
          name: 'showRank',
          type: 'boolean',
          title: 'Show Rank Badge',
          initialValue: true,
        }),
        defineField({
          name: 'showLogo',
          type: 'boolean',
          title: 'Show Logo',
          initialValue: true,
        }),
        defineField({
          name: 'showName',
          type: 'boolean',
          title: 'Show Name',
          initialValue: true,
        }),
        defineField({
          name: 'showBonus',
          type: 'boolean',
          title: 'Show Welcome Bonus',
          initialValue: true,
        }),
        defineField({
          name: 'showRating',
          type: 'boolean',
          title: 'Show Rating',
          initialValue: true,
        }),
        defineField({
          name: 'showDescription',
          type: 'boolean',
          title: 'Show Custom Description',
          initialValue: true,
        }),
        defineField({
          name: 'showLicense',
          type: 'boolean',
          title: 'Show License',
          initialValue: true,
        }),
        defineField({
          name: 'showActions',
          type: 'boolean',
          title: 'Show Action Buttons',
          initialValue: true,
        }),
        // Additional Features (opt-in)
        defineField({
          name: 'showPaymentMethods',
          type: 'boolean',
          title: 'Show Payment Methods',
          initialValue: false,
          description: 'Display payment method badges',
        }),
        defineField({
          name: 'showKeyFeatures',
          type: 'boolean',
          title: 'Show Key Features',
          initialValue: false,
          description: 'Display key feature bullet points',
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
      ],
    }),
  ],
  preview: {
    select: {
      identifier: 'identifier',
      title: 'title',
      items: 'listItems',
    },
    prepare({identifier, title, items}) {
      const itemCount = items ? items.length : 0
      return {
        title: identifier || 'Untitled Toplist',
        subtitle: `${title} (${itemCount} item${itemCount !== 1 ? 's' : ''})`,
        icon: OlistIcon,
      }
    },
  },
})
