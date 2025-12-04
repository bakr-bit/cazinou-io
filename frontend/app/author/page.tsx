import type {Metadata} from 'next'
import AuthorCard from '@/app/components/AuthorCard'
import {sanityFetch} from '@/sanity/lib/live'
import {allAuthorsQuery} from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'Autori - Experți în Cazinouri Online | Cazinou.io',
  description: 'Echipa noastră de experți în cazinouri online. Cunosc specialiștii care vă oferă recenzii și ghiduri despre cazinouri, sloturi și jocuri de noroc.',
  openGraph: {
    title: 'Autori - Experți în Cazinouri Online',
    description: 'Echipa noastră de experți în cazinouri online. Cunosc specialiștii care vă oferă recenzii și ghiduri despre cazinouri, sloturi și jocuri de noroc.',
  },
  alternates: {
    canonical: 'https://cazinou.io/author/',
  },
}

export default async function AuthorsPage() {
  const {data} = await sanityFetch({
    query: allAuthorsQuery,
    stega: false,
  })

  const authors = data as any[]

  if (!authors || authors.length === 0) {
    return (
      <div className="bg-white">
        <div className="container py-16">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 font-mono mb-4">Autori</h1>
            <p className="text-gray-600 font-mono">Nu există autori disponibili momentan.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
        <div className="container relative py-12 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand font-mono mb-4">
              Echipa Noastră
            </p>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono mb-6">
              Experți în <span className="text-orange-500">Cazinouri Online</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-mono">
              Cunoașteți specialiștii care vă oferă informații de încredere despre cazinouri online,
              sloturi, jocuri de noroc și strategii de câștig. Fiecare autor are ani de experiență în
              industrie și vă ghidează cu recenzii detaliate și sfaturi practice.
            </p>
          </div>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {authors.map((author) => (
            <AuthorCard key={author._id} author={author} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div className="font-mono">
              <div className="text-4xl font-bold text-brand mb-2">{authors.length}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Experți</div>
            </div>
            <div className="font-mono">
              <div className="text-4xl font-bold text-brand mb-2">
                {authors.reduce((sum, author) => sum + (author.yearsOfExperience || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Ani de Experiență Cumulată</div>
            </div>
            <div className="font-mono">
              <div className="text-4xl font-bold text-brand mb-2">
                {authors.reduce((sum, author) => sum + (author.expertise?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Domenii de Expertiză</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 rounded-lg border-l-4 border-brand bg-brand/10 p-6 font-mono">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            De ce ne poți avea încredere?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Fiecare autor din echipa noastră este un expert verificat în industria jocurilor de noroc.
            Aceștia testează personal cazinouri, jocuri și strategii pentru a vă oferi informații corecte
            și actualizate. Toate recenziile și ghidurile sunt scrise pe baza experienței reale și analizei
            amănunțite.
          </p>
        </div>
      </div>
    </div>
  )
}
