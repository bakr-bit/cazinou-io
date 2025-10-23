import Link from 'next/link'
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
    <header className="fixed z-50 h-24 top-0 left-0 right-0 w-full bg-white/80 flex items-center backdrop-blur-lg border-b border-gray-200">
      <div className="container py-6 px-2 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          {/* Logo */}
          <Link className="flex items-center gap-2" href="/">
            <span className="text-lg sm:text-2xl pl-2 font-bold text-gray-900">
              cazinou.io
            </span>
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
