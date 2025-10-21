import {DocumentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Info Page schema for general content pages (About, Methods of Payment, etc.)
 * Supports rich content mixed with custom components like toplists, FAQs, and featured casinos.
 */

export const infoPage = defineType({
  name: 'infoPage',
  title: 'Info Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The page title (used in admin and as fallback for SEO)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL path for this page (e.g., "cazinouri-online")',
      options: {
        source: 'title',
        maxLength: 96,
      },
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
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'Optional subheading below the main heading',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary of the page content (used for previews and SEO fallback)',
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
              description: 'Important for SEO and accessibility',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
        {
          type: 'authorComment',
        },
        // Custom components that can be inserted into content
        {type: 'topListObject'},
        {type: 'faqSection'},
        {type: 'featuredCasino'},
        {type: 'featuredGame'},
        {type: 'featuredGamesGrid'},
        {type: 'callToAction'},
        {type: 'bonusCalculator'},
        {type: 'reviewMethodology'},
        {type: 'beginnersGuide'},
        {type: 'aboutUs'},
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
      name: 'locale',
      title: 'Locale',
      type: 'string',
      options: {
        list: [
          {title: 'English', value: 'en'},
          {title: 'Romanian', value: 'ro'},
        ],
      },
      initialValue: 'ro',
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Social Meta',
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
          description: 'SEO title (50-60 chars). Defaults to page title if empty.',
          validation: (Rule) => Rule.max(60).warning('Keep under 60 characters for optimal display'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'SEO description (150-160 chars). Defaults to excerpt if empty.',
          validation: (Rule) =>
            Rule.max(160).warning('Keep under 160 characters for optimal display'),
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
        defineField({
          name: 'twitterTitle',
          title: 'Twitter Title',
          type: 'string',
          description: 'Twitter card title. Defaults to OG Title if empty.',
        }),
        defineField({
          name: 'twitterDescription',
          title: 'Twitter Description',
          type: 'text',
          rows: 2,
          description: 'Twitter card description. Defaults to OG Description if empty.',
        }),
        defineField({
          name: 'twitterImage',
          title: 'Twitter Image',
          type: 'image',
          description: 'Twitter card image. Defaults to OG Image if empty.',
          options: {hotspot: true},
        }),
        defineField({
          name: 'modifiedAt',
          title: 'Last Modified Date',
          type: 'datetime',
          description: 'Manually set when content is significantly updated (for freshness signals)',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      heading: 'heading',
      slug: 'slug.current',
    },
    prepare({title, heading, slug}) {
      return {
        title: title || heading || 'Untitled Page',
        subtitle: slug ? `/${slug}` : 'No slug',
      }
    },
  },
})
