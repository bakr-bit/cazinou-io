import Link from 'next/link'
import Image from 'next/image'
import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {navigationData} from '@/lib/navigation'
import DesktopNavigation from './DesktopNavigation'
import MobileMenu from './MobileMenu'

export default async function Header() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <header className="fixed z-40 h-24 top-0 left-0 right-0 w-full bg-white/80 flex items-center backdrop-blur-lg border-b border-gray-200">
      <div className="container py-6 px-2 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          {/* Logo */}
          <Link className="flex items-center gap-2 pl-2" href="/">
            <Image
              src="/images/cazinou-logo.png"
              alt="cazinou.io"
              width={150}
              height={40}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </Link>

          {/* Desktop Navigation - Centered */}
          <DesktopNavigation />

          {/* Mobile Menu Toggle */}
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
