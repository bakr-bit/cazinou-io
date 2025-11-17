import {defineField, defineType, defineArrayMember} from 'sanity'
import {JoystickIcon, LinkIcon} from '@sanity/icons'

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
      title: 'Games & Link Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'game'}],
          title: 'Game',
        }),
        defineArrayMember({
          type: 'object',
          name: 'linkCard',
          title: 'Link Card',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'title',
              title: 'Card Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Title to display on the card',
            }),
            defineField({
              name: 'subtitle',
              title: 'Card Subtitle',
              type: 'string',
              description: 'Optional subtitle (e.g., "Vezi toate jocurile")',
            }),
            defineField({
              name: 'icon',
              title: 'Icon (Emoji or Text)',
              type: 'string',
              description: 'Optional icon/emoji to display (e.g., 🎰, 🎲, 🃏). Leave empty if using image.',
            }),
            defineField({
              name: 'image',
              title: 'Card Image',
              type: 'image',
              description: 'Image to display on the card (alternative to icon)',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'link',
              title: 'Link URL',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'URL to link to (e.g., /loto-online)',
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              description: 'Optional hex color for card background (e.g., #f97316 for orange)',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'subtitle',
              media: 'image',
              link: 'link',
            },
            prepare({title, subtitle, media, link}) {
              return {
                title: title || 'Link Card',
                subtitle: subtitle || link,
                media: media || LinkIcon,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.max(24).warning('Maximum 24 items for optimal display'),
      description: 'Add games or custom link cards to the grid',
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
