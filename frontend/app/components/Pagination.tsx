'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'

type PaginationProps = {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl = '/slots',
}: PaginationProps) {
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  const maxVisible = 7 // Show max 7 page numbers

  if (totalPages <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold font-mono hover:bg-gray-50 transition"
        >
          ← Anterior
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold font-mono text-gray-400 cursor-not-allowed">
          ← Anterior
        </span>
      )}

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <Link
              key={pageNumber}
              href={createPageUrl(pageNumber)}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold font-mono transition ${
                isActive
                  ? 'bg-brand text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </Link>
          )
        })}
      </div>

      {/* Mobile: Just show current page */}
      <div className="sm:hidden flex items-center gap-2">
        <span className="text-sm font-mono text-gray-600">
          Pagina {currentPage} din {totalPages}
        </span>
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold font-mono hover:bg-gray-50 transition"
        >
          Următorul →
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold font-mono text-gray-400 cursor-not-allowed">
          Următorul →
        </span>
      )}
    </nav>
  )
}
