import {PlayIcon} from '@sanity/icons'
import {defineType} from 'sanity'

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeId(url: string): string | null {
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

export const youtubeEmbed = defineType({
  name: 'youtubeEmbed',
  title: 'YouTube Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    {
      name: 'url',
      type: 'url',
      title: 'YouTube URL',
      description: 'Paste any YouTube video URL (watch, embed, or short URL)',
      validation: (Rule) =>
        Rule.required().custom((url) => {
          if (!url) return true
          const videoId = getYouTubeId(url as string)
          return videoId ? true : 'Please enter a valid YouTube URL'
        }),
    },
    {
      name: 'title',
      type: 'string',
      title: 'Video Title',
      description: 'Optional title for accessibility and SEO',
    },
  ],
  preview: {
    select: {
      url: 'url',
      title: 'title',
    },
    prepare({url, title}) {
      const videoId = url ? getYouTubeId(url) : null

      return {
        title: title || 'YouTube Video',
        subtitle: videoId ? `Video ID: ${videoId}` : 'No video ID',
        media: PlayIcon,
      }
    },
  },
})
