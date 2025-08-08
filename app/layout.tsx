import './globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'WestCoastCollectibless',
  description: 'Collectibles • Designer Toys • 3D-Printed Mods',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
          <nav style={{ display: 'flex', gap: 16 }}>
            <a href="/">Home</a>
            <a href="/returns">Shipping & Returns</a>
            <a href="/privacy">Privacy</a>
            <a href="/contact">Contact</a>
          </nav>
        </header>
        <div>{children}</div>
        <footer style={{ padding: '16px 24px', borderTop: '1px solid #eee', marginTop: 40, fontSize: 12, color: '#555' }}>
          © {new Date().getFullYear()} WestCoastCollectibless • Santa Monica, CA
        </footer>
      </body>
    </html>
  )
}
