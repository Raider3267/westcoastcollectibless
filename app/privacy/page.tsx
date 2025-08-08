// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="mt-3">
        We collect only the information needed to process your order (name, email, shipping address).
        Payments are processed by Stripe; we do not store card numbers.
      </p>
      <p className="mt-3">
        For privacy requests, email{' '}
        <a className="underline" href="mailto:support@westcoastcollectibless.com">
          support@westcoastcollectibless.com
        </a>
        .
      </p>
    </main>
  )
}
