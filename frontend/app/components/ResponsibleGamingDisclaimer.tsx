export function ResponsibleGamingDisclaimer() {
  return (
    <div className="container my-12">
      <div className="rounded-lg border-2 border-orange-400 bg-orange-50/50 p-6 lg:p-8 font-mono">
        <div className="flex gap-4">
          {/* 18+ Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl lg:text-2xl">
              18+
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">
              Joacă responsabil – Doar pentru persoane peste 18 ani
            </h3>

            <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
              Jocurile de noroc sunt destinate exclusiv persoanelor care au împlinit 18 ani. Scopul lor este distracția, nu câștigul sigur. Joacă mereu cu măsură și stabilește-ți din timp limitele de timp și bani.
            </p>

            <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
              Dacă simți că pierzi controlul sau jocul nu mai este o plăcere, cere ajutor. Poți apela gratuit la linia telefonică Joc Responsabil –{' '}
              <a href="tel:0800800099" className="font-semibold text-orange-600 hover:underline">
                0800 800 099
              </a>
              {' '}sau vizita{' '}
              <a
                href="https://www.jocresponsabil.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange-600 hover:underline"
              >
                www.jocresponsabil.ro
              </a>
              {' '}pentru consiliere și sprijin.
            </p>

            <p className="text-sm lg:text-base font-bold text-gray-900 pt-2">
              Joacă informat. Joacă responsabil.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
