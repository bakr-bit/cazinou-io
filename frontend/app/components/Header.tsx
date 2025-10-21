import Link from 'next/link'
import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Header() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <header className="fixed z-50 h-24 inset-0 bg-white/80 flex items-center backdrop-blur-lg">
      <div className="container py-6 px-2 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          <Link className="flex items-center gap-2" href="/">
            <span className="text-lg sm:text-2xl pl-2 font-bold">
              cazinou.io
            </span>
          </Link>

          <nav>
            <ul
              role="list"
              className="flex items-center gap-4 md:gap-6 leading-5 text-xs sm:text-base tracking-tight font-mono"
            >
              <li>
                <Link href="/about" className="hover:underline">
                  About
                </Link>
              </li>
              
              <li className="sm:before:w-[1px] sm:before:bg-gray-200 before:block flex sm:gap-4 md:gap-6">
                <Link
                  className="rounded-full flex gap-4 items-center bg-black hover:bg-blue focus:bg-blue py-2 px-4 justify-center sm:py-3 sm:px-6 text-white transition-colors duration-200"
                  href="https://t.me/cazinouromania"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="whitespace-nowrap">Join Telegram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="hidden sm:block h-4 sm:h-6"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.01C14.25 17.06 13.81 16.62 13.25 16.24C12.37 15.65 11.87 15.27 11.02 14.7C10.03 14.04 10.67 13.66 11.24 13.09C11.39 12.94 13.95 10.62 14 10.41C14.0069 10.3801 14.006 10.3489 13.9973 10.3195C13.9886 10.2901 13.9724 10.2634 13.95 10.242C13.89 10.19 13.81 10.21 13.74 10.23C13.65 10.25 12.25 11.18 9.52 13.02C9.12 13.3 8.76 13.43 8.44 13.42C8.08 13.41 7.4 13.21 6.89 13.03C6.26 12.82 5.77 12.71 5.81 12.36C5.83 12.18 6.08 12 6.55 11.82C9.47 10.54 11.41 9.72 12.37 9.36C15.14 8.2 15.73 7.97 16.11 7.97C16.19 7.97 16.38 7.99 16.5 8.1C16.6 8.19 16.63 8.31 16.64 8.4C16.63 8.48 16.65 8.66 16.64 8.8Z"></path>
                  </svg>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
