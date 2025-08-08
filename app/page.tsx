import { SITE, PRODUCTS } from '../lib/products'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <section className="rounded-3xl border bg-white p-8">
        <h1 className="text-3xl md:text-4xl font-semibold">{SITE.brand}</h1>
        <p className="mt-2 text-gray-600">
          {SITE.hero?.sub || 'Authentic collectibles, designer toys, and custom 3D-printed accessories.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center rounded-2xl bg-gray-100 px-3 py-1">Fast shipping</span>
          <span className="inline-flex items-center rounded-2xl bg-gray-100 px-3 py-1">Collector-first</span>
          <span className="inline-flex items-center rounded-2xl bg-gray-100 px-3 py-1">Small-batch</span>
        </div>
      </section>

      {/* Product grid */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Featured</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => {
            const hasStripe = Boolean(p.variations?.[0]?.paymentLink && p.variations[0].paymentLink!.trim() !== '')
            const fallbackEbay =
              SITE.socials?.ebay ||
              'https://www.ebay.com/usr/westcoastcollectibless' // your eBay profile
            const buyURL = hasStripe ? p.variations![0]!.paymentLink! : fallbackEbay

            return (
              <div key={p.id} className="border rounded-3xl overflow-hidden bg-white hover:shadow-md transition">
                <div className="aspect-square bg-gray-50 grid place-items-center text-gray-400 text-sm">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    'Add product image'
                  )}
                </div>
                <div className="p-5">
                  <div className="text-sm text-gray-500">{p.category}</div>
                  <h3 className="text-lg font-medium mt-1">{p.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                  <div className="mt-3 font-semibold">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(p.price)}
                  </div>
                  <div className="mt-4">
                    <a
                      href={buyURL}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center rounded-2xl px-4 py-2 text-sm ${
                        hasStripe ? 'bg-black text-white' : 'border'
                      }`}
                    >
                      {hasStripe ? 'Buy Now' : 'Buy on eBay'}
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Trust + Contact */}
      <section className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border bg-white p-5">
          <div className="font-semibold">Shipping</div>
          <p className="text-sm text-gray-600 mt-1">{SITE.policies.shipping}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="font-semibold">Returns</div>
          <p className="text-sm text-gray-600 mt-1">{SITE.policies.returns}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="font-semibold">Support</div>
          <p className="text-sm text-gray-600 mt-1">
            Questions? Email{' '}
            <a className="underline" href="mailto:support@westcoastcollectibless.com">
              support@westcoastcollectibless.com
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
