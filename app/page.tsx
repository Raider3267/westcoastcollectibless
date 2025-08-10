export const runtime = 'nodejs'
// app/page.tsx
import { SITE } from '../lib/products'
import { getListingsFromCsv } from '../lib/listings'
import Confetti from '../components/Confetti'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  return (
    <div>
      <Confetti />
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <section className="rounded-3xl border bg-white p-8 relative overflow-hidden">
          {/* Fun background elements */}
          <div className="absolute top-4 right-4 text-4xl animate-float">🧸</div>
          <div className="absolute bottom-4 left-4 text-3xl animate-bounce">🎨</div>
          <div className="absolute top-1/2 right-1/4 text-2xl animate-pulse">✨</div>
          
          {/* Logo and colorful floating title */}
          <div className="flex flex-col items-center mb-2">
            <img 
              src="/Logo.png" 
              alt="WestCoast Collectibles Logo" 
              className="h-16 w-auto mb-4 animate-float"
            />
            <h1 className="text-4xl md:text-6xl font-bold animate-float">
              <span className="bg-gradient-to-r from-pop-pink via-pop-orange to-pop-purple bg-clip-text text-transparent animate-gradient-x bg-300%">
                🎪 WestCoast Collectibles 🎪
              </span>
            </h1>
          </div>
          <p className="mt-4 text-lg text-gray-700 font-medium">
            🌟 Your magical toy wonderland! Authentic collectibles, designer toys, and custom 3D-printed treasures! 🌟
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center rounded-2xl bg-gradient-to-r from-pop-pink to-pop-orange text-white px-4 py-2 font-semibold shadow-pop">
              🚀 Fast shipping
            </span>
            <span className="inline-flex items-center rounded-2xl bg-gradient-to-r from-pop-teal to-pop-blue text-white px-4 py-2 font-semibold shadow-pop">
              🎯 Collector-first
            </span>
            <span className="inline-flex items-center rounded-2xl bg-gradient-to-r from-pop-lime to-pop-yellow text-white px-4 py-2 font-semibold shadow-pop">
              💎 Small-batch
            </span>
          </div>
        </section>

        {/* Featured Listings */}
        <FeaturedFromCSV />

        {/* Trust + Contact */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-gradient-to-br from-pop-pink/10 to-pop-orange/10 p-5 hover:shadow-lg transition-shadow">
            <div className="font-semibold text-pop-purple flex items-center gap-2">
              🚀 Shipping
            </div>
            <p className="text-sm text-gray-600 mt-1">{SITE.policies.shipping}</p>
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-pop-teal/10 to-pop-blue/10 p-5 hover:shadow-lg transition-shadow">
            <div className="font-semibold text-pop-teal flex items-center gap-2">
              🔄 Returns
            </div>
            <p className="text-sm text-gray-600 mt-1">{SITE.policies.returns}</p>
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-pop-lime/10 to-pop-yellow/10 p-5 hover:shadow-lg transition-shadow">
            <div className="font-semibold text-pop-orange flex items-center gap-2">
              💬 Support
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Questions? Email{' '}
              <a className="underline text-pop-purple hover:text-pop-pink transition-colors" href="mailto:support@westcoastcollectibless.com">
                support@westcoastcollectibless.com
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

async function FeaturedFromCSV() {
  const items = await getListingsFromCsv()

  if (!items || items.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Featured</h2>
        <p className="mt-3 text-gray-700">No listings found in CSV.</p>
      </section>
    )
  }

  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20',
    'from-pop-orange/20 to-pop-teal/20',
    'from-pop-blue/20 to-pop-purple/20'
  ]

  return (
    <section className="mt-10">
      <h2 className="text-3xl font-bold text-center mb-8">
        <span className="bg-gradient-to-r from-pop-teal to-pop-purple bg-clip-text text-transparent">
          🎁 Featured Treasures 🎁
        </span>
      </h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((product, index) => {
          const cardColor = cardColors[index % cardColors.length]
          const toyEmojis = ['🧸', '🎨', '🎪', '🎭', '🎲', '🚀', '🌟', '💎', '🎯', '⭐']
          const randomEmoji = toyEmojis[index % toyEmojis.length]

          return (
            <ProductCard
              key={product.id}
              product={product}
              cardColor={cardColor}
              randomEmoji={randomEmoji}
            />
          )
        })}
      </div>
    </section>
  )
}
