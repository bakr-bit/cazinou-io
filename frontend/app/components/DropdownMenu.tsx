'use client'

import Link from 'next/link'
import { useRef, useEffect } from 'react'
import { NavigationCategory } from '@/lib/navigation'
import { ChevronDown } from 'lucide-react'

interface DropdownMenuProps {
  category: NavigationCategory
  index: number
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export default function DropdownMenu({ category, index, isOpen, onOpenChange }: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const openTimeoutRef = useRef<NodeJS.Timeout>()
  const closeTimeoutRef = useRef<NodeJS.Timeout>()

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onOpenChange])

  // Handle keyboard navigation
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onOpenChange])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    // Add delay before opening to prevent clutter when sweeping cursor
    openTimeoutRef.current = setTimeout(() => {
      onOpenChange(true)
    }, 200)
  }

  const handleMouseLeave = () => {
    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
    }

    // Delay closing for smooth UX
    closeTimeoutRef.current = setTimeout(() => {
      onOpenChange(false)
    }, 150)
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center gap-0.5 px-2 py-2 text-xs font-medium text-gray-700 hover:text-orange-500 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {category.label}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Invisible bridge to prevent gap hover issues */}
          <div className="absolute top-full left-0 right-0 h-2" />

          <div
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              animation: 'fadeIn 150ms ease-out'
            }}
          >
            {category.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150"
                onClick={() => onOpenChange(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
