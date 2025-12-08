import React from 'react'
import dynamic from 'next/dynamic'
import {type PortableTextBlock} from 'next-sanity'
import Image from 'next/image'

import CustomPortableText from '@/app/components/PortableText'
import {Toplist, type TopListBlock} from '@/app/components/Toplist'
import {FAQSection, type FAQSectionData} from '@/app/components/FAQSection'
import FeaturedCasino, {type FeaturedCasinoBlock} from '@/app/components/FeaturedCasino'
import FeaturedGame, {type FeaturedGameBlock} from '@/app/components/FeaturedGame'
import {FeaturedGamesGrid, type FeaturedGamesGridData} from '@/app/components/FeaturedGamesGrid'
import {type BonusCalculatorData} from '@/app/components/BonusCalculator'
import {AuthorIntro, type AuthorIntroData} from '@/app/components/AuthorIntro'

// Dynamic import for heavy interactive component to reduce initial bundle
const BonusCalculator = dynamic(
  () => import('@/app/components/BonusCalculator').then(mod => mod.BonusCalculator),
  {ssr: true, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />}
)
import {ReviewMethodology, type ReviewMethodologyBlock} from '@/app/components/ReviewMethodology'
import {BeginnersGuide, type BeginnersGuideBlock} from '@/app/components/BeginnersGuide'
import {AboutUs, type AboutUsBlock} from '@/app/components/AboutUs'
import Cta from '@/app/components/Cta'
import SimpleButton, {type SimpleButtonBlock} from '@/app/components/SimpleButton'
import {urlForImage} from '@/sanity/lib/utils'
import {type CallToAction} from '@/sanity.types'

type ContentItem = {
  _type: string
  _key: string
  [key: string]: any
}

type ContentSectionsProps = {
  content?: ContentItem[]
  author?: any
}

/**
 * ContentSections component renders mixed content from Sanity
 * including text blocks, images, and custom components like toplists and FAQs
 */
