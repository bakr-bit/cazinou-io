import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons'

export const slotsPageSettings = defineType({
  name: 'slotsPageSettings',
  title: 'Slots Page Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Slots Page Configuration',
      readOnly: true,
      description: 'This is a singleton - only one instance exists',
    }),
    defineField({
      name: 'featuredCasino',
      title: 'Featured Casino',
      type: 'reference',
      to: [{type: 'casino'}],
      description: 'Select the casino to feature on the /pacanele-gratis/ page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredGamesGrid',
      title: 'Featured Games Grid',
      type: 'featuredGamesGrid',
      description: '4x4 grid of featured slot games (appears before the main games section)',
    }),
    defineField({
      name: 'content',
      title: 'SEO Content',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Main content section below the games grid (supports headings, paragraphs, lists, links)',
    }),
  ],
  preview: {
    select: {
      casinoName: 'featuredCasino.name',
    },
    prepare({casinoName}) {
      return {
        title: 'Slots Page Settings',
        subtitle: casinoName ? `Featured: ${casinoName}` : 'No casino selected',
      }
    },
  },
})
