'use client'

import { formatDrop } from '../lib/format-drop'

export interface ProductChipProps {
  sale_state?: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
  release_at?: string | null
  quantity?: number
  className?: string
}

export default function ProductChip({ 
  sale_state, 
  release_at, 
  quantity = 0,
  className = ''
}: ProductChipProps) {
  // Determine chip content and styling based on product state
  const getChipData = () => {
    // PREVIEW + release_at → purple chip: "Drops {date}"
    if (sale_state === 'PREVIEW' && release_at) {
      const formattedDate = formatDrop(release_at)
      if (formattedDate) {
        return {
          text: `Drops ${formattedDate}`,
          style: 'bg-purple-100 text-purple-800 border-purple-200'
        }
      }
      // If date formatting fails, don't show a chip
      return null
    }
    
    // PREVIEW no date → light purple chip: "Coming Soon"
    if (sale_state === 'PREVIEW') {
      return {
        text: 'Coming Soon',
        style: 'bg-purple-100 text-purple-800 border-purple-200'
      }
    }
    
    // LIVE qty=0 → gray chip: "Sold Out"
    if (sale_state === 'LIVE' && quantity <= 0) {
      return {
        text: 'Sold Out',
        style: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
    
    // DRAFT → gray chip: "Draft"
    if (sale_state === 'DRAFT') {
      return {
        text: 'Draft',
        style: 'bg-gray-100 text-gray-600 border-gray-200'
      }
    }
    
    // ARCHIVED → gray chip: "Archived"
    if (sale_state === 'ARCHIVED') {
      return {
        text: 'Archived',
        style: 'bg-gray-100 text-gray-600 border-gray-200'
      }
    }
    
    // No chip for LIVE with stock
    return null
  }

  const chipData = getChipData()
  
  if (!chipData) return null

  return (
    <div className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${chipData.style}
      ${className}
    `}>
      {chipData.text}
    </div>
  )
}