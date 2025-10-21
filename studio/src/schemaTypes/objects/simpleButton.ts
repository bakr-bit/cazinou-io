import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Simple Button schema - a standalone, centered CTA button without heading/text
 */

export const simpleButton = defineType({
  name: 'simpleButton',
  title: 'Simple Button',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'The text displayed on the button',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Button Link',
      type: 'link',
      description: 'Where the button links to',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonStyle',
      title: 'Button Style',
      type: 'string',
      description: 'Visual style of the button',
      options: {
        list: [
          {title: 'Primary (Orange)', value: 'primary'},
          {title: 'Secondary (Outline)', value: 'secondary'},
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonSize',
      title: 'Button Size',
      type: 'string',
      description: 'Size of the button',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Large', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'default',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'buttonText',
      style: 'buttonStyle',
      size: 'buttonSize',
    },
    prepare({title, style, size}) {
      return {
        title: title || 'Button',
        subtitle: `${style === 'primary' ? 'Primary' : 'Secondary'} • ${size === 'large' ? 'Large' : 'Default'}`,
      }
    },
  },
})
