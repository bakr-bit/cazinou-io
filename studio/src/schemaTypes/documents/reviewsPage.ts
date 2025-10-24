import {defineField, defineType} from 'sanity'

export const reviewsPage = defineType({
  name: 'reviewsPage',
  title: 'Reviews Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal title for the page (e.g., "Recenzii Page")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Page Heading',
      type: 'string',
      description: 'Main heading displayed at the top of the page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Page Subheading',
      type: 'text',
      description: 'Optional subheading text displayed below the heading',
      rows: 3,
    }),
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      description: 'Rich text content displayed below the casino reviews grid',
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
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: true,
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
          type: 'youtubeEmbed',
        },
        {type: 'authorComment'},
        {type: 'faqSection'},
        {type: 'callToAction'},
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
          description: 'SEO title for search engines',
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          description: 'SEO description for search engines',
          rows: 3,
        },
        {
          name: 'ogTitle',
          type: 'string',
          title: 'Open Graph Title',
          description: 'Title for social media sharing',
        },
        {
          name: 'ogDescription',
          type: 'text',
          title: 'Open Graph Description',
          description: 'Description for social media sharing',
          rows: 3,
        },
        {
          name: 'ogImage',
          type: 'image',
          title: 'Open Graph Image',
          description: 'Image for social media sharing (1200x630px recommended)',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      heading: 'heading',
    },
    prepare({title, heading}) {
      return {
        title: title || 'Reviews Page',
        subtitle: heading || 'No heading set',
      }
    },
  },
})
