import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Link schema object. This link object lets the user first select the type of link and then
 * then enter the URL, page reference, or post reference - depending on the type selected.
 * Learn more: https://www.sanity.io/docs/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          {title: 'Internal Path', value: 'internal'},
          {title: 'External URL', value: 'href'},
          {title: 'Page', value: 'page'},
          {title: 'Post', value: 'post'},
          {title: 'Info Page', value: 'infoPage'},
          {title: 'Casino Review', value: 'casinoReview'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'internalPath',
      title: 'Internal Path',
      type: 'string',
      description: 'Enter the internal path (e.g., "/pacanele-gratis", "/recenzii", "/loto-online")',
      placeholder: '/pacanele-gratis',
      hidden: ({parent}) => parent?.linkType !== 'internal',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'internal' && !value) {
            return 'Internal path is required when Link Type is Internal Path'
          }
          if (value && !value.startsWith('/')) {
            return 'Internal path must start with a forward slash (/)'
          }
          return true
        }),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'href',
      validation: (Rule) =>
        // Custom validation to ensure URL is provided if the link type is 'href'
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'href' && !value) {
            return 'URL is required when Link Type is URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}],
      hidden: ({parent}) => parent?.linkType !== 'page',
      validation: (Rule) =>
        // Custom validation to ensure page reference is provided if the link type is 'page'
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'page' && !value) {
            return 'Page reference is required when Link Type is Page'
          }
          return true
        }),
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
      hidden: ({parent}) => parent?.linkType !== 'post',
      validation: (Rule) =>
        // Custom validation to ensure post reference is provided if the link type is 'post'
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'post' && !value) {
            return 'Post reference is required when Link Type is Post'
          }
          return true
        }),
    }),
    defineField({
      name: 'infoPage',
      title: 'Info Page',
      type: 'reference',
      to: [{type: 'infoPage'}],
      hidden: ({parent}) => parent?.linkType !== 'infoPage',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'infoPage' && !value) {
            return 'Info Page reference is required when Link Type is Info Page'
          }
          return true
        }),
    }),
    defineField({
      name: 'casinoReview',
      title: 'Casino Review',
      type: 'reference',
      to: [{type: 'casinoReview'}],
      hidden: ({parent}) => parent?.linkType !== 'casinoReview',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'casinoReview' && !value) {
            return 'Casino Review reference is required when Link Type is Casino Review'
          }
          return true
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
