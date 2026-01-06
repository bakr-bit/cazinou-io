import {JoystickIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Themed Slots Page schema for filtered game collections
 * Examples: /pacanele-gratis/fructe-demo/, /pacanele-gratis/megaways/, /pacanele-gratis/netent/
 * Displays games filtered by theme, provider, or game type with custom content
 */

export const themedSlotsPage = defineType({
  name: 'themedSlotsPage',
  title: 'Themed Slots Page',
  type: 'document',
  icon: JoystickIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Admin title for this page (e.g., "Fructe Demo", "Megaways", "NetEnt")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL path under /pacanele-gratis/ (e.g., "fructe-demo" → /pacanele-gratis/fructe-demo/)',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Introductory description shown below the heading',
    }),
    // Game Selection Mode
    defineField({
      name: 'selectionMode',
      title: 'Game Selection Mode',
      type: 'string',
      description: 'Choose how games are selected for this page',
      options: {
        list: [
          {title: 'Filter by Criteria (automatic)', value: 'filter'},
          {title: 'Manual Selection (pick games)', value: 'manual'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'filter',
    }),
    // Manual Game Selection
    defineField({
      name: 'manualGames',
      title: 'Manual Game Selection',
      type: 'array',
      description: 'Manually select which games to display on this page',
      of: [{type: 'reference', to: [{type: 'game'}]}],
      hidden: ({parent}) => parent?.selectionMode !== 'manual',
      validation: (Rule) =>
        Rule.custom((games, context) => {
          const selectionMode = (context.parent as any)?.selectionMode
          if (selectionMode === 'manual' && (!games || games.length === 0)) {
            return 'Please select at least one game for manual mode'
          }
          return true
        }),
    }),
    // Filter Configuration
    defineField({
      name: 'filterType',
      title: 'Filter Type',
      type: 'string',
      description: 'What type of filtering should be applied to the games grid?',
      options: {
        list: [
          {title: 'Filter by Theme', value: 'theme'},
          {title: 'Filter by Provider', value: 'provider'},
          {title: 'Filter by Game Type', value: 'gameType'},
          {title: 'Filter by Minimum RTP', value: 'rtp'},
        ],
        layout: 'radio',
      },
      hidden: ({parent}) => parent?.selectionMode !== 'filter',
      validation: (Rule) =>
        Rule.custom((filterType, context) => {
          const selectionMode = (context.parent as any)?.selectionMode
          if (selectionMode === 'filter' && !filterType) {
            return 'Filter type is required when using filter mode'
          }
          return true
        }),
      initialValue: 'theme',
    }),
    defineField({
      name: 'filterValue',
      title: 'Filter Value',
      type: 'string',
      description: 'The value to filter by. For theme/provider/gameType: exact match (e.g., "Fruits", "NetEnt", "Slots"). For RTP: minimum percentage as number (e.g., "96" for RTP >= 96%).',
      hidden: ({parent}) => parent?.selectionMode !== 'filter',
      validation: (Rule) =>
        Rule.custom((filterValue, context) => {
          const selectionMode = (context.parent as any)?.selectionMode
          if (selectionMode === 'filter' && !filterValue) {
            return 'Filter value is required when using filter mode'
          }
          return true
        }),
      placeholder: 'e.g., Fruits, Megaways, NetEnt, Slots, Poker, 96, 97',
    }),
    // Featured Casino
    defineField({
      name: 'featuredCasino',
      title: 'Featured Casino',
      type: 'reference',
      to: [{type: 'casino'}],
      description: 'Optional casino to feature at the top of the page',
    }),
    // Custom Content Sections
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      description: 'Rich content sections displayed below the games grid',
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
        {type: 'linkableImage'},
        {type: 'youtubeEmbed'},
        {type: 'authorComment'},
        {type: 'topListObject'},
        {type: 'toplistReference'},
        {type: 'faqSection'},
        {type: 'featuredCasino'},
        {type: 'featuredGame'},
        {type: 'featuredGamesGrid'},
        {type: 'callToAction'},
        {type: 'simpleButton'},
        {type: 'bonusCalculator'},
      ],
    }),
    // SEO Fields
    defineField({
      name: 'seo',
      title: 'SEO & Social Meta',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'SEO title (50-60 chars). Defaults to heading if empty.',
          validation: (Rule) => Rule.max(60).warning('Keep under 60 characters'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'SEO description (150-160 chars). Defaults to description if empty.',
          validation: (Rule) => Rule.max(160).warning('Keep under 160 characters'),
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
    // Publication Settings
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
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      description: 'Hide this page from the sitemap and search engines',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      filterType: 'filterType',
      filterValue: 'filterValue',
    },
    prepare({title, slug, filterType, filterValue}) {
      const filterLabel =
        filterType === 'theme' ? '🏷️' :
        filterType === 'provider' ? '🏢' :
        filterType === 'rtp' ? '📊' :
        '🎮'
      const filterDisplay =
        filterType === 'rtp' ? `${filterType}: RTP ≥ ${filterValue}%` :
        `${filterType}: "${filterValue}"`
      return {
        title: title || 'Untitled Themed Page',
        subtitle: slug ? `/pacanele-gratis/${slug}` : 'No slug',
        description: `${filterLabel} ${filterDisplay}`,
      }
    },
  },
})
