// studio/src/schemaTypes/game.ts
import {defineField, defineType} from 'sanity'
import {JoystickIcon} from '@sanity/icons'

export const game = defineType({
  name: 'game',
  title: 'Game',
  type: 'document',
  icon: JoystickIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Game Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'reference',
      to: [{type: 'provider'}], // This connects to our Provider schema!
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (out of 5)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'slotsLaunchId',
      title: 'SlotsLaunch Game ID',
      type: 'number',
      description: '💡 Use CLI to import: cd studio && npm run import-game -- --slug="game-slug". The numeric ID from SlotsLaunch API (used for reliable matching).',
    }),
    defineField({
      name: 'slotsLaunchSlug',
      title: 'SlotsLaunch Slug',
      type: 'string',
      description: 'The URL slug from SlotsLaunch (e.g., "shining-crown-egt"). This is used to link to the game page.',
    }),
    defineField({
      name: 'slotsLaunchThumb',
      title: 'SlotsLaunch Thumbnail URL',
      type: 'url',
      description: 'Thumbnail image URL from SlotsLaunch API. If provided, this will be used instead of the Main Image in grids.',
    }),
    // Game Classification & Filtering
    defineField({
      name: 'gameType',
      title: 'Game Type',
      type: 'string',
      description: 'Type of game (e.g., "Slots", "Poker", "Blackjack", "Specialty")',
    }),
    defineField({
      name: 'gameTypeSlug',
      title: 'Game Type Slug',
      type: 'string',
      description: 'URL-friendly slug for the game type',
    }),
    defineField({
      name: 'themes',
      title: 'Themes',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Game themes/tags (e.g., "Megaways", "Christmas", "Ancient Egypt", "Fruit")',
    }),
    // Game Attributes
    defineField({
      name: 'rtp',
      title: 'RTP (Return to Player)',
      type: 'string',
      description: 'Return to Player percentage (e.g., "96.5%")',
    }),
    defineField({
      name: 'volatility',
      title: 'Volatility',
      type: 'string',
      options: {
        list: [
          {title: 'Low', value: 'low'},
          {title: 'Medium', value: 'medium'},
          {title: 'High', value: 'high'},
        ],
      },
      description: 'Game volatility level',
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release Date',
      type: 'string',
      description: 'Game release date from SlotsLaunch API',
    }),
    defineField({
      name: 'seoContent',
      title: 'SEO Content',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Rich content that will appear below the game demo on the game page (for SEO purposes)',
    }),
    defineField({
      name: 'review',
      title: 'Review',
      type: 'blockContent', // This is Sanity's rich text editor
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'provider.name',
      media: 'mainImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: `by ${subtitle}`,
        media,
      }
    },
  },
})