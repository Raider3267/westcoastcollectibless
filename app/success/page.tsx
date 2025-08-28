export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, rgba(94,208,192,0.05) 0%, rgba(199,163,255,0.05) 100%)'
    }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="mb-6" style={{ color: '#5ED0C0' }}>
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-3" style={{ color: '#0b0b0f' }}>Order Complete!</h1>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Thank you for your purchase! Your collectible is on its way. You'll receive a confirmation email with tracking details shortly.
        </p>
        
        <a 
          href="/" 
          className="inline-block font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:transform hover:translateY(-1px) hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #5ED0C0, #F7E7C3)',
            color: '#0b0b0f',
            textDecoration: 'none'
          }}
        >
          Continue Shopping
        </a>
      </div>
    </div>
  )
}