'use client'

export function DetailsButton() {
  return (
    <a
      href="#"
      className="btn btn-secondary"
      onClick={(e) => {
        e.preventDefault()
        alert('Details coming soon ✨')
      }}
    >
      Details
    </a>
  )
}

