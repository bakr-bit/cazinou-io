import {defineType} from 'sanity'

/**
 * Reusable image type with optional link functionality
 * Allows images to be clickable and link to external or internal URLs
 */
export const linkableImage = defineType({
  name: 'linkableImage',
  title: 'Image',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative text',
      description: 'Important for SEO and accessibility',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'caption',
      type: 'string',
      title: 'Caption',
      description: 'Optional caption displayed below the image',
    },
    {
      name: 'link',
      type: 'object',
      title: 'Link',
      description: 'Make this image clickable by adding a link',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'URL',
          description: 'Where the image should link to when clicked',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https', 'mailto', 'tel'],
            }),
        },
        {
          name: 'blank',
          type: 'boolean',
          title: 'Open in new tab',
          description: 'Open the link in a new browser tab',
          initialValue: true,
        },
      ],
    },
  ],
})
