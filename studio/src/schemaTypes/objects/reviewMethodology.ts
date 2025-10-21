import {defineField, defineType} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'

/**
 * Review Methodology schema object for displaying review criteria and process.
 * Shows how casinos/games are evaluated with a card-based layout.
 */

export const reviewMethodology = defineType({
  name: 'reviewMethodology',
  title: 'Review Methodology',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Main heading for this section (e.g., "Our Review Methodology")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Introduction Text',
      type: 'text',
      rows: 3,
      description: 'Explanation of your review approach and process',
    }),
    defineField({
      name: 'criteria',
      title: 'Review Criteria',
      type: 'array',
      description: 'List of criteria used in your reviews',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          name: 'criterion',
          title: 'Criterion',
          fields: [
            defineField({
              name: 'iconName',
              title: 'Icon',
              type: 'string',
              description: 'Select an icon from the library',
              options: {
                list: [
                  // Security & Trust
                  {title: 'Shield (Security)', value: 'shield'},
                  {title: 'Lock (Protection)', value: 'lock'},
                  {title: 'File Check (Verified)', value: 'file-check'},
                  {title: 'Check Circle (Approved)', value: 'check-circle'},
                  {title: 'Check Square (Confirmed)', value: 'check-square'},
                  // Quality & Rating
                  {title: 'Award (Excellence)', value: 'award'},
                  {title: 'Star (Rating)', value: 'star'},
                  {title: 'Target (Accuracy)', value: 'target'},
                  // Performance
                  {title: 'Trending Up (Performance)', value: 'trending-up'},
                  {title: 'Activity (Analytics)', value: 'activity'},
                  {title: 'Bar Chart (Statistics)', value: 'bar-chart'},
                  {title: 'Zap (Speed)', value: 'zap'},
                  // Transparency
                  {title: 'Eye (Transparency)', value: 'eye'},
                  {title: 'Search (Review)', value: 'search'},
                  // Community
                  {title: 'Users (Community)', value: 'users'},
                  // Money
                  {title: 'Dollar Sign (Money)', value: 'dollar-sign'},
                  {title: 'Coins (Rewards)', value: 'coins'},
                  {title: 'Credit Card (Payments)', value: 'credit-card'},
                  // Information
                  {title: 'Info (Information)', value: 'info'},
                  {title: 'Lightbulb (Insight)', value: 'lightbulb'},
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
              title: 'Criterion Name',
              type: 'string',
              description: 'Name of this review criterion (e.g., "Security & Licensing")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'Detailed explanation of what you evaluate in this criterion',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
              iconName: 'iconName',
              media: 'customIcon',
            },
            prepare({title, subtitle, iconName, media}) {
              return {
                title: title || 'Untitled Criterion',
                subtitle: iconName ? `${iconName} • ${subtitle?.substring(0, 40) || ''}` : subtitle?.substring(0, 60) || '',
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
      criteriaCount: 'criteria.length',
    },
    prepare({title, criteriaCount}) {
      return {
        title: title || 'Review Methodology',
        subtitle: criteriaCount ? `${criteriaCount} criteria` : 'No criteria defined',
      }
    },
  },
})
