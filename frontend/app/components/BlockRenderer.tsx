import React from 'react'

import Cta from '@/app/components/Cta'
import Info from '@/app/components/InfoSection'
import {Toplist} from '@/app/components/Toplist'
import FeaturedCasino from '@/app/components/FeaturedCasino'
import FeaturedGame from '@/app/components/FeaturedGame'
import SimpleButton from '@/app/components/SimpleButton'
import {dataAttr} from '@/sanity/lib/utils'

type BlocksType = {
  [key: string]: React.FC<any>
}

type BlockType = {
  _type: string
  _key: string
}

type BlockProps = {
  index: number
  block: BlockType
  pageId: string
  pageType: string
}

const Blocks: BlocksType = {
  callToAction: Cta,
  simpleButton: SimpleButton,
  infoSection: Info,
  topListObject: Toplist,
  featuredCasino: FeaturedCasino,
  featuredGame: FeaturedGame,
}

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({block, index, pageId, pageType}: BlockProps) {
  // Block does exist
  if (typeof Blocks[block._type] !== 'undefined') {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        {React.createElement(Blocks[block._type], {
          key: block._key,
          // Pass block as 'data' for topListObject, 'block' for others
          ...(block._type === 'topListObject' ? {data: block} : {block: block}),
          index: index,
        })}
      </div>
    )
  }
  // Block doesn't exist yet
  return React.createElement(
    () => (
      <div className="w-full bg-gray-100 text-center text-gray-500 p-20 rounded">
        A &ldquo;{block._type}&rdquo; block hasn&apos;t been created yet. Add it to your
        BlockRenderer.tsx file.
      </div>
    ),
    {key: block._key},
  )
}