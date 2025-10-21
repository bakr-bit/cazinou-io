import {defineField, defineType} from 'sanity'
import {JoystickIcon} from '@sanity/icons'

/**
 * Featured Game schema object for hero/banner sections.
 * Displays a single game prominently with optional custom messaging.
 */

export const featuredGame = defineType({
  name: 'featuredGame',
  title: 'Featured Game',
  type: 'object',
  icon: JoystickIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Optional heading above the game (e.g., "Game of the Month")',
    }),
    defineField({
      name: 'game',
      title: 'Game',
      type: 'reference',
      to: [{type: 'game'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Custom Text',
      type: 'text',
      rows: 3,
      description: 'Additional promotional text or description',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'Custom CTA button text (defaults to "Play Now")',
    }),
    defineField({
      name: 'affiliateLink',
      title: 'Affiliate Link',
      type: 'url',
      description: 'External affiliate link for "Joacă pe bani reali" button (opens in new tab)',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'showRating',
      title: 'Show Rating',
      type: 'boolean',
      description: 'Display the game rating badge',
      initialValue: true,
    }),
    defineField({
      name: 'displayOptions',
      title: 'Display Options',
      type: 'object',
      description: 'Choose which additional information to display',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'showProvider',
          type: 'boolean',
          title: 'Show Provider',
          initialValue: true,
          description: 'Display the game provider name',
        }),
        defineField({
          name: 'showRTP',
          type: 'boolean',
          title: 'Show RTP',
          initialValue: false,
          description: 'Display Return to Player percentage (if available)',
        }),
        defineField({
          name: 'showVolatility',
          type: 'boolean',
          title: 'Show Volatility',
          initialValue: false,
          description: 'Display game volatility level (if available)',
        }),
        defineField({
          name: 'showReleaseDate',
          type: 'boolean',
          title: 'Show Release Date',
          initialValue: false,
          description: 'Display when the game was released (if available)',
        }),
        defineField({
          name: 'showGameFeatures',
          type: 'boolean',
          title: 'Show Game Features',
          initialValue: false,
          description: 'Display game features like Free Spins, Multipliers, etc. (if available)',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      game: 'game', // Select whole reference to avoid nested field access
    },
    prepare({heading, game}: {heading?: string; game?: {name?: string; mainImage?: unknown}}) {
      return {
        title: heading || game?.name || 'Featured Game',
        subtitle: game?.name ? `Featuring: ${game.name}` : 'No game selected',
        media: game?.mainImage,
      }
    },
  },
})
