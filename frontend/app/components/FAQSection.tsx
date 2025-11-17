'use client'

import {useState} from 'react'

type FAQItem = {
  question: string
  answer: string
}

export type FAQSectionData = {
  _type: 'faqSection'
  title?: string
  description?: string
  faqs?: FAQItem[]
}

type Props = {
  data?: FAQSectionData | null
}

function FAQItem({item, isOpen, onToggle}: {item: FAQItem; isOpen: boolean; onToggle: () => void}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left transition hover:text-orange-600"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900 font-mono pr-8">
          {item.question}
        </span>
        <svg
          className={`h-6 w-6 flex-shrink-0 text-orange-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-6 text-gray-700 leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  )
}

export function FAQSection({data}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  if (!data || !data.faqs || data.faqs.length === 0) return null

  return (
    <section className="my-16">
      <div className="mx-auto max-w-3xl">
          {data.title && (
            <h2 className="text-3xl font-extrabold text-gray-900 font-mono mb-2">
              {data.title}
            </h2>
          )}
          {data.description && (
            <p className="text-base text-gray-600 mb-8 sm:text-lg">{data.description}</p>
          )}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-8">
              {data.faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  item={faq}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </div>
          </div>
        </div>
    </section>
  )
}
