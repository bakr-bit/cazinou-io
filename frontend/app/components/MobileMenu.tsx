'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { navigationData } from '@/lib/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleCategory = (label: string) => {
    setOpenCategory(openCategory === label ? null : label)
  }

  const closeMenu = () => {
    setIsOpen(false)
    setOpenCategory(null)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-gray-700 hover:text-orange-500 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMenu}
          />

          {/* Menu Panel */}
          <div className="fixed top-24 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto lg:hidden">
            <nav className="container py-4 px-4">
              {navigationData.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border-b border-gray-200 last:border-0">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.label)}
                    className="flex items-center justify-between w-full py-4 text-left font-medium text-gray-900 hover:text-orange-500 transition-colors"
                  >
                    <span>{category.label}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        openCategory === category.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Category Items */}
                  {openCategory === category.label && (
                    <div className="pb-4 pl-4 space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          href={item.href}
                          className="block py-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                          onClick={closeMenu}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Telegram Button in Mobile Menu */}
              <div className="pt-6 pb-4">
                <a
                  className="flex gap-3 items-center justify-center bg-black hover:bg-gray-800 py-3 px-6 text-white rounded-full transition-colors duration-200"
                  href="https://t.me/cazinouromania"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                >
                  <span>Join Telegram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.01C14.25 17.06 13.81 16.62 13.25 16.24C12.37 15.65 11.87 15.27 11.02 14.7C10.03 14.04 10.67 13.66 11.24 13.09C11.39 12.94 13.95 10.62 14 10.41C14.0069 10.3801 14.006 10.3489 13.9973 10.3195C13.9886 10.2901 13.9724 10.2634 13.95 10.242C13.89 10.19 13.81 10.21 13.74 10.23C13.65 10.25 12.25 11.18 9.52 13.02C9.12 13.3 8.76 13.43 8.44 13.42C8.08 13.41 7.4 13.21 6.89 13.03C6.26 12.82 5.77 12.71 5.81 12.36C5.83 12.18 6.08 12 6.55 11.82C9.47 10.54 11.41 9.72 12.37 9.36C15.14 8.2 15.73 7.97 16.11 7.97C16.19 7.97 16.38 7.99 16.5 8.1C16.6 8.19 16.63 8.31 16.64 8.4C16.63 8.48 16.65 8.66 16.64 8.8Z"></path>
                  </svg>
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
