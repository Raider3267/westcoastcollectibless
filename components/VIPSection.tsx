'use client'

import { useState } from 'react'
import AuthLightModal from './AuthLightModal'

interface VIPSectionProps {
  className?: string
}

export default function VIPSection({ className = '' }: VIPSectionProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignUp = () => {
    setShowAuthModal(true)
  }

  const benefits = [
    {
      title: "Early Access Window",
      subtitle: "coming soon",
      icon: "🔓"
    },
    {
      title: "Drop Alerts",
      subtitle: "email notifications",
      icon: "📧"
    },
    {
      title: "Wishlist & Reserve Requests", 
      subtitle: "coming soon",
      icon: "💎"
    },
    {
      title: "VIP Discounts",
      subtitle: "5–10% on select drops, coming soon",
      icon: "🎯"
    }
  ]

  return (
    <>
      <section className={`vip-section ${className}`}>
        {/* Rainbow Background Decorations */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-5%',
          width: '30%',
          height: '130%',
          background: 'radial-gradient(circle, rgba(199,163,255,.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: '35%',
          height: '130%',
          background: 'radial-gradient(circle, rgba(94,208,192,.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '25%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(247,231,195,.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)'
        }} />

        <div className="vip-container">
          {/* Hero Strip */}
          <div className="vip-hero">
            <div className="vip-hero-content">
              <div className="vip-text">
                <h2 className="vip-title">
                  <span className="vip-title-text">Become a Collector</span>
                  <span className="vip-badge">(Coming Soon)</span>
                </h2>
                <p className="vip-subtitle">
                  Our VIP collector program is launching soon! Sign up to be notified when advanced features like early access, curated picks, and exclusive perks become available.
                </p>
              </div>
              
              <div className="vip-form">
                <button 
                  onClick={handleSignUp}
                  className="vip-join-button"
                >
                  Sign Up to Get Notified
                </button>
                <p className="vip-privacy">Create an account to get notified about VIP features, exclusive drops, and collector updates.</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="vip-benefits">
            {benefits.map((benefit, index) => (
              <div key={index} className="vip-benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-subtitle">{benefit.subtitle}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="vip-how-it-works">
            <div className="how-it-works-step">
              <span className="step-number">1</span>
              <span className="step-text">Join for free</span>
            </div>
            <div className="how-it-works-step">
              <span className="step-number">2</span>
              <span className="step-text">Pick items to follow (use "Notify Me" on Coming Soon)</span>
            </div>
            <div className="how-it-works-step">
              <span className="step-number">3</span>
              <span className="step-text">Get alerted when they drop</span>
            </div>
          </div>

          {/* Secondary Links */}
          <div className="vip-secondary-links">
            <a href="#" className="secondary-link">Already joined? Sign in</a>
          </div>
        </div>

        <style jsx>{`
          .vip-section {
            padding: 44px 0 60px;
            position: relative;
            background: linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%);
            overflow: hidden;
          }

          .vip-container {
            max-width: 1224px;
            margin: 0 auto;
            padding: 0 20px;
            position: relative;
            z-index: 2;
          }

          .vip-hero {
            margin-bottom: 32px;
          }

          .vip-hero-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 40px;
          }

          .vip-text {
            flex: 1;
          }

          .vip-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0 0 12px;
          }

          .vip-title-text {
            font-size: clamp(1.8rem, 3vw, 2.2rem);
            font-weight: 800;
            color: var(--wcc-ink);
            position: relative;
          }

          .vip-badge {
            font-size: 0.85rem;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #333;
            padding: 6px 12px;
            border-radius: 999px;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
          }

          .vip-subtitle {
            font-size: 1.1rem;
            color: #6b7280;
            line-height: 1.5;
            margin: 0;
            max-width: 400px;
          }

          .vip-form {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .vip-join-button {
            padding: 12px 24px;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #333;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
            white-space: nowrap;
          }

          .vip-join-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
          }

          .vip-privacy {
            font-size: 0.8rem;
            color: #9ca3af;
            margin: 0;
            text-align: center;
            max-width: 300px;
          }

          .vip-benefits {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 32px;
          }

          .vip-benefit-card {
            background: rgba(255, 255, 255, 0.4);
            border: 1px solid rgba(255, 215, 0, 0.1);
            border-radius: 12px;
            padding: 20px 16px;
            text-align: center;
            transition: all 0.3s ease;
          }

          .vip-benefit-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.6);
          }

          .benefit-icon {
            font-size: 1.5rem;
            margin-bottom: 8px;
          }

          .benefit-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--wcc-ink);
            margin: 0 0 4px;
            line-height: 1.3;
          }

          .benefit-subtitle {
            font-size: 0.8rem;
            color: #9ca3af;
            margin: 0;
            font-style: italic;
          }

          .vip-how-it-works {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 24px;
            padding: 20px 0;
          }

          .how-it-works-step {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.9rem;
            color: #6b7280;
          }

          .step-number {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
            flex-shrink: 0;
          }

          .step-text {
            max-width: 140px;
            line-height: 1.3;
          }

          .vip-secondary-links {
            display: flex;
            justify-content: center;
            gap: 24px;
          }

          .secondary-link {
            font-size: 0.8rem;
            color: #9ca3af;
            text-decoration: none;
            transition: color 0.3s ease;
          }

          .secondary-link:hover {
            color: #6b7280;
            text-decoration: underline;
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
            .vip-benefits {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }

            .vip-how-it-works {
              gap: 30px;
            }

            .step-text {
              max-width: 120px;
            }
          }

          /* Mobile Styles */
          @media (max-width: 768px) {
            .vip-container {
              padding: 24px 20px;
              margin: 0 16px;
            }

            .vip-hero-content {
              flex-direction: column;
              gap: 24px;
              text-align: center;
            }

            .vip-title {
              justify-content: center;
            }

            .vip-title-text {
              font-size: clamp(1.5rem, 4vw, 1.8rem);
            }

            .vip-subtitle {
              max-width: none;
            }

            .vip-form {
              width: 100%;
              align-items: stretch;
            }

            .vip-benefits {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .vip-how-it-works {
              flex-direction: column;
              gap: 16px;
              align-items: center;
            }

            .how-it-works-step {
              justify-content: center;
              text-align: center;
            }

            .step-text {
              max-width: 200px;
            }

            .vip-secondary-links {
              flex-direction: column;
              gap: 12px;
            }
          }
        `}</style>
      </section>
      
      <AuthLightModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        title="Join the VIP Collector Program"
        subtitle="Create an account to get notified about VIP features, exclusive drops, and collector updates."
      />
    </>
  )
}