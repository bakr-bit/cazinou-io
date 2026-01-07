import {CaseIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const casinoReview = defineType({
  name: 'casinoReview',
  title: 'Casino Review',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'casino',
      title: 'Casino',
      type: 'reference',
      to: [{type: 'casino'}],
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value?._ref) {
            return 'A casino reference is required.'
          }

          const documentId = context.document?._id?.replace(/^drafts\./, '')
          const client = context.getClient({apiVersion: '2023-05-01'})
          const existing = await client.fetch(
            `*[_type == "casinoReview" && references($casinoId) && !(_id in [$draftId, $publishedId])][0]._id`,
            {
              casinoId: value._ref,
              draftId: documentId ? `drafts.${documentId}` : null,
              publishedId: documentId ?? null,
            },
          )

          return existing ? 'A review for this casino already exists.' : true
        }),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'person'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tldr',
      title: 'TL;DR / Brief Review',
      type: 'text',
      rows: 2,
      description: 'A short summary or "too long; didn\'t read" version of the review',
    }),
    defineField({
      name: 'content',
      title: 'Review Content',
      type: 'array',
      description: 'Main review content with text blocks and author commentary',
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
          type: 'authorComment',
        },
        {
          type: 'linkableImage',
        },
        {
          type: 'youtubeEmbed',
        },
        {
          type: 'tableBlock',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'faq',
      title: 'Frequently Asked Questions',
      type: 'array',
      of: [{type: 'faqItem'}],
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
      name: 'hidden',
      title: 'Hidden from Listings',
      type: 'boolean',
      description: 'Hide this review from the /recenzii page and sitemap (still accessible via direct URL)',
      initialValue: false,
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
          description: 'SEO title (50-60 chars). Defaults to review title if empty.',
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
      casinoName: 'casino.name',
      media: 'casino.logo',
    },
    prepare({title, casinoName, media}) {
      return {
        title,
        subtitle: casinoName ? `Casino: ${casinoName}` : 'Casino not linked',
        media,
      }
    },
  },
})
