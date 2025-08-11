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
        <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,.75)', backdropFilter: 'saturate(140%) blur(14px)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img 
                  src="/Logo.png" 
                  alt="WestCoast Collectibles Logo" 
                  style={{ 
                    height: '36px', 
                    width: '36px', 
                    borderRadius: '12px', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    padding: '2px',
                    background: 'linear-gradient(135deg, var(--wcc-grad-a), var(--wcc-grad-b))',
                    border: '2px solid transparent'
                  }}
                />
                <h1 style={{ margin: 0, fontSize: '1rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  WestCoast Collectibles
                </h1>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="/" style={{ padding: '11px 16px', borderRadius: '999px', border: '1px solid var(--line)', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,.05)', textDecoration: 'none', color: 'inherit' }}>Home</a>
                <a href="/returns" style={{ padding: '11px 16px', borderRadius: '999px', border: '1px solid var(--line)', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,.05)', textDecoration: 'none', color: 'inherit' }}>Shipping</a>
                <a href="/contact" style={{ padding: '11px 16px', borderRadius: '999px', border: '1px solid var(--line)', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,.05)', textDecoration: 'none', color: 'inherit' }}>Contact</a>
                <a href="/admin/login" style={{ padding: '11px 16px', borderRadius: '999px', border: 'none', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,var(--accent-start), var(--accent-mid) 55%, var(--accent-end))', boxShadow: 'var(--shadow-soft)', textDecoration: 'none', color: '#0b0b0f' }}>Admin</a>
              </div>
            </nav>
          </div>
        </header>
        <div>{children}</div>
        <footer style={{ padding: '16px 24px', borderTop: '1px solid #eee', marginTop: 40, fontSize: 12, color: '#555' }}>
          © {new Date().getFullYear()} WestCoastCollectibless • Santa Monica, CA
        </footer>
        
<style id="wcc-dropin" dangerouslySetInnerHTML={{__html: `
  :root{
    --wcc-ink:#17171b; --wcc-muted:#686874; --wcc-line:#ececf3;
    --wcc-lilac:#C7A3FF; --wcc-teal:#5ED0C0; --wcc-gold:#C9B07E;
    --wcc-grad-a:#C7A3FF; --wcc-grad-b:#5ED0C0; --wcc-grad-c:#F7E7C3;
    --wcc-shadow:0 18px 44px rgba(40,30,78,.16);
    --wcc-glow: rgba(94,208,192,.22); /* fallback instead of color-mix */
  }
  .wcc-card{
    position:relative;border-radius:18px;
    background:linear-gradient(#fff,#fff) padding-box,
             linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box;
    border:2px solid transparent;box-shadow:var(--wcc-shadow);overflow:hidden;
    transition:transform .34s ease, box-shadow .34s ease;
  }
  .wcc-thumb{position:relative;height:360px;border-radius:16px;background:#fff;overflow:hidden}
  .wcc-thumb::before{content:"";position:absolute;inset:10px;border-radius:12px;border:2px solid rgba(0,0,0,.06);transition:border-color .34s ease}
  .wcc-zoom{width:100%;height:100%;object-fit:cover;display:block;transition:transform .34s ease}

  .wcc-body{padding:14px 16px;color:var(--wcc-ink)}
  .wcc-title{margin:0;font-weight:800;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .wcc-brand{color:#7E5AE1;margin-right:.35em}

  .wcc-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;
    background:linear-gradient(135deg, rgba(199,163,255,.18), rgba(94,208,192,.18));border-top:1px solid var(--wcc-line)}
  .wcc-price{font-weight:800;color:#ff8b2a}
  .wcc-actions{display:flex;gap:8px}

  .wcc-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;font-size:.92rem;border-radius:999px;border:1px solid var(--wcc-line);background:#fff;position:relative;overflow:hidden}
  .wcc-btn--grad{border:none;color:#0b0b0f;background:linear-gradient(135deg,var(--wcc-teal),var(--wcc-grad-c));box-shadow:0 10px 24px rgba(94,208,192,.22)}
  .wcc-btn--grad::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.5) 50%,rgba(255,255,255,0) 70%);transform:translateX(-120%);transition:transform .6s ease}
  .wcc-btn--grad:hover::after{transform:translateX(120%)}

  .accent-lilac{--wcc-accent:var(--wcc-lilac)}
  .accent-teal{--wcc-accent:var(--wcc-teal)}
  .accent-gold{--wcc-accent:var(--wcc-gold)}

  .wcc-card:hover{transform:translateY(-4px);box-shadow:0 22px 46px var(--wcc-glow)}
  .wcc-card:hover::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:0 0 0 2px var(--wcc-accent) inset}
  .wcc-card:hover .wcc-thumb::before{border-color:var(--wcc-accent)}
  .wcc-card:hover .wcc-zoom{transform:scale(1.03)}

  .wcc-desc{padding:12px 16px;border-top:1px solid var(--wcc-line);background:#fff;color:var(--wcc-muted)}
  .wcc-desc[hidden]{display:none}

  .wcc-scroll{display:grid;grid-auto-flow:column;grid-auto-columns:calc(36% - 12px);gap:20px;overflow-x:auto;overflow-y:visible;padding:12px 0 34px;scroll-snap-type:x mandatory}
  @media (max-width:1024px){.wcc-scroll{grid-auto-columns:70%}}

  .bg-floater{position:fixed;width:14px;height:14px;border-radius:50%;opacity:.22;filter:blur(.2px);animation:bgFall 18s linear infinite;z-index:0}
  @keyframes bgFall{to{transform:translateY(110vh) translateX(6vw);opacity:.05}}
`}} />

<script id="wcc-dropin-js" dangerouslySetInnerHTML={{__html: `
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.emoji-confetti, .falling-emoji, [data-confetti]').forEach(n=>n.remove());

  const colors=['#C7A3FF','#5ED0C0','#F7E7C3'];
  function addFloaters(where, n){
    for(let i=0;i<n;i++){
      const f=document.createElement('span');
      f.className='bg-floater';
      if(where==='top'){ f.style.top='-20px'; } else { f.style.bottom='-20px'; }
      f.style.left=Math.random()*100+'vw';
      f.style.animationDelay=(Math.random()*8)+'s';
      f.style.background=colors[i%colors.length];
      document.body.appendChild(f);
    }
  }
  addFloaters('top',12); addFloaters('bottom',12);
});
`}} />
      </body>
    </html>
  )
}
