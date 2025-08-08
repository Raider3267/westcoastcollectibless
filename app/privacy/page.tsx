export default function PrivacyPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Privacy Policy</h1>
      <p style={{ marginTop: 12 }}>
        We collect only the information needed to process your order (name, email, shipping address).
        Payments are processed by Stripe; we never store card numbers.
      </p>
      <p style={{ marginTop: 12 }}>
        For privacy requests, email <a href="mailto:support@westcoastcollectibless.com">support@westcoastcollectibless.com</a>.
      </p>
    </main>
  );
}
