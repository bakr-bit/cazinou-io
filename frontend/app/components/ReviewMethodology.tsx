import React from 'react'
import Image from 'next/image'
import {PortableText, type PortableTextBlock, type PortableTextComponents} from 'next-sanity'
import {urlForImage} from '@/sanity/lib/utils'
import {getIconComponent} from '@/lib/iconMapper'

type Criterion = {
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
  description: PortableTextBlock[] | string
}

export type ReviewMethodologyBlock = {
  _type: 'reviewMethodology'
  _key: string
  heading?: string
  description?: string
  criteria?: Criterion[]
}

type ReviewMethodologyProps = {
  data: ReviewMethodologyBlock
  index: number
}

// Custom Portable Text components for card descriptions
const cardTextComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => (
      <p className="text-center text-sm leading-relaxed text-gray-600 mb-3 last:mb-0">
        {children}
      </p>
    ),
    h3: ({children}) => (
      <h3 className="text-center text-base font-semibold text-gray-800 mb-2">
        {children}
      </h3>
    ),
    h4: ({children}) => (
      <h4 className="text-center text-sm font-semibold text-gray-800 mb-2">
        {children}
      </h4>
    ),
  },
  list: {
    bullet: ({children}) => (
      <ul className="text-left text-sm text-gray-600 space-y-1 mb-3 list-disc pl-5">
        {children}
      </ul>
    ),
    number: ({children}) => (
      <ol className="text-left text-sm text-gray-600 space-y-1 mb-3 list-decimal pl-5">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({children}) => <li className="leading-relaxed">{children}</li>,
    number: ({children}) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
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

export function ReviewMethodology({data, index}: ReviewMethodologyProps) {
  if (!data.criteria || data.criteria.length === 0) {
    return null
  }

  return (
    <section
      className="my-12 rounded-2xl border border-gray-100 bg-gradient-to-br from-orange-50/30 via-white to-white p-8 shadow-sm lg:p-12"
      aria-labelledby={`review-methodology-${index}`}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        {data.heading && (
          <h2
            id={`review-methodology-${index}`}
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

      {/* Criteria Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.criteria.map((criterion, idx) => {
          const IconComponent = getIconComponent(criterion.iconName)

          const customIconUrl = criterion.customIcon
            ? urlForImage(criterion.customIcon)?.width(200).height(200).fit('max').url()
            : null

          return (
            <div
              key={criterion._key || `criterion-${idx}`}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-orange-200 hover:-translate-y-1 min-h-[280px] flex flex-col"
            >
              {/* Decorative gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/0 opacity-0 transition-opacity group-hover:from-orange-50/50 group-hover:to-orange-100/30 group-hover:opacity-100" />

              <div className="relative space-y-6 flex flex-col flex-1">
                {/* Icon */}
                <div className="flex items-center justify-center">
                  {IconComponent ? (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 sm:h-24 sm:w-24 transition-transform group-hover:scale-110">
                      <IconComponent className="h-10 w-10 text-orange-600 sm:h-12 sm:w-12" strokeWidth={1.5} />
                    </div>
                  ) : customIconUrl ? (
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                      <Image
                        src={customIconUrl}
                        alt={criterion.customIcon?.alt || criterion.title || 'Criterion icon'}
                        fill
                        className="object-contain transition-transform group-hover:scale-110"
                        sizes="(max-width: 640px) 80px, 96px"
                        placeholder={
                          criterion.customIcon?.asset?.metadata?.lqip ? 'blur' : undefined
                        }
                        blurDataURL={criterion.customIcon?.asset?.metadata?.lqip}
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 sm:h-24 sm:w-24">
                      <svg
                        className="h-10 w-10 text-orange-600 sm:h-12 sm:w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="text-center text-xl font-bold text-gray-900 font-mono leading-tight">
                  {criterion.title}
                </div>

                {/* Description - Rich Text or Plain Text */}
                <div className="flex-1">
                  {Array.isArray(criterion.description) ? (
                    <PortableText value={criterion.description} components={cardTextComponents} />
                  ) : criterion.description ? (
                    <p className="text-center text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                      {criterion.description}
                    </p>
                  ) : (
                    <p className="text-center text-sm text-gray-400 italic">No description provided</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ReviewMethodology
