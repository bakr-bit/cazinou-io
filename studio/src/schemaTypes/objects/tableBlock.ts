import {ThLargeIcon} from '@sanity/icons'
import {defineType, defineField} from 'sanity'

/**
 * Table Block - wrapper for @sanity/table with optional title and header row support
 * Used to embed data tables within portable text content
 */
export const tableBlock = defineType({
  name: 'tableBlock',
  title: 'Table',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Table Title',
      type: 'string',
      description: 'Optional title displayed above the table',
    }),
    defineField({
      name: 'hasHeaderRow',
      title: 'First Row is Header',
      type: 'boolean',
      description: 'If enabled, the first row will be styled as table headers',
      initialValue: true,
    }),
    defineField({
      name: 'table',
      title: 'Table Data',
      type: 'table',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      rows: 'table.rows',
    },
    prepare({title, rows}) {
      const rowCount = rows?.length || 0
      const colCount = rows?.[0]?.cells?.length || 0

      return {
        title: title || 'Table',
        subtitle: `${rowCount} rows x ${colCount} columns`,
        media: ThLargeIcon,
      }
    },
  },
})
