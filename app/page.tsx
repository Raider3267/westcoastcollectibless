// app/page.tsx
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
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p) => {
            const stripeLink =
              p?.variations?.[0]?.paymentLink && p.variations[0].paymentLink.trim() !== ''
                ? p.variations[0].paymentLink
                : null
            const buyURL = stripeLink || 'https://www.ebay.com/usr/westcoastcollectibless'

            return (
              <article key={p.id} className="rounded-card border bg-white shadow-sm overflow-hidden transition hover:shadow-pop">
                {/* Image area: neutral background, centered placeholder */}
                <div className="aspect-square bg-gray-100 grid place-items-center">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">Add product image</span>
                  )}
                </div>

                {/* Content: simple, clean */}
                <div className="p-4">
                  <h3 className="text-base font-semibold leading-tight line-clamp-2">{p.name}</h3>
                  {p.description ? (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                  ) : null}
                  <div className="mt-2 text-base font-bold">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(p.price)}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <a
                      href={buyURL}
                      target="_blank"
                      rel="noreferrer"
                      className={stripeLink ? 'btn btn-primary' : 'btn btn-secondary'}
                    >
                      {stripeLink ? 'Buy Now' : 'Buy on eBay'}
                    </a>
                    <a
                      href="#"
                      className="btn btn-secondary"
                      onClick={(e: { preventDefault: () => void }) => { e.preventDefault(); alert('Details coming soon ✨'); }}
                    >
                      Details
                    </a>
                  </div>
                </div>
              </article>
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
