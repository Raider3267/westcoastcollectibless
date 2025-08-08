// app/page.tsx
import { SITE, PRODUCTS } from '@/lib/products'

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">{SITE.brand}</h1>
      <p className="text-gray-600 mt-2">
        Authentic collectibles, designer toys, and custom 3D-printed accessories. Orders ship from Santa Monica, CA.
      </p>

      <section className="mt-8 border rounded-2xl p-6 bg-white">
        <h2 className="text-xl font-semibold">Featured Product</h2>
        <div className="mt-4">
          <div className="font-medium">{PRODUCTS[0]?.name ?? 'Coming soon'}</div>
          <p className="text-sm text-gray-600 mt-1">{PRODUCTS[0]?.description ?? ''}</p>
          <div className="mt-3">
            {/* If you already have a Stripe Payment Link on the first product/variation, this will show a Buy Now link */}
            {PRODUCTS[0]?.variations?.[0]?.paymentLink ? (
              <a
                className="inline-flex items-center rounded-2xl bg-black text-white px-4 py-2 text-sm"
                href={PRODUCTS[0].variations[0].paymentLink}
                target="_blank"
              >
                Buy Now
              </a>
            ) : (
              <span className="inline-flex items-center rounded-2xl border px-4 py-2 text-sm">
                Buy Now link coming soon
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10 text-sm text-gray-600">
        <p>
          Need help? Email <a className="underline" href="mailto:support@westcoastcollectibless.com">
            support@westcoastcollectibless.com
          </a>
        </p>
      </section>
    </main>
  )
}
