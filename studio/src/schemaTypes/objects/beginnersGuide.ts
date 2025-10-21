import {defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons'

/**
 * Beginners Guide schema object for explaining gambling concepts.
 * Educational card-based layout for topics like RTP, Volatility, Licenses, etc.
 */

export const beginnersGuide = defineType({
  name: 'beginnersGuide',
  title: 'Beginners Guide',
  type: 'object',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Main heading for this guide section (e.g., "Beginner\'s Guide to Online Casinos")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Introduction Text',
      type: 'text',
      rows: 3,
      description: 'Brief introduction to the guide section',
    }),
    defineField({
      name: 'topics',
      title: 'Guide Topics',
      type: 'array',
      description: 'Educational topics explaining gambling concepts',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          name: 'guideTopic',
          title: 'Guide Topic',
          fields: [
            defineField({
              name: 'iconName',
              title: 'Icon',
              type: 'string',
              description: 'Select an icon from the library',
              options: {
                list: [
                  // Gambling Specific
                  {title: 'Dice 1 (Gambling)', value: 'dice-1'},
                  {title: 'Dice 2 (Gambling)', value: 'dice-2'},
                  {title: 'Dice 3 (Gambling)', value: 'dice-3'},
                  {title: 'Dice 4 (Gambling)', value: 'dice-4'},
                  {title: 'Dice 5 (Gambling)', value: 'dice-5'},
                  {title: 'Dice 6 (Gambling)', value: 'dice-6'},
                  // Money & Payments
                  {title: 'Dollar Sign (RTP/Money)', value: 'dollar-sign'},
                  {title: 'Coins (Winnings)', value: 'coins'},
                  {title: 'Wallet (Bankroll)', value: 'wallet'},
                  {title: 'Banknote (Cash)', value: 'banknote'},
                  {title: 'Credit Card (Payments)', value: 'credit-card'},
                  {title: 'Circle Dollar (Currency)', value: 'circle-dollar-sign'},
                  // Performance & Stats
                  {title: 'Trending Up (Volatility High)', value: 'trending-up'},
                  {title: 'Trending Down (Volatility Low)', value: 'trending-down'},
                  {title: 'Activity (Gameplay)', value: 'activity'},
                  {title: 'Bar Chart (Statistics)', value: 'bar-chart'},
                  {title: 'Pie Chart (Distribution)', value: 'pie-chart'},
                  {title: 'Percent (RTP/Percentage)', value: 'percent'},
                  // Security & Trust
                  {title: 'Shield (Security)', value: 'shield'},
                  {title: 'Lock (Safe)', value: 'lock'},
                  {title: 'File Check (Licensed)', value: 'file-check'},
                  {title: 'Check Circle (Certified)', value: 'check-circle'},
                  // Information & Learning
                  {title: 'Book Open (Guide)', value: 'book-open'},
                  {title: 'Graduation Cap (Learn)', value: 'graduation-cap'},
                  {title: 'Help Circle (FAQ)', value: 'help-circle'},
                  {title: 'Info (Information)', value: 'info'},
                  {title: 'Lightbulb (Tips)', value: 'lightbulb'},
                  {title: 'Alert Circle (Warning)', value: 'alert-circle'},
                  // Time
                  {title: 'Clock (Time/Duration)', value: 'clock'},
                  // Other
                  {title: 'Zap (Fast/Instant)', value: 'zap'},
                  {title: 'Target (Goal)', value: 'target'},
                  {title: 'Settings (Configuration)', value: 'settings'},
                ],
                layout: 'dropdown',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'customIcon',
              title: 'Custom Icon (Optional)',
              type: 'image',
              description: 'Upload a custom icon if you don\'t want to use the icon library',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'title',
              title: 'Topic Title',
              type: 'string',
              description: 'Name of the concept (e.g., "RTP - Return to Player")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'shortDescription',
              title: 'Short Description',
              type: 'text',
              rows: 2,
              description: 'Brief one-liner explanation of the concept',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'detailedExplanation',
              title: 'Detailed Explanation',
              type: 'text',
              rows: 6,
              description: 'Comprehensive explanation with examples and context',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'exampleValues',
              title: 'Example Values/Range',
              type: 'string',
              description: 'Typical values or range (e.g., "95-98%" for RTP, "Low/Medium/High" for Volatility)',
              placeholder: 'e.g., 95-98%',
            }),
            defineField({
              name: 'colorTheme',
              title: 'Color Theme',
              type: 'string',
              description: 'Accent color for this card',
              options: {
                list: [
                  {title: 'Orange', value: 'orange'},
                  {title: 'Blue', value: 'blue'},
                  {title: 'Green', value: 'green'},
                  {title: 'Purple', value: 'purple'},
                  {title: 'Red', value: 'red'},
                  {title: 'Teal', value: 'teal'},
                ],
                layout: 'radio',
              },
              initialValue: 'orange',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'shortDescription',
              iconName: 'iconName',
              media: 'customIcon',
              colorTheme: 'colorTheme',
            },
            prepare({title, subtitle, iconName, media, colorTheme}) {
              const parts = []
              if (iconName) parts.push(iconName)
              if (colorTheme) parts.push(colorTheme)
              const prefix = parts.length > 0 ? `${parts.join(' • ')} • ` : ''

              return {
                title: title || 'Untitled Topic',
                subtitle: prefix + (subtitle || ''),
                media,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      topicsCount: 'topics.length',
    },
    prepare({title, topicsCount}) {
      return {
        title: title || 'Beginners Guide',
        subtitle: topicsCount ? `${topicsCount} topics` : 'No topics defined',
      }
    },
  },
})
