import {HelpCircleIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * FAQ Section object
 * Groups multiple FAQ items together with an optional title and description
 */
export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Heading for the FAQ section',
      initialValue: 'Întrebări Frecvente',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional intro text above the FAQs',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQ Items',
      type: 'array',
      of: [{type: 'faqItem'}],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      faqCount: 'faqs.length',
    },
    prepare({title, faqCount}) {
      return {
        title: title || 'FAQ Section',
        subtitle: faqCount ? `${faqCount} question${faqCount !== 1 ? 's' : ''}` : 'No questions',
      }
    },
  },
})
