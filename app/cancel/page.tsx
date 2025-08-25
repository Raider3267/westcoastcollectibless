export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, rgba(255,184,77,0.05) 0%, rgba(255,159,67,0.05) 100%)'
    }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="mb-6" style={{ color: '#ff8b2a' }}>
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-3" style={{ color: '#0b0b0f' }}>Payment Canceled</h1>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          No worries! Your payment was canceled and no charges were made to your account. Your cart is still saved.
        </p>
        
        <div className="space-y-4">
          <a 
            href="/" 
            className="block font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:transform hover:translateY(-1px) hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #5ED0C0, #F7E7C3)',
              color: '#0b0b0f',
              textDecoration: 'none'
            }}
          >
            Continue Shopping
          </a>
          <button 
            onClick={() => window.history.back()}
            className="block w-full font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-md"
            style={{
              border: '2px solid #5ED0C0',
              background: 'white',
              color: '#5ED0C0'
            }}
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  )
}