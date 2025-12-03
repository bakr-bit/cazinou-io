// sanity/schemas/objects/topListObject.ts

import {defineField, defineType} from 'sanity'
import {OlistIcon} from '@sanity/icons'

export const topListObject = defineType({
  name: 'topListObject',
  title: 'Top List',
  type: 'object',
  icon: OlistIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'List Title',
      type: 'string',
      description: 'The heading for this list, e.g., "Our Top Casino Picks for October 2025"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Introduction',
      description: 'A short intro that appears above the list.',
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
      title: 'title',
      items: 'listItems',
    },
    prepare({title, items}) {
      const itemCount = items ? items.length : 0
      return {
        title: title || 'Untitled Top List',
        subtitle: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
        icon: OlistIcon,
      }
    },
  },
})