'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../lib/cart'
import { createSquareOrder } from '../app/actions/fast-checkout'
import SquarePayment from './SquarePayment'
import { calculateSalesTax, formatTaxRate, shouldCollectTax } from '../lib/tax'

export default function Cart() {
  const { state, removeItem, updateQuantity, clearCart, closeCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [paymentError, setPaymentError] = useState('')
  const [squareOrderId, setSquareOrderId] = useState('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  
  // Billing Information
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })
  
  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })
  
  const [sameAsBilling, setSameAsBilling] = useState(true)
  
  // Shipping calculation state
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [selectedShipping, setSelectedShipping] = useState<any>(null)
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [shippingError, setShippingError] = useState('')
  const [showShippingSelection, setShowShippingSelection] = useState(false)
  const [needsShippingCalculation, setNeedsShippingCalculation] = useState(false)
  
  // Tax calculation state
  const [taxInfo, setTaxInfo] = useState<{
    taxRate: number
    taxAmount: number
    shouldCollect: boolean
  }>({
    taxRate: 0,
    taxAmount: 0,
    shouldCollect: false
  })

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [state.isOpen])

  // Recalculate tax when shipping address, cart contents, or shipping selection changes
  useEffect(() => {
    calculateTax()
  }, [billingInfo.state, billingInfo.zipCode, shippingInfo.state, shippingInfo.zipCode, sameAsBilling, selectedShipping, state.totalPrice])

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    setPaymentError('') // Clear any previous payment errors
  }

  // Calculate shipping rates when address is complete
  const calculateShipping = async () => {
    const shippingAddress = sameAsBilling ? billingInfo : shippingInfo
    
    // Check if address is complete
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      return
    }
    
    setIsCalculatingShipping(true)
    setShippingError('')
    
    try {
      const { calculateShippingRates, calculateCartWeight } = await import('../lib/shipping')
      
      // Calculate cart weight
      const cartItems = state.items.map(item => ({
        sku: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight || 0.3
      }))
      
      const totalWeight = calculateCartWeight(cartItems)
      const orderSubtotal = Math.round(state.totalPrice * 100) // Convert to cents
      
      // Prepare shipping address
      const address = {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'US'
      }
      
      const rates = calculateShippingRates(address, orderSubtotal, totalWeight)
      setShippingRates(rates)
      
      if (rates.length > 0) {
        setSelectedShipping(rates[0]) // Select cheapest by default
        setShowShippingSelection(true)
      }
    } catch (error) {
      console.error('Shipping calculation error:', error)
      setShippingError('Failed to calculate shipping rates. Please try again.')
    } finally {
      setIsCalculatingShipping(false)
    }
  }

  // Calculate tax based on shipping address
  const calculateTax = () => {
    const shippingAddress = sameAsBilling ? billingInfo : shippingInfo
    
    // Check if we have the required address info for tax calculation
    if (!shippingAddress.state || !shippingAddress.zipCode) {
      setTaxInfo({
        taxRate: 0,
        taxAmount: 0,
        shouldCollect: false
      })
      return
    }
    
    const shouldCollect = shouldCollectTax(shippingAddress.state)
    
    if (!shouldCollect) {
      setTaxInfo({
        taxRate: 0,
        taxAmount: 0,
        shouldCollect: false
      })
      return
    }
    
    const shippingCost = (selectedShipping?.cost || 0) / 100 // Convert cents to dollars
    const taxResult = calculateSalesTax({
      subtotal: state.totalPrice,
      shippingCost: shippingCost,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode
    })
    
    setTaxInfo({
      taxRate: taxResult.taxRate,
      taxAmount: taxResult.taxAmount,
      shouldCollect: true
    })
  }

  const handleCreateOrder = async () => {
    setPaymentError('')
    setIsCreatingOrder(true)
    
    // Basic form validation
    if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email) {
      setPaymentError('Please fill in all required billing information.')
      setIsCreatingOrder(false)
      return
    }

    // Validate shipping information if using separate shipping address
    if (!sameAsBilling) {
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
        setPaymentError('Please fill in all required shipping information.')
        setIsCreatingOrder(false)
        return
      }
    }
    
    // Check if shipping has been calculated
    if (!showShippingSelection) {
      setPaymentError('Please calculate shipping costs first.')
      setIsCreatingOrder(false)
      setNeedsShippingCalculation(true)
      return
    }
    
    if (!selectedShipping) {
      setPaymentError('Please select a shipping option.')
      setIsCreatingOrder(false)
      return
    }

    try {
      const result = await createSquareOrder({
        items: state.items,
        customerEmail: billingInfo.email,
        billingInfo,
        shippingInfo: sameAsBilling ? billingInfo : shippingInfo,
        taxAmount: taxInfo.taxAmount
      })

      if (result.success && result.orderId) {
        setSquareOrderId(result.orderId)
        setIsCreatingOrder(false)
        // Now the SquarePayment component will be shown
      } else {
        setPaymentError(result.error || 'Failed to create order.')
        setIsCreatingOrder(false)
      }
    } catch (error: any) {
      console.error('Order creation error:', error)
      setPaymentError('Failed to create order. Please try again.')
      setIsCreatingOrder(false)
    }
  }

  const handlePaymentSuccess = (receipt: any) => {
    console.log('Cart payment successful, receipt:', receipt)
    setPaymentError('') // Clear any previous errors
    setOrderDetails({
      receipt,
      items: [...state.items],
      total: state.totalPrice,
      customerEmail: billingInfo.email || customerEmail,
      billingInfo,
      shippingInfo: sameAsBilling ? billingInfo : shippingInfo
    })
    setShowConfirmation(true)
    setIsCheckingOut(false)
    console.log('Should now show confirmation screen')
  }

  const handlePaymentError = (error: any) => {
    console.error('Cart payment error:', error)
    setPaymentError('Payment failed. Please try again.')
    // Keep in checkout mode but show error
    // setIsCheckingOut(false) // Don't go back to cart, stay in checkout with error
  }

  const handleBackToCart = () => {
    setIsCheckingOut(false)
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    setOrderDetails(null)
    clearCart()
    closeCart()
  }

  if (!state.isOpen) return null

  return (
    <div>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Cart Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {isCheckingOut ? 'Checkout' : 'Shopping Cart'}
            </h2>
            <button
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showConfirmation ? (
            /* Confirmation Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 text-green-600">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Complete!</h3>
              <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been successfully processed.</p>
              
              {/* Order Summary */}
              <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  {orderDetails?.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-900">
                        ${item.price && typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold">
                  <span>Total Paid</span>
                  <span>${orderDetails?.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Information */}
              {orderDetails?.shippingInfo && (
                <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Shipping To</h4>
                  <div className="text-sm text-gray-600">
                    <p>{orderDetails.shippingInfo.firstName} {orderDetails.shippingInfo.lastName}</p>
                    <p>{orderDetails.shippingInfo.address}</p>
                    <p>{orderDetails.shippingInfo.city}, {orderDetails.shippingInfo.state} {orderDetails.shippingInfo.zipCode}</p>
                  </div>
                </div>
              )}

              {/* Receipt Info */}
              {orderDetails?.customerEmail && (
                <p className="text-sm text-gray-600 mb-4">
                  A receipt has been sent to {orderDetails.customerEmail}
                </p>
              )}
              
              {orderDetails?.receipt?.id && (
                <p className="text-xs text-gray-500 mb-6">
                  Transaction ID: {orderDetails.receipt.id}
                </p>
              )}
              
              <button
                onClick={handleCloseConfirmation}
                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : isCheckingOut ? (
            /* Checkout View */
            <>
              {/* Back Button */}
              <button
                onClick={handleBackToCart}
                className="flex items-center p-4 text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-100"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Cart
              </button>

              {/* Order Summary */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-900">
                        ${item.price && typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Subtotal</span>
                    <span>${state.totalPrice.toFixed(2)}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Shipping ({selectedShipping.service.replace('_', ' ')})</span>
                      <span>{selectedShipping.cost === 0 ? 'FREE' : `$${(selectedShipping.cost / 100).toFixed(2)}`}</span>
                    </div>
                  )}
                  {taxInfo.shouldCollect && taxInfo.taxAmount > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Tax ({formatTaxRate(taxInfo.taxRate)})</span>
                      <span>${taxInfo.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${(((state.totalPrice * 100) + (selectedShipping?.cost || 0) + (taxInfo.taxAmount * 100)) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Billing Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={billingInfo.firstName}
                      onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={billingInfo.lastName}
                      onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={billingInfo.phone}
                    onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={billingInfo.address}
                    onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={billingInfo.city}
                      onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={billingInfo.state}
                      onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={billingInfo.zipCode}
                      onChange={(e) => setBillingInfo({...billingInfo, zipCode: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Shipping Information</h3>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => {
                        setSameAsBilling(e.target.checked)
                        setShowShippingSelection(false)
                        setShippingRates([])
                        setSelectedShipping(null)
                      }}
                      className="mr-2"
                    />
                    Same as billing
                  </label>
                </div>
                
                {!sameAsBilling && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={shippingInfo.firstName}
                        onChange={(e) => {
                          setShippingInfo({...shippingInfo, firstName: e.target.value})
                          setShowShippingSelection(false)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={shippingInfo.lastName}
                        onChange={(e) => {
                          setShippingInfo({...shippingInfo, lastName: e.target.value})
                          setShowShippingSelection(false)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={shippingInfo.address}
                      onChange={(e) => {
                        setShippingInfo({...shippingInfo, address: e.target.value})
                        setShowShippingSelection(false)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingInfo.city}
                        onChange={(e) => {
                          setShippingInfo({...shippingInfo, city: e.target.value})
                          setShowShippingSelection(false)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={shippingInfo.state}
                        onChange={(e) => {
                          setShippingInfo({...shippingInfo, state: e.target.value})
                          setShowShippingSelection(false)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={shippingInfo.zipCode}
                        onChange={(e) => {
                          setShippingInfo({...shippingInfo, zipCode: e.target.value})
                          setShowShippingSelection(false)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                )}
                
                {/* Calculate Shipping Button */}
                <div className="mt-4">
                  <button
                    onClick={calculateShipping}
                    disabled={isCalculatingShipping}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isCalculatingShipping ? 'Calculating...' : 'Calculate Shipping Costs'}
                  </button>
                  {needsShippingCalculation && (
                    <p className="text-sm text-amber-600 mt-2">
                      Please calculate shipping costs before proceeding to payment.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Shipping Options Selection */}
              {showShippingSelection && shippingRates.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Select Shipping Option</h3>
                  
                  {shippingError && (
                    <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {shippingError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {shippingRates.map((rate, index) => (
                      <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping?.service === rate.service}
                          onChange={() => setSelectedShipping(rate)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900 capitalize">
                              {rate.service.replace('_', ' ')}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {rate.cost === 0 ? 'FREE' : `$${(rate.cost / 100).toFixed(2)}`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {rate.description} • Estimated {rate.estimatedDays} business days
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Error Display */}
              {paymentError && (
                <div className="p-4 mx-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p className="font-semibold">Payment Error</p>
                  <p>{paymentError}</p>
                </div>
              )}

              {/* Payment Section */}
              <div className="p-4">
                {!squareOrderId ? (
                  <>
                    <button
                      onClick={handleCreateOrder}
                      disabled={isCreatingOrder || !showShippingSelection}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {isCreatingOrder ? 'Creating Order...' : `Continue to Payment - $${(((state.totalPrice * 100) + (selectedShipping?.cost || 0) + (taxInfo.taxAmount * 100)) / 100).toFixed(2)}`}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Next step: Complete payment with Square
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Order created successfully! Complete your payment below.
                      </p>
                    </div>
                    <SquarePayment
                      amount={Math.round((state.totalPrice * 100) + (selectedShipping?.cost || 0) + (taxInfo.taxAmount * 100))} // Include shipping and tax
                      currency="USD"
                      productName={`Order (${state.totalItems} items)`}
                      productSku={`cart-${Date.now()}`}
                      customerEmail={billingInfo.email}
                      orderId={squareOrderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            /* Cart View */
            <>
              {state.items.length === 0 ? (
                /* Empty Cart */
                <div className="flex-1 flex items-center justify-center flex-col p-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 10h10M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 004 16v1a1 1 0 001 1h1m5-1v1a1 1 0 001 1h1m-6 0a1 1 0 001 1h1m0 0a1 1 0 001-1v-1h-1z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-center">Add some products to your cart to get started!</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="flex-1 p-4 space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            ${item.price && typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Quantity Controls */}
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary & Checkout */}
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{state.totalItems} items</span>
                        <span>Subtotal: ${state.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${state.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={handleCheckout}
                        disabled={state.items.length === 0}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                      >
                        Proceed to Checkout
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full py-2 px-4 text-gray-600 hover:text-gray-900 text-sm transition-colors"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}