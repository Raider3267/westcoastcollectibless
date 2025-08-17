'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '../../../components/ImageUpload'

interface Product {
  sku: string
  title: string
  description: string
  quantity: number
  price: number
  images: string
  status: 'live' | 'coming-soon' | 'draft'
  drop_date?: string
  released_date?: string
  show_in_new_releases?: boolean
  // Cost tracking fields
  purchase_cost?: number
  shipping_cost?: number
  total_cost?: number
  purchase_date?: string
  supplier?: string
  tracking_number?: string
  profit_per_unit?: number
  total_inventory_value?: number
  potential_profit?: number
}

interface ProductForm {
  sku: string
  title: string
  description: string
  quantity: number
  price: number
  images: string[]
  status: 'live' | 'coming-soon' | 'draft'
  drop_date?: string
  released_date?: string
  show_in_new_releases?: boolean
  // Cost tracking fields
  purchase_cost?: number
  shipping_cost?: number
  total_cost?: number
  purchase_date?: string
  supplier?: string
  tracking_number?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in-stock' | 'out-of-stock' | 'coming-soon'>('all')
  const [editingProduct, setEditingProduct] = useState<ProductForm | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showNewReleasesSection, setShowNewReleasesSection] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showNewReleasesSection') === 'true'
    }
    return false
  })
  const [newProduct, setNewProduct] = useState<Partial<ProductForm>>({
    sku: '',
    title: '',
    description: '',
    quantity: 1,
    price: 0,
    images: [],
    status: 'live',
    purchase_cost: 0,
    shipping_cost: 0,
    total_cost: 0,
    purchase_date: '',
    supplier: '',
    tracking_number: ''
  })

  // Helper functions to convert between string and array formats
  const productToForm = (product: Product): ProductForm => ({
    ...product,
    images: product.images ? product.images.split(',').map(img => img.trim()).filter(img => img) : [],
    purchase_cost: product.purchase_cost || 0,
    shipping_cost: product.shipping_cost || 0,
    total_cost: product.total_cost || 0,
    purchase_date: product.purchase_date || '',
    supplier: product.supplier || '',
    tracking_number: product.tracking_number || ''
  })

  const formToProduct = (form: ProductForm): Product => ({
    ...form,
    images: form.images.join(', '),
    total_cost: (form.purchase_cost || 0) + (form.shipping_cost || 0)
  })

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined' && !sessionStorage.getItem('adminAuth')) {
      router.push('/admin/login')
      return
    }
    
    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  const toggleNewReleasesSection = () => {
    const newValue = !showNewReleasesSection
    setShowNewReleasesSection(newValue)
    localStorage.setItem('showNewReleasesSection', newValue.toString())
  }

  const filteredProducts = products.filter(product => {
    if (filter === 'in-stock') return product.quantity > 0
    if (filter === 'out-of-stock') return product.quantity === 0
    if (filter === 'coming-soon') return product.status === 'coming-soon'
    return true
  })

  const updateStock = async (sku: string, newQuantity: number) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, quantity: Math.max(0, newQuantity) })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, quantity: Math.max(0, newQuantity) } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const updateProductStatus = async (sku: string, newStatus: 'live' | 'coming-soon' | 'draft') => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, status: newStatus })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, status: newStatus } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update product status:', error)
    }
  }

  const updateDropDate = async (sku: string, dropDate: string) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, drop_date: dropDate })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, drop_date: dropDate } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update drop date:', error)
    }
  }

  const updateNewReleasesVisibility = async (sku: string, showInNewReleases: boolean) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, show_in_new_releases: showInNewReleases.toString() })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, show_in_new_releases: showInNewReleases } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update new releases visibility:', error)
    }
  }

  const deleteProduct = async (sku: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku })
      })
      
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.sku !== sku))
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const addProduct = async () => {
    try {
      // Convert form data to product format before sending
      const productData = formToProduct(newProduct as ProductForm)
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setProducts(prev => [...prev, result.product])
        setShowAddProduct(false)
        setNewProduct({
          sku: '',
          title: '',
          description: '',
          quantity: 1,
          price: 0,
          images: [],
          purchase_cost: 0,
          shipping_cost: 0,
          total_cost: 0,
          purchase_date: '',
          supplier: '',
          tracking_number: ''
        })
      }
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pop-purple mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/Logo.png" 
              alt="WestCoast Collectibles Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/purchases')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              📦 Purchase Management
            </button>
            <button
              onClick={toggleNewReleasesSection}
              className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                showNewReleasesSection
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
              title="Toggle New Releases Section on Homepage"
            >
              {showNewReleasesSection ? '✅ New Releases ON' : '❌ New Releases OFF'}
            </button>
            <span className="text-sm text-gray-600">Welcome back!</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">In Stock</h3>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.quantity > 0).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Inventory Value</h3>
            <p className="text-2xl font-bold text-blue-600">
              ${products.reduce((sum, p) => sum + ((p.total_cost || 0) * p.quantity), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Potential Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">
              ${products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Potential Profit</h3>
            <p className="text-2xl font-bold text-emerald-600">
              ${products.reduce((sum, p) => sum + ((p.price - (p.total_cost || 0)) * p.quantity), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Avg Profit Margin</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {products.length > 0 ? 
                (products.reduce((sum, p) => {
                  const margin = p.price > 0 ? ((p.price - (p.total_cost || 0)) / p.price) * 100 : 0
                  return sum + margin
                }, 0) / products.length).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Filters and Add Product */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-pop-purple text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setFilter('in-stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'in-stock' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              In Stock ({products.filter(p => p.quantity > 0).length})
            </button>
            <button
              onClick={() => setFilter('out-of-stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'out-of-stock' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Out of Stock ({products.filter(p => p.quantity === 0).length})
            </button>
            <button
              onClick={() => setFilter('coming-soon')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'coming-soon' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Coming Soon ({products.filter(p => p.status === 'coming-soon').length})
            </button>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price / Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit/Unit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drop Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Releases
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.sku} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.images && (
                          <img 
                            src={product.images.split(',')[0]} 
                            alt={product.title}
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png'
                            }}
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <div className="font-semibold text-green-600">
                          💰 ${product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Cost: ${(product.total_cost || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStock(product.sku, product.quantity - 1)}
                          className="bg-red-100 text-red-600 w-6 h-6 rounded flex items-center justify-center hover:bg-red-200 transition-colors"
                          disabled={product.quantity <= 0}
                        >
                          −
                        </button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => updateStock(product.sku, product.quantity + 1)}
                          className="bg-green-100 text-green-600 w-6 h-6 rounded flex items-center justify-center hover:bg-green-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <div className={`font-semibold ${
                          (product.price - (product.total_cost || 0)) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${(product.price - (product.total_cost || 0)).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.price > 0 ? 
                            (((product.price - (product.total_cost || 0)) / product.price) * 100).toFixed(1) : 0}% margin
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={product.status || 'live'}
                        onChange={(e) => updateProductStatus(product.sku, e.target.value as 'live' | 'coming-soon' | 'draft')}
                        className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${
                          product.status === 'live' 
                            ? 'bg-green-100 text-green-800' 
                            : product.status === 'coming-soon'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="live">🟢 Live</option>
                        <option value="coming-soon">🟡 Coming Soon</option>
                        <option value="draft">⚪ Draft</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="datetime-local"
                        value={product.drop_date || ''}
                        onChange={(e) => updateDropDate(product.sku, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        disabled={product.status !== 'coming-soon'}
                        placeholder="Set drop date"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {product.released_date && (
                        <div className="flex items-center gap-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={product.show_in_new_releases || false}
                              onChange={(e) => updateNewReleasesVisibility(product.sku, e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              product.show_in_new_releases 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-green-400'
                            }`}>
                              {product.show_in_new_releases && '✓'}
                            </div>
                          </label>
                          <span className="text-xs text-gray-600">
                            Show in New Releases
                          </span>
                        </div>
                      )}
                      {!product.released_date && (
                        <span className="text-xs text-gray-400">Not a new release</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProduct(productToForm(product))}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product.sku)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching the current filter.</p>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct(prev => prev ? {...prev, description: e.target.value} : null)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct(prev => prev ? {...prev, price: parseFloat(e.target.value) || 0} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={editingProduct.quantity}
                      onChange={(e) => setEditingProduct(prev => prev ? {...prev, quantity: parseInt(e.target.value) || 0} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    />
                  </div>
                </div>
                <ImageUpload
                  images={editingProduct.images || []}
                  onChange={(newImages) => setEditingProduct(prev => prev ? {...prev, images: newImages} : null)}
                  maxImages={8}
                />
                
                {/* Cost Tracking Section */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">💰 Cost Tracking</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.purchase_cost || 0}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, purchase_cost: parseFloat(e.target.value) || 0} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.shipping_cost || 0}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, shipping_cost: parseFloat(e.target.value) || 0} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                      <input
                        type="date"
                        value={editingProduct.purchase_date || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, purchase_date: e.target.value} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                      <input
                        type="text"
                        value={editingProduct.supplier || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, supplier: e.target.value} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="Supplier name"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                      <input
                        type="text"
                        value={editingProduct.tracking_number || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, tracking_number: e.target.value} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="Tracking number"
                      />
                    </div>
                  </div>
                  
                  {/* Cost Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Cost:</span>
                        <div className="font-semibold text-blue-600">
                          ${((editingProduct.purchase_cost || 0) + (editingProduct.shipping_cost || 0)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit per Unit:</span>
                        <div className={`font-semibold ${
                          ((editingProduct.price || 0) - ((editingProduct.purchase_cost || 0) + (editingProduct.shipping_cost || 0))) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${((editingProduct.price || 0) - ((editingProduct.purchase_cost || 0) + (editingProduct.shipping_cost || 0))).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit Margin:</span>
                        <div className="font-semibold text-purple-600">
                          {(editingProduct.price || 0) > 0 ? 
                            (((editingProduct.price || 0) - ((editingProduct.purchase_cost || 0) + (editingProduct.shipping_cost || 0))) / (editingProduct.price || 0) * 100).toFixed(1) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Convert form data to product format before sending
                      const productData = formToProduct(editingProduct)
                      
                      const response = await fetch('/api/admin/products', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                      })
                      
                      if (response.ok) {
                        setProducts(prev => prev.map(p => 
                          p.sku === editingProduct.sku ? productData : p
                        ))
                        setEditingProduct(null)
                      }
                    } catch (error) {
                      console.error('Failed to update product:', error)
                    }
                  }}
                  className="bg-pop-purple text-white px-4 py-2 rounded-lg hover:bg-pop-purple/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                    <input
                      type="text"
                      value={newProduct.sku || ''}
                      onChange={(e) => setNewProduct(prev => ({...prev, sku: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                      placeholder="Enter unique SKU"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price || 0}
                      onChange={(e) => setNewProduct(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newProduct.title || ''}
                    onChange={(e) => setNewProduct(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    placeholder="Product title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct(prev => ({...prev, description: e.target.value}))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    placeholder="Product description with bullet points..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      value={newProduct.quantity || 1}
                      onChange={(e) => setNewProduct(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <ImageUpload
                  images={newProduct.images || []}
                  onChange={(newImages) => setNewProduct(prev => ({...prev, images: newImages}))}
                  maxImages={8}
                />
                
                {/* Cost Tracking Section */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">💰 Cost Tracking</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.purchase_cost || 0}
                        onChange={(e) => setNewProduct(prev => ({...prev, purchase_cost: parseFloat(e.target.value) || 0}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.shipping_cost || 0}
                        onChange={(e) => setNewProduct(prev => ({...prev, shipping_cost: parseFloat(e.target.value) || 0}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                      <input
                        type="date"
                        value={newProduct.purchase_date || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, purchase_date: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                      <input
                        type="text"
                        value={newProduct.supplier || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, supplier: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="Supplier name"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                      <input
                        type="text"
                        value={newProduct.tracking_number || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, tracking_number: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="Tracking number"
                      />
                    </div>
                  </div>
                  
                  {/* Cost Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Cost:</span>
                        <div className="font-semibold text-blue-600">
                          ${((newProduct.purchase_cost || 0) + (newProduct.shipping_cost || 0)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit per Unit:</span>
                        <div className={`font-semibold ${
                          ((newProduct.price || 0) - ((newProduct.purchase_cost || 0) + (newProduct.shipping_cost || 0))) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${((newProduct.price || 0) - ((newProduct.purchase_cost || 0) + (newProduct.shipping_cost || 0))).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit Margin:</span>
                        <div className="font-semibold text-purple-600">
                          {(newProduct.price || 0) > 0 ? 
                            (((newProduct.price || 0) - ((newProduct.purchase_cost || 0) + (newProduct.shipping_cost || 0))) / (newProduct.price || 0) * 100).toFixed(1) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddProduct(false)
                    setNewProduct({
                      sku: '',
                      title: '',
                      description: '',
                      quantity: 1,
                      price: 0,
                      images: [],
                      purchase_cost: 0,
                      shipping_cost: 0,
                      total_cost: 0,
                      purchase_date: '',
                      supplier: '',
                      tracking_number: ''
                    })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addProduct}
                  disabled={!newProduct.sku || !newProduct.title}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}