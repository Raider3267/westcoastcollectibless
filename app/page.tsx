export const runtime = 'nodejs'
// app/page.tsx
import { SITE } from '../lib/products'
import { getListingsFromCsv } from '../lib/listings'
import DetailsButton from '../components/DetailsButton'
import Confetti from '../components/Confetti'

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
          
          {/* Colorful floating title */}
          <h1 className="text-4xl md:text-6xl font-bold animate-float mb-2">
            <span className="bg-gradient-to-r from-pop-pink via-pop-orange to-pop-purple bg-clip-text text-transparent animate-gradient-x bg-300%">
              🎪 WestCoast Collectibles 🎪
            </span>
          </h1>
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
        {items.map((p, index) => {
          const buyURL = p.stripeLink || p.ebayUrl || 'https://www.ebay.com/usr/westcoastcollectibless'
          const isStripe = Boolean(p.stripeLink)
          const cardColor = cardColors[index % cardColors.length]
          const toyEmojis = ['🧸', '🎨', '🎪', '🎭', '🎲', '🚀', '🌟', '💎', '🎯', '⭐']
          const randomEmoji = toyEmojis[index % toyEmojis.length]

          return (
            <article 
              key={p.id} 
              className={`group rounded-3xl border-2 bg-gradient-to-br ${cardColor} backdrop-blur-sm 
                         shadow-lg overflow-hidden transition-all duration-300 
                         hover:shadow-2xl hover:scale-105 hover:-rotate-1 
                         transform hover:border-pop-pink/50 relative`}
            >
              {/* Fun decorative elements */}
              <div className="absolute top-2 right-2 text-2xl group-hover:animate-spin">
                {randomEmoji}
              </div>
              
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-white/50 to-gray-100/50 grid place-items-center relative overflow-hidden">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">{randomEmoji}</div>
                    <span className="text-sm text-gray-500 font-medium">Surprise Inside!</span>
                  </div>
                )}
                {/* Sparkle effect overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                               bg-gradient-to-t from-transparent via-transparent to-white/20"></div>
              </div>

              {/* Content */}
              <div className="p-5 bg-white/90 backdrop-blur-sm">
                <h3 className="text-lg font-bold leading-tight line-clamp-2 text-gray-800 group-hover:text-pop-purple transition-colors">
                  {p.name}
                </h3>
                {p.description ? (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                ) : null}
                {typeof p.price === 'number' ? (
                  <div className="mt-3 text-xl font-extrabold text-pop-orange">
                    💰 {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(p.price)}
                  </div>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <a
                    href={buyURL}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 text-center rounded-full px-4 py-3 font-bold text-sm transition-all duration-300 transform hover:scale-105 
                               ${isStripe 
                                 ? 'bg-gradient-to-r from-pop-pink to-pop-orange text-white shadow-lg hover:shadow-xl' 
                                 : 'bg-gradient-to-r from-pop-teal to-pop-blue text-white shadow-lg hover:shadow-xl'}`}
                  >
                    {isStripe ? '🛒 Buy Now!' : '🏪 View on eBay'}
                  </a>
                  <DetailsButton />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
