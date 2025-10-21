'use client'

import {useState} from 'react'

type FAQItem = {
  question: string
  answer: string
}

type Props = {
  items: FAQItem[]
}

export default function ReviewFAQ({items}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!items || items.length === 0) return null

  return (
    <section className="faq-section font-mono">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Întrebări Frecvente</h2>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx

          return (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                <svg
                  className={`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="p-5 bg-white border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
