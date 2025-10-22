import React from 'react'
import Image from 'next/image'
import {PortableText, type PortableTextBlock, type PortableTextComponents} from 'next-sanity'
import {urlForImage} from '@/sanity/lib/utils'
import {getIconComponent} from '@/lib/iconMapper'

type AboutUsItem = {
  _key: string
  iconName?: string
  customIcon?: {
    asset?: {
      url?: string
      metadata?: {
        lqip?: string
        dimensions?: {
          width?: number
          height?: number
        }
      }
    }
    alt?: string
  }
  title: string
  content: PortableTextBlock[]
  colorTheme: 'orange' | 'blue' | 'green' | 'purple' | 'teal'
}

export type AboutUsBlock = {
  _type: 'aboutUs'
  _key: string
  heading?: string
  description?: string
  items?: AboutUsItem[]
}

type AboutUsProps = {
  data: AboutUsBlock
  index: number
}

// Color theme configurations
const colorThemes = {
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    border: 'border-orange-200 hover:border-orange-300',
    bgHover: 'from-orange-50/40 to-orange-100/20',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-200 hover:border-blue-300',
    bgHover: 'from-blue-50/40 to-blue-100/20',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    border: 'border-green-200 hover:border-green-300',
    bgHover: 'from-green-50/40 to-green-100/20',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    border: 'border-purple-200 hover:border-purple-300',
    bgHover: 'from-purple-50/40 to-purple-100/20',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    border: 'border-teal-200 hover:border-teal-300',
    bgHover: 'from-teal-50/40 to-teal-100/20',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
}

// Custom Portable Text components for card content
const cardTextComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => (
      <p className="text-base leading-relaxed text-gray-700 mb-4 last:mb-0">
        {children}
      </p>
    ),
    h3: ({children}) => (
      <h3 className="text-lg font-bold text-gray-900 mb-3 mt-4 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({children}) => (
      <h4 className="text-base font-semibold text-gray-800 mb-2 mt-3 first:mt-0">
        {children}
      </h4>
    ),
  },
  list: {
    bullet: ({children}) => (
      <ul className="text-base text-gray-700 space-y-2 mb-4 list-disc pl-6">
        {children}
      </ul>
    ),
    number: ({children}) => (
      <ol className="text-base text-gray-700 space-y-2 mb-4 list-decimal pl-6">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({children}) => <li className="leading-relaxed">{children}</li>,
    number: ({children}) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    link: ({value, children}) => {
      const target = value?.openInNewTab ? '_blank' : undefined
      const rel = value?.openInNewTab ? 'noopener noreferrer' : undefined
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="text-orange-600 hover:text-orange-700 underline"
        >
          {children}
        </a>
      )
    },
  },
}

export function AboutUs({data, index}: AboutUsProps) {
  if (!data.items || data.items.length === 0) {
    return null
  }

  return (
    <section
      className="my-12 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/30 via-white to-white p-8 shadow-sm lg:p-12"
      aria-labelledby={`about-us-${index}`}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        {data.heading && (
          <h2
            id={`about-us-${index}`}
            className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-mono"
          >
            {data.heading}
          </h2>
        )}
        {data.description && (
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-700 sm:text-lg">
            {data.description}
          </p>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item, idx) => {
          const IconComponent = getIconComponent(item.iconName)

          const customIconUrl = item.customIcon
            ? urlForImage(item.customIcon)?.width(200).height(200).fit('max').url()
            : null

          // Clean colorTheme value to remove invisible Unicode characters
          const cleanColorTheme = item.colorTheme
            ?.replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E\u2060-\u206F]/g, '')
            .trim()
            .normalize('NFKC') || 'orange'

          const theme = colorThemes[cleanColorTheme as keyof typeof colorThemes] || colorThemes.orange

          return (
            <article
              key={item._key || `item-${idx}`}
              className={`group relative overflow-hidden rounded-xl border-2 ${theme.border} bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 flex flex-col`}
            >
              {/* Color-coded header bar */}
              <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />

              {/* Hover gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${theme.bgHover} opacity-0 transition-opacity group-hover:opacity-100`}
              />

              <div className="relative p-8 space-y-5 flex flex-col flex-1">
                {/* Icon */}
                <div className="flex items-center justify-center">
                  {IconComponent ? (
                    <div className={`flex h-20 w-20 items-center justify-center rounded-full ${theme.iconBg} sm:h-24 sm:w-24 transition-transform group-hover:scale-110`}>
                      <IconComponent className={`h-10 w-10 ${theme.iconColor} sm:h-12 sm:w-12`} strokeWidth={1.5} />
                    </div>
                  ) : customIconUrl ? (
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                      <Image
                        src={customIconUrl}
                        alt={item.customIcon?.alt || item.title || 'About us icon'}
                        fill
                        className="object-contain transition-transform group-hover:scale-110"
                        sizes="(max-width: 640px) 80px, 96px"
                        placeholder={item.customIcon?.asset?.metadata?.lqip ? 'blur' : undefined}
                        blurDataURL={item.customIcon?.asset?.metadata?.lqip}
                      />
                    </div>
                  ) : (
                    <div className={`flex h-20 w-20 items-center justify-center rounded-full ${theme.iconBg} sm:h-24 sm:w-24`}>
                      <svg
                        className={`h-10 w-10 ${theme.iconColor} sm:h-12 sm:w-12`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-center text-xl font-bold text-gray-900 font-mono leading-tight">
                  {item.title}
                </h3>

                {/* Rich Text Content */}
                <div className="flex-1 text-left">
                  <PortableText value={item.content} components={cardTextComponents} />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default AboutUs
