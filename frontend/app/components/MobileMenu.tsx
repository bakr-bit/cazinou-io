'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState, useEffect} from 'react'
import {navigationData} from '@/lib/navigation'
import {Menu, X, ChevronDown} from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/app/components/ui/sheet'

export default function MobileMenu() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  useEffect(() => {
    setIsOpen(false)
    setOpenCategory(null)
  }, [pathname])

  const toggleCategory = (label: string) => {
    setOpenCategory((current) => (current === label ? null : label))
  }

  const handleLinkClick = () => {
    setIsOpen(false)
    setOpenCategory(null)
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen)
        if (!nextOpen) {
          setOpenCategory(null)
        }
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          className="lg:hidden p-2 text-gray-700 transition-colors hover:text-orange-500"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="h-full w-full max-w-[85vw] p-0 sm:max-w-sm">
        <SheetHeader className="flex flex-row items-center justify-between border-b border-gray-200 px-5 py-4">
          <SheetTitle className="text-base font-semibold uppercase tracking-wide text-gray-900">
            Meniu
          </SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              className="rounded-full p-2 text-gray-600 transition-colors hover:text-orange-500"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetClose>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
          {navigationData.map((category, categoryIndex) => {
            const isCategoryOpen = openCategory === category.label
            const showCategoryLink =
              Boolean(category.href && category.href !== '#') &&
              !category.items.some((item) => item.href === category.href)

            return (
              <div key={categoryIndex} className="border-b border-gray-200 last:border-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.label)}
                  className="flex w-full items-center justify-between py-4 text-left font-medium text-gray-900 transition-colors hover:text-orange-500"
                  aria-expanded={isCategoryOpen}
                >
                  <span>{category.label}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isCategoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCategoryOpen && (
                  <div className="pb-4 pl-4">
                    <ul className="space-y-2">
                      {showCategoryLink && (
                        <li>
                          <SheetClose asChild>
                            <Link
                              href={category.href}
                              className="block py-2 text-sm font-semibold text-gray-700 transition-colors hover:text-orange-600"
                              onClick={handleLinkClick}
                            >
                              {category.label}
                            </Link>
                          </SheetClose>
                        </li>
                      )}
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <SheetClose asChild>
                            <Link
                              href={item.href}
                              className="block py-2 text-sm text-gray-600 transition-colors hover:text-orange-600"
                              onClick={handleLinkClick}
                            >
                              {item.label}
                            </Link>
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}

        </nav>
      </SheetContent>
    </Sheet>
  )
}
