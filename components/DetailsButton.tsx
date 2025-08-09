'use client'

export default function DetailsButton() {
  return (
    <button
      className="btn btn-secondary"
      onClick={(e) => { e.preventDefault(); alert('Details coming soon ✨'); }}
    >
      Details
    </button>
  )
}