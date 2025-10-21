'use client'

import {useState, useEffect} from 'react'

type BonusCalculatorData = {
  _type: 'bonusCalculator'
  _key?: string
  title?: string
  description?: string
  defaultDeposit?: number
  defaultBonus?: number
  defaultWagering?: number
}

type Props = {
  data: BonusCalculatorData
}

export function BonusCalculator({data}: Props) {
  const [deposit, setDeposit] = useState(data.defaultDeposit ?? 100)
  const [bonusPercentage, setBonusPercentage] = useState(data.defaultBonus ?? 100)
  const [wageringMultiplier, setWageringMultiplier] = useState(data.defaultWagering ?? 30)

  // Calculate values
  const bonusAmount = (deposit * bonusPercentage) / 100
  const totalBalance = deposit + bonusAmount
  const amountToWager = totalBalance * wageringMultiplier

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <section className="my-16">
      <div className="mx-auto max-w-3xl">
          {/* Title and Description */}
          {data.title && (
            <h2 className="text-3xl font-extrabold text-gray-900 font-mono mb-2">
              {data.title}
            </h2>
          )}
          {data.description && (
            <p className="text-gray-600 mb-8">{data.description}</p>
          )}

          {/* Calculator Card */}
          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 shadow-xl">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Deposit Amount */}
              <div>
                <label htmlFor="deposit" className="block text-sm font-bold text-white mb-2 font-mono">
                  Suma Depozitului
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-600">
                    RON
                  </span>
                  <input
                    type="number"
                    id="deposit"
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg bg-white/90 px-4 py-3 pl-16 pr-4 text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                  />
                </div>
              </div>

              {/* Bonus Percentage */}
              <div>
                <label htmlFor="bonus" className="block text-sm font-bold text-white mb-2 font-mono">
                  Procentul Bonusului
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="bonus"
                    value={bonusPercentage}
                    onChange={(e) => setBonusPercentage(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="1000"
                    step="1"
                    className="w-full rounded-lg bg-white/90 px-4 py-3 pr-12 text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-600">
                    %
                  </span>
                </div>
              </div>

              {/* Wagering Requirements */}
              <div>
                <label htmlFor="wagering" className="block text-sm font-bold text-white mb-2 font-mono">
                  Cerințe de Pariere (Multiplicator)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="wagering"
                    value={wageringMultiplier}
                    onChange={(e) => setWageringMultiplier(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                    className="w-full rounded-lg bg-white/90 px-4 py-3 pr-12 text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-600">
                    x
                  </span>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="mt-8 space-y-3">
              {/* Bonus Amount */}
              <div className="flex items-center justify-between rounded-lg bg-white/20 px-5 py-4 backdrop-blur-sm">
                <span className="text-sm font-bold text-white font-mono">
                  Suma Bonusului:
                </span>
                <span className="text-lg font-extrabold text-yellow-300 font-mono">
                  {formatCurrency(bonusAmount)} RON
                </span>
              </div>

              {/* Total Balance */}
              <div className="flex items-center justify-between rounded-lg bg-white/20 px-5 py-4 backdrop-blur-sm">
                <span className="text-sm font-bold text-white font-mono">
                  Sold Total:
                </span>
                <span className="text-lg font-extrabold text-white font-mono">
                  {formatCurrency(totalBalance)} RON
                </span>
              </div>

              {/* Amount to Wager */}
              <div className="flex items-center justify-between rounded-lg bg-white/20 px-5 py-4 backdrop-blur-sm">
                <span className="text-sm font-bold text-white font-mono">
                  Suma de Pariat:
                </span>
                <span className="text-lg font-extrabold text-yellow-300 font-mono">
                  {formatCurrency(amountToWager)} RON
                </span>
              </div>
            </div>
          </div>
        </div>
    </section>
  )
}
