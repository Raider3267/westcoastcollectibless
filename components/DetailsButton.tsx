'use client'

interface DetailsButtonProps {
  onClick: () => void
}

export default function DetailsButton({ onClick }: DetailsButtonProps) {
  return (
    <button
      className="rounded-full px-4 py-3 font-bold text-sm bg-gradient-to-r from-pop-lime to-pop-yellow 
                 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
                 hover:from-pop-yellow hover:to-pop-lime"
      onClick={onClick}
    >
      ✨ Details
    </button>
  )
}