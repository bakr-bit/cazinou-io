import {HelpCircleIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * FAQ Item
 * A single question-answer pair for FAQ sections
 */
export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'answer',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Question',
        subtitle: subtitle ? `${subtitle.substring(0, 60)}...` : 'No answer',
      }
    },
  },
})
