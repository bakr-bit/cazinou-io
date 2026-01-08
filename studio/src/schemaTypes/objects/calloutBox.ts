import {
  WarningOutlineIcon,
  InfoOutlineIcon,
  BulbOutlineIcon,
  DocumentIcon,
  BookmarkIcon,
  SparkleIcon,
} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Icon mapping for preview
const typeIcons: Record<string, React.ComponentType> = {
  warning: WarningOutlineIcon,
  info: InfoOutlineIcon,
  tip: BulbOutlineIcon,
  note: DocumentIcon,
  keyTakeaway: BookmarkIcon,
  didYouKnow: SparkleIcon,
}

// Labels for preview
const typeLabels: Record<string, string> = {
  warning: 'Warning',
  info: 'Info',
  tip: 'Tip',
  note: 'Note',
  keyTakeaway: 'Key Takeaway',
  didYouKnow: 'Did You Know',
}

/**
 * Callout Box Block
 * Used to highlight important information, tips, warnings, and other callouts within content
 */
export const calloutBox = defineType({
  name: 'calloutBox',
  title: 'Callout Box',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'type',
      title: 'Callout Type',
      type: 'string',
      options: {
        list: [
          {title: 'Warning (Yellow)', value: 'warning'},
          {title: 'Info (Blue)', value: 'info'},
          {title: 'Tip (Green)', value: 'tip'},
          {title: 'Note (Gray)', value: 'note'},
          {title: 'Key Takeaway (Purple)', value: 'keyTakeaway'},
          {title: 'Did You Know (Cyan)', value: 'didYouKnow'},
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title (Optional)',
      type: 'string',
      description: 'Custom title. Leave empty to use default (e.g., "Atenție", "Sfat")',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      type: 'type',
      title: 'title',
      content: 'content',
    },
    prepare({type, title, content}) {
      const calloutType = type || 'info'
      return {
        title: title || typeLabels[calloutType] || 'Callout',
        subtitle: content ? `${content.substring(0, 60)}...` : 'No content',
        media: typeIcons[calloutType] || InfoOutlineIcon,
      }
    },
  },
})
