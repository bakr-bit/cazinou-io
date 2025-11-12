import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: '404 - Pagina Nu Există',
  description: 'Pagina pe care o căutați nu a fost găsită.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-gray-200 tracking-tight font-mono">
            404
          </h1>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pagina Nu Există
          </h2>
          <p className="text-lg text-gray-600">
            Ne pare rău, dar pagina pe care o căutați nu a fost găsită.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-mono"
          >
            Acasă
          </Link>
          <Link
            href="/recenzii"
            className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-mono"
          >
            Recenzii Cazinouri
          </Link>
        </div>

        {/* Additional Help Text */}
        <div className="text-sm text-gray-500">
          <p>
            Dacă credeți că aceasta este o eroare, vă rugăm să ne contactați.
          </p>
        </div>
      </div>
    </div>
  )
}
