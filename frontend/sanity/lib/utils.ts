import createImageUrlBuilder from '@sanity/image-url'
import {Link} from '@/sanity.types'
import {dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {createDataAttribute, CreateDataAttributeProps} from 'next-sanity'
import {getImageDimensions} from '@sanity/asset-utils'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: any) => {
  // Handle both expanded assets (with url/_id) and unexpanded assets (with _ref)
  const hasExpandedAsset = source?.asset?.url || source?.asset?._id
  const hasUnexpandedAsset = source?.asset?._ref

  if (!hasExpandedAsset && !hasUnexpandedAsset) {
    return undefined
  }

  const imageRef = source?.asset?._ref
  const crop = source.crop

  // Only process crop if we have a ref to extract dimensions from
  if (imageRef && Boolean(crop)) {
    try {
      // get the image's og dimensions
      const {width, height} = getImageDimensions(imageRef)

      // compute the cropped image's area
      const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)))

      const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)))

      // compute the cropped image's position
      const left = Math.floor(width * crop.left)
      const top = Math.floor(height * crop.top)

      // gather into a url
      return imageBuilder?.image(source).rect(left, top, croppedWidth, croppedHeight).auto('format')
    } catch (e) {
      // If dimension extraction fails, fall back to standard processing
      console.warn('Failed to extract image dimensions for crop, using uncropped image', e)
    }
  }

  // For expanded assets or unexpanded assets without crop, imageBuilder handles both
  return imageBuilder?.image(source).auto('format')
}

export function resolveOpenGraphImage(image: any, width = 1200, height = 627) {
  if (!image) return
  const url = urlForImage(image)?.width(1200).height(627).fit('crop').url()
  if (!url) return
  return {url, alt: image?.alt as string, width, height}
}

// Depending on the type of link, we need to fetch the corresponding page, post, or URL.  Otherwise return null.
export function linkResolver(link: Link | undefined) {
  if (!link) return null

  // If linkType is not set but href is, lets set linkType to "href".  This comes into play when pasting links into the portable text editor because a link type is not assumed.
  if (!link.linkType && link.href) {
    link.linkType = 'href'
  }

  // Cast to any to handle custom link types not in generated types
  const anyLink = link as any

  switch (anyLink.linkType) {
    case 'internal':
      return anyLink.internalPath || null
    case 'href':
      return link.href || null
    case 'page':
      if (link?.page && typeof link.page === 'string') {
        return `/${link.page}`
      }
      return null
    case 'post':
      if (link?.post && typeof link.post === 'string') {
        return `/posts/${link.post}`
      }
      return null
    case 'infoPage':
      if (anyLink?.infoPage && typeof anyLink.infoPage === 'string') {
        return `/${anyLink.infoPage}`
      }
      return null
    case 'casinoReview':
      if (anyLink?.casinoReview && typeof anyLink.casinoReview === 'string') {
        return `/casino/${anyLink.casinoReview}`
      }
      return null
    default:
      return null
  }
}

type DataAttributeConfig = CreateDataAttributeProps &
  Required<Pick<CreateDataAttributeProps, 'id' | 'type' | 'path'>>

export function dataAttr(config: DataAttributeConfig) {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).combine(config)
}
