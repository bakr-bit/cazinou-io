import {HomeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * HomePage singleton schema - only one homepage document can exist.
 * This is the main landing page with customizable hero and content sections.
 */

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Internal title for the CMS (not displayed on site)',
      initialValue: 'Homepage',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroBanner',
      title: 'Hero Banner',
      type: 'array',
      description: 'Introductory text displayed at the top of the homepage',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
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
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Page Content Sections',
      type: 'array',
      description: 'Mix of text content, toplists, featured casinos, and author intro',
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
        // Custom components
        {type: 'topListObject'},
        {type: 'featuredCasino'},
        {type: 'featuredGame'},
        {type: 'reviewMethodology'},
        {type: 'beginnersGuide'},
        {type: 'aboutUs'},
        {type: 'authorComment'},
        {type: 'faqSection'},
        {type: 'featuredGamesGrid'},
        {type: 'callToAction'},
        {type: 'simpleButton'},
        {type: 'bonusCalculator'},
        // Author introduction section
        {
          type: 'object',
          name: 'authorIntroSection',
          title: 'Author Introduction',
          icon: HomeIcon,
          fields: [
            defineField({
              name: 'heading',
              title: 'Section Heading',
              type: 'string',
              description: 'Optional heading for this section (e.g., "Meet Our Expert")',
            }),
            defineField({
              name: 'author',
              title: 'Author',
              type: 'reference',
              to: [{type: 'person'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'customText',
              title: 'Custom Introduction Text',
              type: 'text',
              rows: 3,
              description: 'Optional custom text to display instead of the author bio',
            }),
          ],
          preview: {
            select: {
              heading: 'heading',
              authorName: 'author.firstName',
              authorLastName: 'author.lastName',
            },
            prepare({heading, authorName, authorLastName}) {
              return {
                title: heading || 'Author Introduction',
                subtitle: authorName && authorLastName ? `${authorName} ${authorLastName}` : 'No author selected',
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required(),
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
          description: 'SEO title (50-60 chars). This is the homepage title.',
          validation: (Rule) => Rule.max(60).warning('Keep under 60 characters for optimal display'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'SEO description (150-160 chars).',
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
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Homepage',
        subtitle: 'Main landing page',
      }
    },
  },
})
