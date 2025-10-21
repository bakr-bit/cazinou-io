import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons'

/**
 * About Us schema object for displaying company information, values, or team info.
 * Card-based layout with rich text support.
 */

export const aboutUs = defineType({
  name: 'aboutUs',
  title: 'About Us',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Main heading for this section (e.g., "About Us", "Our Mission")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Introduction Text',
      type: 'text',
      rows: 3,
      description: 'Brief introduction to this section',
    }),
    defineField({
      name: 'items',
      title: 'About Items',
      type: 'array',
      description: 'Cards displaying information about your company, values, or team',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          name: 'aboutItem',
          title: 'About Item',
          fields: [
            defineField({
              name: 'iconName',
              title: 'Icon',
              type: 'string',
              description: 'Select an icon from the library',
              options: {
                list: [
                  // Company & Team
                  {title: 'Users (Team)', value: 'users'},
                  {title: 'Award (Excellence)', value: 'award'},
                  {title: 'Target (Mission)', value: 'target'},
                  {title: 'Eye (Vision)', value: 'eye'},
                  {title: 'Lightbulb (Innovation)', value: 'lightbulb'},
                  // Trust & Security
                  {title: 'Shield (Trust)', value: 'shield'},
                  {title: 'Lock (Security)', value: 'lock'},
                  {title: 'Check Circle (Quality)', value: 'check-circle'},
                  {title: 'Star (Rating)', value: 'star'},
                  // Performance
                  {title: 'Trending Up (Growth)', value: 'trending-up'},
                  {title: 'Zap (Speed)', value: 'zap'},
                  {title: 'Activity (Active)', value: 'activity'},
                  // Support & Community
                  {title: 'Help Circle (Support)', value: 'help-circle'},
                  {title: 'Info (Information)', value: 'info'},
                  // Other
                  {title: 'Settings (Process)', value: 'settings'},
                  {title: 'Search (Research)', value: 'search'},
                  {title: 'Book Open (Knowledge)', value: 'book-open'},
                  {title: 'Graduation Cap (Expertise)', value: 'graduation-cap'},
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
              title: 'Item Title',
              type: 'string',
              description: 'Title for this card (e.g., "Our Mission", "Expert Team")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              description: 'Rich text content for this item (supports formatting, lists, and links)',
              validation: (Rule) => Rule.required(),
              of: [
                {
                  type: 'block',
                  styles: [
                    {title: 'Normal', value: 'normal'},
                    {title: 'H3', value: 'h3'},
                    {title: 'H4', value: 'h4'},
                  ],
                  lists: [
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Numbered', value: 'number'},
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
              content: 'content',
              iconName: 'iconName',
              media: 'customIcon',
              colorTheme: 'colorTheme',
            },
            prepare({title, content, iconName, media, colorTheme}) {
              // Extract plain text from Portable Text array
              const contentText = content?.[0]?.children?.[0]?.text || ''
              const parts = []
              if (iconName) parts.push(iconName)
              if (colorTheme) parts.push(colorTheme)
              const prefix = parts.length > 0 ? `${parts.join(' • ')} • ` : ''

              return {
                title: title || 'Untitled Item',
                subtitle: prefix + contentText.substring(0, 60),
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
      itemsCount: 'items.length',
    },
    prepare({title, itemsCount}) {
      return {
        title: title || 'About Us',
        subtitle: itemsCount ? `${itemsCount} items` : 'No items defined',
      }
    },
  },
})
