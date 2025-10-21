// studio/src/schemaTypes/provider.ts
import {defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'

export const provider = defineType({
  name: 'provider',
  title: 'Provider',
  type: 'document',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Provider Name',
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
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
    },
  },
})