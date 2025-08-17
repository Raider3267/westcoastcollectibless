'use client'

import { useState, useEffect } from 'react'
import { VIP_TIERS, AuthService } from '../../lib/auth'

export default function VIPPage() {
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser())
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')

  useEffect(() => {
    setCurrentUser(AuthService.getCurrentUser())
  }, [])

  const handleUpgrade = (tierId: string) => {
    if (!currentUser) {
      alert('Please sign in to upgrade your membership')
      return
    }

    // In a real app, this would integrate with payment processing
    alert(`Upgrade to ${VIP_TIERS.find(t => t.id === tierId)?.name} - Payment integration needed`)
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="luxury-section" style={{ 
        background: 'linear-gradient(135deg, rgba(124,58,237,.1) 0%, rgba(168,85,247,.1) 50%, rgba(196,181,253,.1) 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '80px',
        paddingBottom: '80px'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '30%',
          height: '120%',
          background: 'radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '35%',
          height: '120%',
          background: 'radial-gradient(circle, rgba(168,85,247,.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />

        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="luxury-eyebrow" style={{ marginBottom: '16px' }}>
              Exclusive • Premium • Collector's Choice
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', 
              margin: '0 0 24px', 
              fontWeight: 800,
              color: 'var(--ink)',
              lineHeight: 1.1
            }}>
              👑 VIP Membership
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'var(--muted)', 
              margin: '0 0 32px',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6
            }}>
              Join our exclusive collector community and get early access to the most sought-after designer toys and collectibles. 
              Choose the membership tier that fits your collecting style.
            </p>

            {/* Current Membership Display */}
            {currentUser && (
              <div className="luxury-card accent-teal" style={{ 
                display: 'inline-block',
                padding: '16px 24px',
                marginBottom: '32px'
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '4px' }}>
                  Current Membership
                </div>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 800, 
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: VIP_TIERS.find(t => t.id === currentUser.tier)?.badge_color || '#ccc'
                  }} />
                  {VIP_TIERS.find(t => t.id === currentUser.tier)?.name || 'Collector'}
                </div>
              </div>
            )}

            {/* Billing Toggle */}
            <div style={{ 
              display: 'inline-flex',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '999px',
              padding: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={() => setSelectedPlan('monthly')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '999px',
                  border: 'none',
                  background: selectedPlan === 'monthly' ? 'var(--accent-teal)' : 'transparent',
                  color: selectedPlan === 'monthly' ? 'white' : 'var(--ink)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '999px',
                  border: 'none',
                  background: selectedPlan === 'yearly' ? 'var(--accent-teal)' : 'transparent',
                  color: selectedPlan === 'yearly' ? 'white' : 'var(--ink)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                Yearly
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  color: 'white',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  fontWeight: 700
                }}>
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="luxury-section" style={{ paddingTop: '40px' }}>
        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '32px',
            alignItems: 'stretch',
            paddingTop: '40px'
          }}>
            {VIP_TIERS.map((tier, index) => {
              const isCurrentTier = currentUser?.tier === tier.id
              const isUpgrade = currentUser && VIP_TIERS.findIndex(t => t.id === currentUser.tier) < index
              const price = selectedPlan === 'yearly' ? tier.price_yearly : tier.price_monthly
              const yearlyPrice = tier.price_yearly || 0
              const monthlyPrice = tier.price_monthly || 0
              const savings = selectedPlan === 'yearly' && monthlyPrice > 0 
                ? ((monthlyPrice * 12) - yearlyPrice).toFixed(2)
                : 0

              return (
                <div
                  key={tier.id}
                  className="luxury-card"
                  style={{
                    padding: index === 1 ? '48px 32px 32px 32px' : '32px',
                    background: isCurrentTier 
                      ? 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, var(--accent-teal), var(--accent-lilac)) border-box'
                      : index === 1 // Highlight Early Access as popular
                      ? 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, #f59e0b, #fbbf24) border-box'
                      : 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box',
                    border: '3px solid transparent',
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Popular Badge */}
                  {index === 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      color: 'white',
                      padding: '8px 20px',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      border: '2px solid white'
                    }}>
                      ⭐ Most Popular
                    </div>
                  )}

                  {/* Current Tier Badge */}
                  {isCurrentTier && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '2px solid white',
                      boxShadow: '0 4px 12px rgba(94,208,192,0.4)'
                    }}>
                      ✅ Current Plan
                    </div>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: tier.badge_color,
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }}>
                      {tier.id === 'basic' ? '👤' : tier.id === 'early_access' ? '⚡' : '👑'}
                    </div>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 800, 
                      color: 'var(--ink)', 
                      marginBottom: '8px' 
                    }}>
                      {tier.name}
                    </h3>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: 'var(--muted)', 
                      marginBottom: '16px',
                      lineHeight: 1.5
                    }}>
                      {tier.description}
                    </p>
                    
                    {/* Pricing */}
                    <div style={{ marginBottom: '24px' }}>
                      {price === 0 ? (
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                          Free
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ink)' }}>
                            ${price}
                            <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 400 }}>
                              /{selectedPlan === 'yearly' ? 'year' : 'month'}
                            </span>
                          </div>
                          {selectedPlan === 'yearly' && savings && (
                            <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>
                              Save ${savings} per year
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Featured Benefits */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
                      Key Benefits:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {tier.featured_benefits.map((benefit, i) => (
                        <span
                          key={i}
                          style={{
                            background: tier.badge_color,
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Full Benefits List */}
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
                      Everything included:
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          marginBottom: '8px',
                          fontSize: '0.9rem',
                          color: 'var(--ink)'
                        }}>
                          <span style={{ color: '#10b981', fontSize: '1rem' }}>✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isCurrentTier}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: '999px',
                      border: 'none',
                      background: isCurrentTier 
                        ? 'linear-gradient(135deg, #9ca3af, #d1d5db)'
                        : isUpgrade || tier.id === 'basic'
                        ? 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))'
                        : tier.badge_color,
                      color: isCurrentTier ? '#6b7280' : 'white',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: isCurrentTier ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isCurrentTier ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentTier) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentTier) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {isCurrentTier 
                      ? '✅ Current Plan' 
                      : tier.id === 'basic' 
                      ? '🆓 Join Free' 
                      : isUpgrade 
                      ? `⬆️ Upgrade to ${tier.name}`
                      : `🚀 Get ${tier.name}`}
                  </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="luxury-section" style={{ 
        background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.8rem, 2.5vw, 2.2rem)', 
              margin: '0 0 16px', 
              fontWeight: 800,
              color: 'var(--ink)'
            }}>
              ❓ Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              {
                q: "How does early access work?",
                a: "Early Access members get exclusive access to new drops 24 hours before they go public. Collector's Club members get 48 hours early access."
              },
              {
                q: "What are exclusive items?",
                a: "Collector's Club members get access to special items that are never released to the general public, including limited vault pieces and monthly exclusives."
              },
              {
                q: "Can I change my membership?",
                a: "Yes! You can upgrade or downgrade your membership at any time. Changes take effect immediately for upgrades."
              },
              {
                q: "How are discounts applied?",
                a: "Your membership discount is automatically applied at checkout to all eligible items. Free shipping is included for Collector's Club members."
              }
            ].map((faq, index) => (
              <div key={index} className="luxury-card accent-lilac" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                  {faq.q}
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}