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