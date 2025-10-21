import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 relative">
      <div className="absolute inset-0 bg-[url(/images/tile-grid-black.png)] bg-size-[17px] opacity-20 bg-position-[0_1]" />
      <div className="container relative">
        <div className="flex flex-col items-center py-16 lg:py-20">
          <h3 className="mb-8 text-center text-4xl font-mono leading-tight tracking-tighter lg:text-2xl">
            cazinou.io 
          </h3>
          
          <nav className="mb-8">
            <ul className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-mono">
              <li>
                <Link href="/politica-de-confidentialitate" className="hover:underline">
                  Politica de Confidențialitate
                </Link>
              </li>
              <li className="before:content-['•'] before:mr-4 md:before:mr-6">
                <Link href="/politica-cookies" className="hover:underline">
                  Politica Cookies
                </Link>
              </li>
              <li className="before:content-['•'] before:mr-4 md:before:mr-6">
                <Link href="/termeni-si-conditii" className="hover:underline">
                  Termeni și Condiții
                </Link>
              </li>
              <li className="before:content-['•'] before:mr-4 md:before:mr-6">
                <Link href="/joc-responsabil" className="hover:underline">
                  Joc Responsabil
                </Link>
              </li>
            </ul>
          </nav>

          <div className="max-w-4xl space-y-4 text-center">
            <p className="text-base font-semibold text-gray-900 font-mono">
              18+ Joacă Responsabil
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-mono">
              Responsabilitatea privind respectarea condițiilor legate de vârstă și a tuturor celorlalte aspecte legale îți revine în întregime. Te rugăm să te asiguri că îndeplinești toate aceste condiții înainte de a te înregistra pe o platformă de jocuri de noroc.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-mono">
              Cazinou nu este responsabil pentru informații incorecte despre bonusuri, promoții sau oferte. Verifică mereu termenii și condițiile.
            </p>
            <p className="text-sm text-gray-600 font-mono">
              © {new Date().getFullYear()} All rights reserved | Echipa Cazinou
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
