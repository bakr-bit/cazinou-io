import {NumberIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Bonus Calculator object
 * Interactive calculator for casino bonus calculations
 */
export const bonusCalculator = defineType({
  name: 'bonusCalculator',
  title: 'Bonus Calculator',
  type: 'object',
  icon: NumberIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Calculator Title',
      type: 'string',
      description: 'Heading for the calculator section',
      initialValue: 'Calculator Bonus Casino',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional intro text above the calculator',
    }),
    defineField({
      name: 'defaultDeposit',
      title: 'Default Deposit Amount',
      type: 'number',
      description: 'Default value for deposit field (in RON)',
      initialValue: 100,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'defaultBonus',
      title: 'Default Bonus Percentage',
      type: 'number',
      description: 'Default value for bonus percentage field',
      initialValue: 100,
      validation: (Rule) => Rule.min(0).max(1000),
    }),
    defineField({
      name: 'defaultWagering',
      title: 'Default Wagering Multiplier',
      type: 'number',
      description: 'Default value for wagering requirements field',
      initialValue: 30,
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      deposit: 'defaultDeposit',
      bonus: 'defaultBonus',
    },
    prepare({title, deposit, bonus}) {
      return {
        title: title || 'Bonus Calculator',
        subtitle: `Default: ${deposit || 0} RON × ${bonus || 0}%`,
      }
    },
  },
})
