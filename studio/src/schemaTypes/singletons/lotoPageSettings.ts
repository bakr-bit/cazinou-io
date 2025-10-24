import {defineField, defineType} from 'sanity'
import {NumberIcon} from '@sanity/icons'

/**
 * Loto Page Settings - Singleton configuration for /loto-online page
 * Similar to slotsPageSettings but for lottery games
 */
export const lotoPageSettings = defineType({
  name: 'lotoPageSettings',
  title: 'Loto Page Settings',
  type: 'document',
  icon: NumberIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Loto Page Configuration',
      readOnly: true,
      description: 'This is a singleton - only one instance exists',
    }),
    defineField({
      name: 'heading',
      title: 'Page Heading',
      type: 'string',
      description: 'Main H1 heading for the loto page',
    }),
    defineField({
      name: 'description',
      title: 'Page Description',
      type: 'text',
      rows: 3,
      description: 'Introductory text below the heading',
    }),
    defineField({
      name: 'featuredCasino',
      title: 'Featured Casino',
      type: 'reference',
      to: [{type: 'casino'}],
      description: 'Select the casino to feature on the /loto-online/ page',
    }),
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      description: 'Rich content with text blocks and embedded components',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) => Rule.required(),
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'linkableImage',
        },
        {
          type: 'authorComment',
        },
        // Custom components that can be inserted into content
        {type: 'topListObject'},
        {type: 'faqSection'},
        {type: 'featuredCasino'},
        {type: 'featuredGame'},
        {type: 'callToAction'},
        {type: 'simpleButton'},
        {type: 'bonusCalculator'},
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'SEO title (50-60 chars)',
          validation: (Rule) => Rule.max(60).warning('Keep under 60 characters'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'SEO description (150-160 chars)',
          validation: (Rule) => Rule.max(160).warning('Keep under 160 characters'),
        }),
        defineField({
          name: 'ogTitle',
          title: 'Open Graph Title',
          type: 'string',
          description: 'Facebook/LinkedIn title. Defaults to Meta Title if empty.',
        }),
        defineField({
          name: 'ogDescription',
          title: 'Open Graph Description',
          type: 'text',
          rows: 2,
          description: 'Facebook/LinkedIn description. Defaults to Meta Description if empty.',
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Social sharing image (1200x630px recommended)',
          options: {hotspot: true},
        }),
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      casinoName: 'featuredCasino.name',
    },
    prepare({heading, casinoName}) {
      return {
        title: 'Loto Page Settings',
        subtitle: heading || (casinoName ? `Featured: ${casinoName}` : 'No configuration yet'),
      }
    },
  },
})
