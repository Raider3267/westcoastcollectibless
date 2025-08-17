'use client'

import { useState, useEffect } from 'react'
import { Listing } from '../../../lib/listings'
import CountdownTimer from '../../../components/CountdownTimer'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  product?: Listing
  type: 'drop' | 'restock' | 'announcement'
}

export default function DropCalendarPage() {
  const [comingSoonItems, setComingSoonItems] = useState<Listing[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComingSoonItems = async () => {
      try {
        const response = await fetch('/api/coming-soon/products')
        if (response.ok) {
          const data = await response.json()
          setComingSoonItems(data)
        }
      } catch (error) {
        console.error('Failed to load coming soon items:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchComingSoonItems()
  }, [])

  // Convert coming soon items to calendar events
  const calendarEvents: CalendarEvent[] = comingSoonItems
    .filter(item => item.drop_date)
    .map(item => ({
      id: item.id,
      title: item.name,
      date: new Date(item.drop_date!),
      product: item,
      type: 'drop'
    }))

  // Get events for current month
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()
  
  const monthEvents = calendarEvents.filter(event => 
    event.date.getMonth() === currentMonth && 
    event.date.getFullYear() === currentYear
  )

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const getEventsForDay = (day: number) => {
    return monthEvents.filter(event => event.date.getDate() === day)
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const nextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const prevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
  }

  if (loading) {
    return (
      <div className="luxury-section" style={{ 
        background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📅</div>
          <div>Loading drop calendar...</div>
        </div>
      </div>
    )
  }

  return (
    <main>
      <section className="luxury-section" style={{ 
        background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh'
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '40%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(199,163,255,.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '35%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(94,208,192,.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="luxury-eyebrow" style={{ marginBottom: '16px' }}>
              Exclusive Drops
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 3vw, 2.5rem)', 
              margin: '0 0 20px', 
              fontWeight: 800,
              color: 'var(--ink)',
              lineHeight: 1.2
            }}>
              📅 Drop Calendar
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)', margin: '0 0 32px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Never miss a drop! Stay updated with all upcoming releases, restocks, and exclusive launches.
            </p>
          </div>

          {/* Next Drop Countdown */}
          {calendarEvents.length > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '20px' }}>
                ⏰ Next Drop
              </h2>
              <CountdownTimer 
                targetDate={calendarEvents
                  .filter(event => event.date > new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date || new Date()
                }
              />
            </div>
          )}

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div className="luxury-card accent-teal" style={{ padding: '4px', display: 'flex', borderRadius: '999px' }}>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  background: viewMode === 'month' ? 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))' : 'transparent',
                  color: viewMode === 'month' ? 'white' : 'var(--ink)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                📅 Month View
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  background: viewMode === 'list' ? 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--ink)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                📋 List View
              </button>
            </div>
          </div>

          {viewMode === 'month' ? (
            /* Month Calendar View */
            <div className="luxury-card accent-teal" style={{ padding: '24px' }}>
              {/* Calendar Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button
                  onClick={prevMonth}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ←
                </button>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
                  {formatMonth(selectedDate)}
                </h2>
                <button
                  onClick={nextMonth}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ 
                    padding: '12px 8px', 
                    background: 'var(--accent-teal)', 
                    color: 'white', 
                    fontWeight: 600, 
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}>
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : []
                  const isToday = day && 
                    new Date().getDate() === day && 
                    new Date().getMonth() === currentMonth && 
                    new Date().getFullYear() === currentYear

                  return (
                    <div
                      key={index}
                      style={{
                        minHeight: '80px',
                        padding: '8px',
                        background: '#fff',
                        position: 'relative',
                        border: isToday ? '2px solid var(--accent-teal)' : 'none'
                      }}
                    >
                      {day && (
                        <>
                          <div style={{ 
                            fontWeight: isToday ? 800 : 600, 
                            color: isToday ? 'var(--accent-teal)' : 'var(--ink)',
                            marginBottom: '4px',
                            fontSize: '0.9rem'
                          }}>
                            {day}
                          </div>
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              style={{
                                padding: '2px 6px',
                                background: 'linear-gradient(135deg, var(--accent-lilac), var(--accent-teal))',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                marginBottom: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={event.title}
                            >
                              🎯 {event.title}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {calendarEvents.length === 0 ? (
                <div className="luxury-card accent-teal" style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
                    No Upcoming Drops
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Check back soon for new releases and exclusive drops!
                  </p>
                </div>
              ) : (
                calendarEvents
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map(event => (
                    <div key={event.id} className="luxury-card accent-lilac" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          <div style={{ fontSize: '0.7rem' }}>
                            {event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '1.2rem' }}>
                            {event.date.getDate()}
                          </div>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px' }}>
                            {event.title}
                          </h3>
                          <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '8px' }}>
                            {event.date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                            color: 'white',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            🎯 Product Drop
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}