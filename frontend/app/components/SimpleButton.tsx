import {Suspense} from 'react'
import ResolvedLink from '@/app/components/ResolvedLink'

export type SimpleButtonBlock = {
  _type: 'simpleButton'
  buttonText: string
  link?: unknown
  buttonStyle?: 'primary' | 'secondary'
  buttonSize?: 'default' | 'large'
}

type SimpleButtonProps = {
  block: SimpleButtonBlock
  index: number
}

export default function SimpleButton({block}: SimpleButtonProps) {
  if (!block?.buttonText || !block?.link) {
    return null
  }

  const isPrimary = block.buttonStyle !== 'secondary'
  const isLarge = block.buttonSize === 'large'

  const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold font-mono transition focus:outline-none focus:ring-2 focus:ring-offset-2'

  const styleClasses = isPrimary
    ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500'
    : 'border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-500'

  const sizeClasses = isLarge
    ? 'px-8 py-3.5 text-base sm:px-10 sm:py-4 sm:text-lg'
    : 'px-6 py-2.5 text-sm sm:px-7 sm:py-3 sm:text-base'

  return (
    <div className="my-8 flex justify-center">
      <Suspense fallback={null}>
        <ResolvedLink
          link={block.link}
          className={`${baseStyles} ${styleClasses} ${sizeClasses}`}
        >
          {block.buttonText}
        </ResolvedLink>
      </Suspense>
    </div>
  )
}
