import {CommentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Author Comment Block
 * Used to insert expert commentary or author insights within review content
 */
export const authorComment = defineType({
  name: 'authorComment',
  title: 'Author Comment',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'author',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Author Role',
      type: 'string',
      description: 'e.g., Casino Expert, Senior Reviewer',
      placeholder: 'Casino Expert',
    }),
    defineField({
      name: 'avatar',
      title: 'Author Avatar',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'author',
      subtitle: 'comment',
      media: 'avatar',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Author Comment',
        subtitle: subtitle ? `${subtitle.substring(0, 60)}...` : 'No comment text',
      }
    },
  },
})
