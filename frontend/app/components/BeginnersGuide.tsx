import React from 'react'
import Image from 'next/image'
import {urlForImage} from '@/sanity/lib/utils'
import {getIconComponent} from '@/lib/iconMapper'

type GuideTopic = {
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
  shortDescription: string
  detailedExplanation: string
  exampleValues?: string
  colorTheme: 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'teal'
}

export type BeginnersGuideBlock = {
  _type: 'beginnersGuide'
  _key: string
  heading?: string
  description?: string
  topics?: GuideTopic[]
}

type BeginnersGuideProps = {
  data: BeginnersGuideBlock
  index: number
}

// Color theme configurations
const colorThemes = {
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    border: 'border-orange-200 hover:border-orange-300',
    bgHover: 'from-orange-50/40 to-orange-100/20',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-200 hover:border-blue-300',
    bgHover: 'from-blue-50/40 to-blue-100/20',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    border: 'border-green-200 hover:border-green-300',
    bgHover: 'from-green-50/40 to-green-100/20',
    badge: 'bg-green-100 text-green-700 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    border: 'border-purple-200 hover:border-purple-300',
    bgHover: 'from-purple-50/40 to-purple-100/20',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    border: 'border-red-200 hover:border-red-300',
    bgHover: 'from-red-50/40 to-red-100/20',
    badge: 'bg-red-100 text-red-700 border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    border: 'border-teal-200 hover:border-teal-300',
    bgHover: 'from-teal-50/40 to-teal-100/20',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
}

export function BeginnersGuide({data, index}: BeginnersGuideProps) {
  if (!data.topics || data.topics.length === 0) {
    return null
  }

  return (
    <section
      className="my-12 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/30 via-white to-white p-8 shadow-sm lg:p-12"
      aria-labelledby={`beginners-guide-${index}`}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        {data.heading && (
          <h3
            id={`beginners-guide-${index}`}
            className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-mono"
          >
            {data.heading}
          </h3>
        )}
        {data.description && (
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-700">
            {data.description}
          </p>
        )}
      </div>

      {/* Topics Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {data.topics.map((topic, idx) => {
          // Debug logging
          console.log('Topic iconName RAW:', topic.iconName, 'Type:', typeof topic.iconName)
          console.log('Topic colorTheme:', topic.colorTheme)

          const IconComponent = getIconComponent(topic.iconName)
          console.log('IconComponent resolved:', IconComponent?.name || 'null')

          const customIconUrl = topic.customIcon
            ? urlForImage(topic.customIcon)?.width(200).height(200).fit('max').url()
            : null

          // Clean colorTheme value to remove invisible Unicode characters
          const cleanColorTheme = topic.colorTheme
            ?.replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E\u2060-\u206F]/g, '')
            .trim()
            .normalize('NFKC') || 'orange'

          const theme = colorThemes[cleanColorTheme as keyof typeof colorThemes] || colorThemes.orange
          console.log('Theme selected:', topic.colorTheme, 'cleaned to:', cleanColorTheme, 'resolved to:', theme)

          return (
            <article
              key={topic._key || `topic-${idx}`}
              className={`group relative overflow-hidden rounded-xl border-2 ${theme.border} bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 min-h-[420px] flex flex-col`}
            >
              {/* Color-coded header bar */}
              <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />

              {/* Hover gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${theme.bgHover} opacity-0 transition-opacity group-hover:opacity-100`}
              />

              <div className="relative p-10 space-y-6 flex flex-col flex-1">
                {/* Icon */}
                <div className="flex items-center justify-center">
                  {IconComponent ? (
                    <div className={`flex h-24 w-24 items-center justify-center rounded-full ${theme.iconBg} sm:h-28 sm:w-28 transition-transform group-hover:scale-110`}>
                      <IconComponent className={`h-12 w-12 ${theme.iconColor} sm:h-14 sm:w-14`} strokeWidth={1.5} />
                    </div>
                  ) : customIconUrl ? (
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                      <Image
                        src={customIconUrl}
                        alt={topic.customIcon?.alt || topic.title || 'Topic icon'}
                        fill
                        className="object-contain transition-transform group-hover:scale-110"
                        sizes="(max-width: 640px) 96px, 112px"
                        placeholder={topic.customIcon?.asset?.metadata?.lqip ? 'blur' : undefined}
                        blurDataURL={topic.customIcon?.asset?.metadata?.lqip}
                      />
                    </div>
                  ) : (
                    <div className={`flex h-24 w-24 items-center justify-center rounded-full ${theme.iconBg} sm:h-28 sm:w-28`}>
                      <svg
                        className={`h-12 w-12 ${theme.iconColor} sm:h-14 sm:w-14`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="text-center text-xl font-bold text-gray-900 font-mono leading-tight">
                  {topic.title}
                </div>

                {/* Example Values Badge */}
                {topic.exampleValues && (
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold ${theme.badge} font-mono`}
                    >
                      {topic.exampleValues}
                    </span>
                  </div>
                )}

                {/* Short Description */}
                <p className="text-center text-base font-medium text-gray-700 leading-relaxed">
                  {topic.shortDescription}
                </p>

                {/* Detailed Explanation */}
                <div className="pt-3 border-t border-gray-100 flex-1">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {topic.detailedExplanation}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default BeginnersGuide
