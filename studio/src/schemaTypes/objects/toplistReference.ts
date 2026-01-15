import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

export const toplistReference = defineType({
  name: 'toplistReference',
  title: 'Toplist (Shared)',
  type: 'object',
  icon: LinkIcon,
  description: 'Reference a shared toplist that can be reused across multiple pages',
  fields: [
    defineField({
      name: 'toplist',
      title: 'Toplist',
      type: 'reference',
      to: [{type: 'toplist'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleOverride',
      title: 'Title Override',
      type: 'string',
      description: 'Optional: Use a different title on this page instead of the toplist default',
    }),
    defineField({
      name: 'descriptionOverride',
      title: 'Description Override',
      type: 'text',
      rows: 3,
      description: 'Optional: Use a different introduction on this page',
    }),
    defineField({
      name: 'additionalColumns',
      title: 'Additional Columns',
      type: 'object',
      description: 'Enable extra columns on this page (basic columns are always shown)',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: 'showDescription',
          type: 'boolean',
          title: 'Show Custom Description',
          initialValue: false,
        }),
        defineField({
          name: 'showPaymentMethods',
          type: 'boolean',
          title: 'Show Payment Methods',
          initialValue: false,
        }),
        defineField({
          name: 'showKeyFeatures',
          type: 'boolean',
          title: 'Show Key Features',
          initialValue: false,
        }),
        defineField({
          name: 'showPlatformBadges',
          type: 'boolean',
          title: 'Show Platform Badges',
          description: 'Mobile/Live Casino/Crypto badges',
          initialValue: false,
        }),
        defineField({
          name: 'showDepositLimits',
          type: 'boolean',
          title: 'Show Deposit Limits',
          initialValue: false,
        }),
        defineField({
          name: 'showGameCount',
          type: 'boolean',
          title: 'Show Game Count',
          initialValue: false,
        }),
        defineField({
          name: 'showEstablishedYear',
          type: 'boolean',
          title: 'Show Established Year',
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      identifier: 'toplist.identifier',
      title: 'toplist.title',
      titleOverride: 'titleOverride',
      itemCount: 'toplist.listItems',
    },
    prepare({identifier, title, titleOverride, itemCount}) {
      const count = itemCount ? itemCount.length : 0
      return {
        title: titleOverride || title || 'No toplist selected',
        subtitle: `Shared: ${identifier || 'Unknown'} (${count} items)`,
        icon: LinkIcon,
      }
    },
  },
})
