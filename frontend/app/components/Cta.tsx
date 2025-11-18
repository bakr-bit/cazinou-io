import {Suspense} from 'react'
import Image from 'next/image'

import ResolvedLink from '@/app/components/ResolvedLink'
import {CallToAction} from '@/sanity.types'
import {urlForImage} from '@/sanity/lib/utils'

type CtaProps = {
  block: CallToAction & {
    backgroundImage?: any
  }
  index: number
}

export default function CTA({block}: CtaProps) {
  if (!block) {
    return null
  }

  const backgroundImageUrl = block.backgroundImage
    ? urlForImage(block.backgroundImage)?.width(1920).height(600).fit('crop').url()
    : null

  return (
    <div className="my-12 flex justify-center">
      <div className="relative bg-gray-50 border border-gray-100 rounded-2xl max-w-5xl w-full overflow-hidden">
        {/* Background Image with Blur */}
        {backgroundImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={backgroundImageUrl}
              alt=""
              fill
              className="object-cover blur-sm"
              sizes="1920px"
            />
            <div className="absolute inset-0 bg-white/60" />
          </div>
        )}

        <div className="relative z-10 px-12 py-12 flex flex-col gap-6 items-center text-center">
          <div className="max-w-2xl flex flex-col gap-3">
            <h3 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              {block.heading || 'Call to Action'}
            </h3>
            {block.text && <p className="text-lg leading-8 text-gray-600">{block.text}</p>}
          </div>

          <Suspense fallback={null}>
            <div className="flex items-center justify-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
              <ResolvedLink
                link={block.link}
                className="rounded-full flex gap-2 items-center bg-black hover:bg-blue focus:bg-blue py-3 px-6 text-white transition-colors duration-200"
              >
                {block.buttonText}
              </ResolvedLink>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
