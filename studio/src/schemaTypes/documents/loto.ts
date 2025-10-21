import {defineField, defineType} from 'sanity'
import {NumberIcon} from '@sanity/icons'

/**
 * Loto document - Individual lottery game pages
 * E.g., /loto-online/loto-germania, /loto-online/eurojackpot
 */
export const loto = defineType({
  name: 'loto',
  title: 'Loto Game',
  type: 'document',
  icon: NumberIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Lottery game name (e.g., "Loto Germania", "EuroJackpot")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'URL slug (e.g., "loto-germania")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Main H1 heading displayed on the page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary of the lottery (used for previews and SEO)',
    }),
    defineField({
      name: 'apiSlug',
      title: 'API Slug',
      type: 'string',
      description: 'Slug used to fetch data from lotto API (e.g., "germany", "eurojackpot")',
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
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
        {type: 'authorComment'},
        {type: 'topListObject'},
        {type: 'faqSection'},
        {type: 'featuredCasino'},
        {type: 'featuredGame'},
        {type: 'callToAction'},
        {type: 'simpleButton'},
        {type: 'bonusCalculator'},
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this page was first published',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'person'}],
      description: 'The author of this page (optional)',
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
        }),
        defineField({
          name: 'ogDescription',
          title: 'Open Graph Description',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          options: {hotspot: true},
        }),
        defineField({
          name: 'modifiedAt',
          title: 'Modified At',
          type: 'date',
          description: 'Last modified date for SEO',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      author: 'author.firstName',
    },
    prepare({title, slug, author}) {
      return {
        title: title || 'Untitled',
        subtitle: slug ? `/${slug}` : (author ? `by ${author}` : 'No slug'),
      }
    },
  },
})
