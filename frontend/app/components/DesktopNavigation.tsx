'use client'

import { useState } from 'react'
import { navigationData } from '@/lib/navigation'
import DropdownMenu from './DropdownMenu'

export default function DesktopNavigation() {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  return (
    <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
      {navigationData.map((category, index) => (
        <DropdownMenu
          key={index}
          category={category}
          index={index}
          isOpen={openDropdown === index}
          onOpenChange={(isOpen) => setOpenDropdown(isOpen ? index : null)}
        />
      ))}
    </nav>
  )
}
