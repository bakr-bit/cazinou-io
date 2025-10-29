import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Person schema.  Define and edit the fields for the 'person' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const person = defineType({
  name: 'person',
  title: 'Person',
  icon: UserIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) => `${doc.firstName} ${doc.lastName}`,
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g., Casino Expert, Senior Reviewer, Live Casino Specialist',
      placeholder: 'Casino Expert',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      description: 'Short biography about the author',
    }),
    defineField({
      name: 'longBio',
      title: 'Long Bio',
      type: 'blockContent',
      description: 'Detailed biography for the author page. If not provided, the short bio will be used.',
    }),
    defineField({
      name: 'expertise',
      title: 'Areas of Expertise',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of expertise areas (e.g., Slots, Live Casino, Crypto Payments)',
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'yearsOfExperience',
      title: 'Years of Experience',
      type: 'number',
      description: 'Total years of experience in the casino/gaming industry',
      validation: (Rule) => Rule.min(0).max(50),
    }),
    defineField({
      name: 'credentials',
      title: 'Credentials & Certifications',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Professional credentials, certifications, or qualifications',
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'object',
      description: 'Links to author\'s professional social media profiles',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          description: 'LinkedIn profile URL',
        }),
        defineField({
          name: 'twitter',
          title: 'Twitter/X',
          type: 'url',
          description: 'Twitter/X profile URL',
        }),
        defineField({
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
          description: 'Facebook profile URL',
        }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
          description: 'Instagram profile URL',
        }),
        defineField({
          name: 'website',
          title: 'Personal Website',
          type: 'url',
          description: 'Personal website or blog URL',
        }),
      ],
    }),
    defineField({
      name: 'picture',
      title: 'Picture',
      type: 'image',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (rule) => {
            // Custom validation to ensure alt text is provided if the image is present. https://www.sanity.io/docs/validation
            return rule.custom((alt, context) => {
              if ((context.document?.picture as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
      ],
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
    }),
  ],
  // List preview configuration. https://www.sanity.io/docs/previews-list-views
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      role: 'role',
      picture: 'picture',
    },
    prepare(selection) {
      return {
        title: `${selection.firstName} ${selection.lastName}`,
        subtitle: selection.role || 'Person',
        media: selection.picture,
      }
    },
  },
})
