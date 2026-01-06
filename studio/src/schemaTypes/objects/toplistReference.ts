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
