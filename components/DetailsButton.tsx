'use client'

export default function DetailsButton() {
  return (
    <button
      className="rounded-full px-4 py-3 font-bold text-sm bg-gradient-to-r from-pop-lime to-pop-yellow 
                 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
                 hover:from-pop-yellow hover:to-pop-lime"
      onClick={(e) => { e.preventDefault(); alert('🎉 More details coming soon! Stay tuned for amazing features! ✨🎪'); }}
    >
      ✨ Details
    </button>
  )
}