export function ContentSections({content, author}: ContentSectionsProps) {
  if (!content || content.length === 0) {
    return null
  }

  // Group consecutive text blocks and authorComment together for PortableText rendering
  const groupedContent: Array<ContentItem | PortableTextBlock[]> = []
  let currentTextGroup: PortableTextBlock[] = []

  content.forEach((item, index) => {
    const isTextBlock = item._type === 'block' || item._type === 'authorComment'

    if (isTextBlock) {
      currentTextGroup.push(item as PortableTextBlock)
    } else {
      // If we have accumulated text blocks, add them as a group
      if (currentTextGroup.length > 0) {
        groupedContent.push([...currentTextGroup])
        currentTextGroup = []
      }
      // Add the non-text item
      groupedContent.push(item)
    }

    // On last item, flush any remaining text blocks
    if (index === content.length - 1 && currentTextGroup.length > 0) {
      groupedContent.push([...currentTextGroup])
    }
  })

  return (
    <div className="space-y-12">
      {groupedContent.map((item, index) => {
        // Handle grouped text blocks (PortableText)
        if (Array.isArray(item)) {
          return (
            <div key={`text-${index}`} className="container">
              <article className="prose sm:prose-lg max-w-none">
                <CustomPortableText value={item} author={author} />
              </article>
            </div>
          )
        }

        // Handle custom components
        const componentItem = item as ContentItem

        switch (componentItem._type) {
          case 'image':
          case 'linkableImage':
            return renderImage(componentItem, index)

          case 'youtubeEmbed':
            return renderYouTubeEmbed(componentItem, index)

          case 'topListObject':
            return (
              <div key={componentItem._key || `toplist-${index}`} className="container">
                <Toplist data={componentItem as TopListBlock} />
              </div>
            )

          case 'faqSection':
            return (
              <div key={componentItem._key || `faq-${index}`} className="container">
                <FAQSection data={componentItem as FAQSectionData} />
              </div>
            )

          case 'featuredCasino':
            return (
              <div key={componentItem._key || `featured-casino-${index}`} className="container">
                <FeaturedCasino block={componentItem as FeaturedCasinoBlock} index={index} />
              </div>
            )

          case 'featuredGame':
            return (
              <div key={componentItem._key || `featured-game-${index}`} className="container">
                <FeaturedGame block={componentItem as FeaturedGameBlock} index={index} />
              </div>
            )

          case 'featuredGamesGrid':
            return (
              <div key={componentItem._key || `games-grid-${index}`} className="container">
                <FeaturedGamesGrid data={componentItem as FeaturedGamesGridData} />
              </div>
            )

          case 'callToAction':
            return (
              <div key={componentItem._key || `cta-${index}`} className="container">
                <Cta block={componentItem as unknown as CallToAction} index={index} />
              </div>
            )

          case 'simpleButton':
            return (
              <div key={componentItem._key || `simple-button-${index}`} className="container">
                <SimpleButton block={componentItem as unknown as SimpleButtonBlock} index={index} />
              </div>
            )

          case 'bonusCalculator':
            return (
              <div key={componentItem._key || `bonus-calc-${index}`} className="container">
                <BonusCalculator data={componentItem as BonusCalculatorData} />
              </div>
            )

          case 'authorIntroSection':
            return (
              <div key={componentItem._key || `author-intro-${index}`} className="container">
                <AuthorIntro data={componentItem as AuthorIntroData} index={index} />
              </div>
            )

          case 'reviewMethodology':
            return (
              <div key={componentItem._key || `review-methodology-${index}`} className="container">
                <ReviewMethodology data={componentItem as ReviewMethodologyBlock} index={index} />
              </div>
            )

          case 'beginnersGuide':
            return (
              <div key={componentItem._key || `beginners-guide-${index}`} className="container">
                <BeginnersGuide data={componentItem as BeginnersGuideBlock} index={index} />
              </div>
            )

          case 'aboutUs':
            return (
              <div key={componentItem._key || `about-us-${index}`} className="container">
                <AboutUs data={componentItem as AboutUsBlock} index={index} />
              </div>
            )

          default:
            // Unknown component type
            return (
              <div
                key={componentItem._key || `unknown-${index}`}
                className="container my-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center"
              >
                <p className="text-gray-500">
                  Unknown component type: <code className="text-sm">{componentItem._type}</code>
                </p>
              </div>
            )
        }
      })}
    </div>
  )
}

/**
 * Render an image block
 */
function renderImage(imageBlock: ContentItem, index: number) {
  const imageUrl = imageBlock.asset?.url || urlForImage(imageBlock)?.url()

  if (!imageUrl) {
    return null
  }

  const imageElement = (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt={imageBlock.alt || 'Image'}
        fill
        loading="lazy"
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 896px"
      />
    </div>
  )

  return (
    <div key={imageBlock._key || `image-${index}`} className="container my-8">
      <div className="max-w-3xl mx-auto">
        <figure className="space-y-3">
          {imageBlock.link?.url ? (
            <a
              href={imageBlock.link.url}
              target={imageBlock.link.blank ? '_blank' : undefined}
              rel={imageBlock.link.blank ? 'noopener noreferrer' : undefined}
              className="block hover:opacity-90 transition-opacity"
            >
              {imageElement}
            </a>
          ) : (
            imageElement
          )}
          {imageBlock.caption && (
            <figcaption className="text-center text-sm italic text-gray-600">
              {imageBlock.caption}
            </figcaption>
          )}
        </figure>
      </div>
    </div>
  )
}

/**
 * Render a YouTube embed block
 */
function renderYouTubeEmbed(embedBlock: ContentItem, index: number) {
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const videoId = embedBlock.url ? getYouTubeId(embedBlock.url) : null
  if (!videoId) return null

  return (
    <div key={embedBlock._key || `youtube-${index}`} className="container my-8">
      <div className="max-w-3xl mx-auto">
        <figure className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={embedBlock.title || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
          {embedBlock.title && (
            <figcaption className="text-center text-sm italic text-gray-600">
              {embedBlock.title}
            </figcaption>
          )}
        </figure>
      </div>
    </div>
  )
}
