'use client'

import { useEffect, useState } from 'react'
import { fetchSquareProducts } from '../actions/square-catalog'
import { useCart } from '../../lib/cart'
import type { SquareProduct } from '../../lib/square'

export default function SquareProductsPage() {
  const [products, setProducts] = useState<SquareProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const result = await fetchSquareProducts()
      
      if (result.success && result.products) {
        setProducts(result.products)
        console.log('Loaded Square products:', result.products)
      } else {
        setError(result.error?.detail || 'Failed to load products')
      }
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: SquareProduct) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      weight: 0.3 // Default weight for Square products
    }
    addItem(cartItem)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products from Square...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error Loading Products</p>
            <p>{error}</p>
          </div>
          <button
            onClick={loadProducts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Square Catalog Products
          </h1>
          <p className="text-gray-600">
            Products synced directly from Square Dashboard ({products.length} items)
          </p>
          <button
            onClick={loadProducts}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Refresh Products
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No products were found in your Square catalog. Add products in your Square Dashboard to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-gray-900">
                      ${product.price && typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {product.quantity !== undefined && (
                        <span className={`text-sm px-2 py-1 rounded ${
                          product.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isAvailable ? `${product.quantity} in stock` : 'Out of stock'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {product.sku && (
                    <p className="text-xs text-gray-500 mb-3">
                      SKU: {product.sku}
                    </p>
                  )}
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.isAvailable}
                    className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                      product.isAvailable
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  {product.variations && product.variations.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">
                        {product.variations.length} variations available
                      </p>
                      <div className="space-y-1">
                        {product.variations.slice(0, 3).map((variation) => (
                          <div key={variation.id} className="flex justify-between text-xs text-gray-600">
                            <span>{variation.name}</span>
                            <span>${variation.price && typeof variation.price === 'number' ? variation.price.toFixed(2) : '0.00'}</span>
                          </div>
                        ))}
                        {product.variations.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{product.variations.length - 3} more variations
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}