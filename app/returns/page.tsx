// app/returns/page.tsx
export default function ReturnsPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Shipping & Returns</h1>
      <p className="mt-3">
        Orders ship within 2–3 business days via USPS with tracking from Santa Monica, California.
      </p>
      <p className="mt-3">
        Returns accepted within 30 days of delivery on unused items. Buyer pays return shipping unless the item is defective.
      </p>
      <p className="mt-3">
        Questions?{' '}
        <a className="underline" href="mailto:support@westcoastcollectibless.com">
          support@westcoastcollectibless.com
        </a>
      </p>
    </main>
  )
}
