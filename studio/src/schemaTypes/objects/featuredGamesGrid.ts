import {defineField, defineType} from 'sanity'
import {JoystickIcon} from '@sanity/icons'

export const featuredGamesGrid = defineType({
  name: 'featuredGamesGrid',
  title: 'Featured Games Grid',
  type: 'object',
  icon: JoystickIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Heading for the featured games section',
      initialValue: 'Păcănele Recomandate',
    }),
    defineField({
      name: 'description',
      title: 'Section Description',
      type: 'text',
      rows: 2,
      description: 'Optional description text below the title',
    }),
    defineField({
      name: 'games',
      title: 'Featured Games',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'game'}]}],
      validation: (Rule) => Rule.max(16).warning('Maximum 16 games for a 4x4 grid'),
      description: 'Select up to 16 games to display in the featured grid (4x4 layout)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      gamesCount: 'games.length',
    },
    prepare({title, gamesCount}) {
      return {
        title: title || 'Featured Games Grid',
        subtitle: gamesCount ? `${gamesCount} games selected` : 'No games selected',
      }
    },
  },
})
