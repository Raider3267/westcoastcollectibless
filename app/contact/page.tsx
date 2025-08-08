// app/contact/page.tsx
export default function ContactPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-3">
        Email:{' '}
        <a className="underline" href="mailto:support@westcoastcollectibless.com">
          support@westcoastcollectibless.com
        </a>
      </p>
      <p className="mt-3">Location: Santa Monica, California</p>
      <p className="mt-3">Hours: Mon–Fri, 9am–5pm PT</p>
    </main>
  )
}
