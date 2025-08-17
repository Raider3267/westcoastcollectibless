'use client'

import { useState } from 'react'

export interface FilterOptions {
  series: string[]
  priceRange: { min: number; max: number }
  sortBy: 'date' | 'price_low' | 'price_high' | 'name' | 'rarity'
  rarity: string[]
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void
  totalItems: number
}

const SERIES_OPTIONS = [
  'POP MART',
  'Labubu',
  'Skullpanda',
  'Crybaby',
  'MOLLY',
  'DIMOO',
  'Blind Box',
  'Limited Edition'
]

const RARITY_OPTIONS = [
  'Common',
  'Rare',
  'Super Rare',
  'Secret',
  'Chase',
  'Limited Edition'
]

export default function FilterBar({ onFiltersChange, totalItems }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    series: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: 'date',
    rarity: []
  })

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const toggleSeries = (series: string) => {
    const newSeries = filters.series.includes(series)
      ? filters.series.filter(s => s !== series)
      : [...filters.series, series]
    updateFilters({ series: newSeries })
  }

  const toggleRarity = (rarity: string) => {
    const newRarity = filters.rarity.includes(rarity)
      ? filters.rarity.filter(r => r !== rarity)
      : [...filters.rarity, rarity]
    updateFilters({ rarity: newRarity })
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      series: [],
      priceRange: { min: 0, max: 1000 },
      sortBy: 'date',
      rarity: []
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const activeFilterCount = filters.series.length + filters.rarity.length + 
    (filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0)

  return (
    <div className="luxury-card accent-teal" style={{ 
      padding: '20px', 
      marginBottom: '24px',
      background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box',
      border: '2px solid transparent'
    }}>
      {/* Filter Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '20px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            🔍 Filter & Sort
          </h3>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {totalItems} items found
          </div>
          {activeFilterCount > 0 && (
            <div style={{
              padding: '4px 8px',
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))',
              color: 'white',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              {activeFilterCount} active
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value as FilterOptions['sortBy'] })}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="date">Latest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
            <option value="rarity">Rarity</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ff6b6b',
                background: '#fff',
                color: '#ff6b6b',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear All
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: isExpanded ? 'var(--accent-teal)' : '#fff',
              color: isExpanded ? 'white' : 'var(--ink)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            {isExpanded ? '▲ Less Filters' : '▼ More Filters'}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {/* Series Filter */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
              Series
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SERIES_OPTIONS.map(series => (
                <button
                  key={series}
                  onClick={() => toggleSeries(series)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid var(--line)',
                    background: filters.series.includes(series) 
                      ? 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))' 
                      : '#fff',
                    color: filters.series.includes(series) ? 'white' : 'var(--ink)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {series}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
              Price Range
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min || ''}
                onChange={(e) => updateFilters({ 
                  priceRange: { ...filters.priceRange, min: parseInt(e.target.value) || 0 }
                })}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  fontSize: '0.9rem',
                  width: '80px'
                }}
              />
              <span style={{ color: 'var(--muted)' }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max || ''}
                onChange={(e) => updateFilters({ 
                  priceRange: { ...filters.priceRange, max: parseInt(e.target.value) || 1000 }
                })}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  fontSize: '0.9rem',
                  width: '80px'
                }}
              />
            </div>
          </div>

          {/* Rarity Filter */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
              Rarity
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {RARITY_OPTIONS.map(rarity => (
                <button
                  key={rarity}
                  onClick={() => toggleRarity(rarity)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid var(--line)',
                    background: filters.rarity.includes(rarity) 
                      ? 'linear-gradient(135deg, #ff6b6b, #feca57)' 
                      : '#fff',
                    color: filters.rarity.includes(rarity) ? 'white' : 'var(--ink)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}