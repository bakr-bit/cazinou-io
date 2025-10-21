'use client'

import {useState} from 'react'
import type {Provider, GameType, Theme} from '@/lib/slotslaunch'

type GameFiltersProps = {
  providers: Provider[]
  types: GameType[]
  themes: Theme[]
  currentFilters: {
    search: string
    provider: string
    type: string
    theme: string
    sort: string
  }
  onFilterChange: (filters: {
    search?: string
    provider?: string
    type?: string
    theme?: string
    sort?: string
  }) => void
  onClearFilters: () => void
}

export function GameFilters({
  providers,
  types,
  themes,
  currentFilters,
  onFilterChange,
  onClearFilters,
}: GameFiltersProps) {
  const [localSearch, setLocalSearch] = useState(currentFilters.search)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({search: localSearch})
  }

  const hasActiveFilters =
    currentFilters.provider ||
    currentFilters.type ||
    currentFilters.theme ||
    currentFilters.search

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-gray-900 font-mono">Filtre</div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-brand hover:underline font-mono"
          >
            Resetează
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-semibold text-gray-700 mb-2 font-mono"
          >
            Caută
          </label>
          <input
            id="search"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Nume joc..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-mono"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold font-mono hover:bg-orange-600 transition-colors"
        >
          Caută jocuri
        </button>
      </form>

      {/* Provider Filter */}
      <div>
        <label
          htmlFor="provider"
          className="block text-sm font-semibold text-gray-700 mb-2 font-mono"
        >
          Provider
        </label>
        <select
          id="provider"
          value={currentFilters.provider}
          onChange={(e) => onFilterChange({provider: e.target.value})}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-mono"
        >
          <option value="">Toți providerii</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-semibold text-gray-700 mb-2 font-mono"
        >
          Tip
        </label>
        <select
          id="type"
          value={currentFilters.type}
          onChange={(e) => onFilterChange({type: e.target.value})}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-mono"
        >
          <option value="">Toate tipurile</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Theme Filter */}
      <div>
        <label
          htmlFor="theme"
          className="block text-sm font-semibold text-gray-700 mb-2 font-mono"
        >
          Temă
        </label>
        <select
          id="theme"
          value={currentFilters.theme}
          onChange={(e) => onFilterChange({theme: e.target.value})}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-mono"
        >
          <option value="">Toate temele</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label
          htmlFor="sort"
          className="block text-sm font-semibold text-gray-700 mb-2 font-mono"
        >
          Sortează
        </label>
        <select
          id="sort"
          value={currentFilters.sort}
          onChange={(e) => onFilterChange({sort: e.target.value})}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-mono"
        >
          <option value="name-asc">Nume A-Z</option>
          <option value="name-desc">Nume Z-A</option>
          <option value="updated_at-desc">Cele mai noi</option>
          <option value="updated_at-asc">Cele mai vechi</option>
        </select>
      </div>
    </div>
  )
}
