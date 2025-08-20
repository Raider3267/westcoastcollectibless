'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowSuccess(true)
        setFormData({ name: '', email: '', orderNumber: '', message: '' })
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        console.error('Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      {/* Success Toast */}
      {showSuccess && (
        <div className="contact-success-toast">
          <div className="success-content">
            <span className="success-icon">✨</span>
            <span>Thanks — we'll follow up shortly.</span>
          </div>
        </div>
      )}

      <main className="contact-main">
        <div className="contact-container">
          {/* Header */}
          <div className="contact-header">
            <div className="luxury-eyebrow">Get in Touch</div>
            <h1 className="contact-title">Collector Support</h1>
            <p className="contact-subtitle">
              Questions about your order or need help with your collection? Our team is here to help.
            </p>
          </div>

          <div className="contact-content">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="form-section-title">Send us a message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="orderNumber" className="form-label">Order Number (Optional)</label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., #12345"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                    placeholder="How can we help you?"
                    rows={5}
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  className="form-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="form-helper">We typically respond within 1–2 business days.</p>
              </form>
            </div>

            {/* Direct Contact Info */}
            <div className="contact-info-section">
              <h2 className="info-section-title">Other ways to reach us</h2>
              
              <div className="contact-info-card">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <h3 className="info-title">Email</h3>
                  <a 
                    href="mailto:support@westcoastcollectibless.com" 
                    className="info-link"
                  >
                    support@westcoastcollectibless.com
                  </a>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="info-icon">📍</div>
                <div className="info-content">
                  <h3 className="info-title">Location</h3>
                  <p className="info-text">Santa Monica, California</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="info-icon">🕒</div>
                <div className="info-content">
                  <h3 className="info-title">Hours</h3>
                  <p className="info-text">Mon–Fri, 9am–5pm PT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .contact-success-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }

        .success-content {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .success-icon {
          font-size: 1.2rem;
        }

        .contact-main {
          min-height: 100vh;
          background: linear-gradient(135deg, rgba(199,163,255,.03) 0%, rgba(94,208,192,.03) 50%, rgba(247,231,195,.03) 100%);
          padding: 80px 0 60px;
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .luxury-eyebrow {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--wcc-teal);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .contact-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          color: var(--wcc-ink);
          margin: 0 0 16px;
          background: linear-gradient(135deg, var(--wcc-ink) 0%, rgba(94,208,192,0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .contact-subtitle {
          font-size: 1.2rem;
          color: var(--wcc-muted);
          margin: 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 60px;
          align-items: start;
        }

        .contact-form-section {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .form-section-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--wcc-ink);
          margin: 0 0 30px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--wcc-ink);
        }

        .form-input,
        .form-textarea {
          padding: 14px 16px;
          border: 2px solid rgba(94, 208, 192, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--wcc-teal);
          box-shadow: 0 0 0 3px rgba(94, 208, 192, 0.1);
          background: white;
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-submit-button {
          padding: 16px 32px;
          background: linear-gradient(135deg, var(--wcc-teal), var(--wcc-grad-c));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(94, 208, 192, 0.3);
        }

        .form-submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(94, 208, 192, 0.4);
        }

        .form-submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .form-helper {
          font-size: 0.85rem;
          color: var(--wcc-muted);
          margin: 0;
          text-align: center;
        }

        .contact-info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-section-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--wcc-ink);
          margin: 0 0 20px;
        }

        .contact-info-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .contact-info-card:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .info-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(94,208,192,0.1), rgba(199,163,255,0.1));
          border-radius: 10px;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--wcc-ink);
          margin: 0 0 4px;
        }

        .info-link {
          color: var(--wcc-teal);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .info-link:hover {
          color: var(--wcc-grad-c);
          text-decoration: underline;
        }

        .info-text {
          color: var(--wcc-muted);
          margin: 0;
          font-size: 0.95rem;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Tablet Styles */
        @media (max-width: 1024px) {
          .contact-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .contact-info-section {
            order: -1;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }

          .info-section-title {
            grid-column: 1 / -1;
            margin-bottom: 0;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .contact-main {
            padding: 60px 0 40px;
          }

          .contact-container {
            padding: 0 16px;
          }

          .contact-header {
            margin-bottom: 40px;
          }

          .contact-form-section {
            padding: 30px 20px;
          }

          .contact-info-section {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .contact-info-card {
            padding: 16px;
          }

          .contact-success-toast {
            top: 10px;
            right: 10px;
            left: 10px;
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  )
}