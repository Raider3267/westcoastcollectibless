'use client'

import React from 'react'

interface HeaderActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  children: React.ReactNode
  badge?: number | string
  as?: 'button' | 'a'
  href?: string
}

const HeaderActionButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  HeaderActionButtonProps
>(({ variant = 'ghost', children, badge, as = 'button', href, className = '', ...props }, ref) => {
  const baseClasses = `
    inline-flex items-center gap-2 rounded-full 
    h-9 md:h-10 px-3 md:px-4 
    text-sm md:text-base font-medium 
    transition-all duration-300 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40
    backdrop-blur-sm
    border border-white/20
    text-white text-shadow-sm
    relative
    ${className}
  `.trim().replace(/\s+/g, ' ')

  const variantClasses = {
    primary: `
      bg-white/20 hover:bg-white/30 
      border-white/30 hover:border-white/40
      shadow-lg hover:shadow-xl
    `.trim().replace(/\s+/g, ' '),
    ghost: `
      bg-white/10 hover:bg-white/20 
      border-white/20 hover:border-white/30
      shadow-md hover:shadow-lg
    `.trim().replace(/\s+/g, ' ')
  }

  const combinedClasses = `${baseClasses} ${variantClasses[variant]}`

  const content = (
    <>
      {children}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </>
  )

  if (as === 'a') {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={combinedClasses}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  )
})

HeaderActionButton.displayName = 'HeaderActionButton'

export default HeaderActionButton