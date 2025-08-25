'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '../../../components/ImageUpload'

interface Product {
  sku: string
  title: string
  description: string
  quantity: number
  price?: number
  images: string
  status: 'live' | 'coming-soon' | 'draft'
  sale_state?: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
  drop_date?: string
  released_date?: string
  show_in_new_releases?: boolean
  show_in_featured?: boolean
  show_in_staff_picks?: boolean
  show_in_limited_editions?: boolean
  out_of_stock?: boolean
  show_in_featured_while_coming_soon?: boolean
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
  // Weight and dimensions for shipping
  weight?: number
  length?: number
  width?: number
  height?: number
}

interface ProductForm {
  sku: string
  title: string
  description: string
  quantity: number
  price?: number
  images: string[]
  status: 'live' | 'coming-soon' | 'draft'
  sale_state?: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
  drop_date?: string
  released_date?: string
  show_in_new_releases?: boolean
  show_in_featured?: boolean
  show_in_staff_picks?: boolean
  show_in_limited_editions?: boolean
  weight?: number
  length?: number
  width?: number
  height?: number
  out_of_stock?: boolean
  show_in_featured_while_coming_soon?: boolean
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
    show_in_new_releases: false,
    show_in_featured: false,
    show_in_staff_picks: false,
    show_in_limited_editions: false,
    out_of_stock: false,
    show_in_featured_while_coming_soon: false,
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
    show_in_new_releases: product.show_in_new_releases || false,
    show_in_featured: product.show_in_featured || false,
    show_in_staff_picks: product.show_in_staff_picks || false,
    show_in_limited_editions: product.show_in_limited_editions || false,
    out_of_stock: product.out_of_stock || false,
    show_in_featured_while_coming_soon: product.show_in_featured_while_coming_soon || false,
    purchase_cost: parseFloat(String(product.purchase_cost || 0)) || 0,
    shipping_cost: parseFloat(String(product.shipping_cost || 0)) || 0,
    total_cost: parseFloat(String(product.total_cost || 0)) || 0,
    purchase_date: product.purchase_date || '',
    supplier: product.supplier || '',
    tracking_number: product.tracking_number || ''
  })

  const formToProduct = (form: ProductForm): Product => ({
    ...form,
    images: form.images.join(', '),
    show_in_new_releases: form.show_in_new_releases || false,
    show_in_featured: form.show_in_featured !== false,
    show_in_staff_picks: form.show_in_staff_picks || false,
    show_in_limited_editions: form.show_in_limited_editions || false,
    out_of_stock: form.out_of_stock || false,
    show_in_featured_while_coming_soon: form.show_in_featured_while_coming_soon || false,
    total_cost: (form.purchase_cost || 0) + (form.shipping_cost || 0)
  })

  useEffect(() => {
    // Check authentication - in development mode, auto-set session storage
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        // Auto-authenticate in development
        sessionStorage.setItem('adminAuth', 'authenticated')
      } else if (!sessionStorage.getItem('adminAuth')) {
        router.push('/admin/login')
        return
      }
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

  const updateSaleState = async (sku: string, newSaleState: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED') => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, sale_state: newSaleState })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, sale_state: newSaleState } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update sale state:', error)
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


  const updateOutOfStockStatus = async (sku: string, outOfStock: boolean) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, out_of_stock: outOfStock.toString() })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, out_of_stock: outOfStock } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update out of stock status:', error)
    }
  }

  const updateStaffPicksStatus = async (sku: string, showInStaffPicks: boolean) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, show_in_staff_picks: showInStaffPicks.toString() })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, show_in_staff_picks: showInStaffPicks } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update staff picks status:', error)
    }
  }

  const updateLimitedEditionsStatus = async (sku: string, showInLimitedEditions: boolean) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, show_in_limited_editions: showInLimitedEditions.toString() })
      })
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.sku === sku ? { ...p, show_in_limited_editions: showInLimitedEditions } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update limited editions status:', error)
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
          status: 'live',
          show_in_new_releases: false,
          show_in_featured: false,
          show_in_staff_picks: false,
          show_in_limited_editions: false,
          out_of_stock: false,
          show_in_featured_while_coming_soon: false,
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
      <header className="bg-white shadow-sm border-b" role="banner">
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
              ${products.reduce((sum, p) => sum + ((typeof p.total_cost === 'number' ? p.total_cost : parseFloat(String(p.total_cost || 0)) || 0) * (p.quantity || 0)), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Potential Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">
              ${products.reduce((sum, p) => sum + ((p.price && typeof p.price === 'number' ? p.price : 0) * p.quantity), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Potential Profit</h3>
            <p className="text-2xl font-bold text-emerald-600">
              ${products.reduce((sum, p) => sum + (((p.price && typeof p.price === 'number' ? p.price : 0) - (typeof p.total_cost === 'number' ? p.total_cost : parseFloat(String(p.total_cost || 0)) || 0)) * (p.quantity || 0)), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Avg Profit Margin</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {products.length > 0 ? 
                (products.reduce((sum, p) => {
                  const margin = (p.price && p.price > 0) ? ((p.price - (p.total_cost || 0)) / p.price) * 100 : 0
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
            <table className="w-full" role="table" aria-label="Products inventory table">
              <thead className="bg-gray-50">
                <tr role="row">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Price / Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Profit/Unit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Drop Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    New Releases
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Homepage Sections
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Stock Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
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
                          💰 ${product.price && typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Cost: ${(typeof product.total_cost === 'number' ? product.total_cost : parseFloat(String(product.total_cost || 0)) || 0).toFixed(2)}
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
                          ((product.price && typeof product.price === 'number' ? product.price : 0) - (typeof product.total_cost === 'number' ? product.total_cost : parseFloat(String(product.total_cost || 0)) || 0)) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${((product.price && typeof product.price === 'number' ? product.price : 0) - (typeof product.total_cost === 'number' ? product.total_cost : parseFloat(String(product.total_cost || 0)) || 0)).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.price && typeof product.price === 'number' && product.price > 0 ? 
                            (((product.price - (typeof product.total_cost === 'number' ? product.total_cost : parseFloat(String(product.total_cost || 0)) || 0)) / product.price) * 100).toFixed(1) : 0}% margin
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={product.sale_state || 'LIVE'}
                        onChange={(e) => updateSaleState(product.sku, e.target.value as 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED')}
                        className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${
                          product.sale_state === 'LIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : product.sale_state === 'PREVIEW'
                            ? 'bg-purple-100 text-purple-800'
                            : product.sale_state === 'ARCHIVED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="DRAFT">⚪ Draft</option>
                        <option value="PREVIEW">🟣 Preview</option>
                        <option value="LIVE">🟢 Live</option>
                        <option value="ARCHIVED">🔴 Archived</option>
                      </select>
                      {product.sale_state === 'PREVIEW' && (
                        <div className="text-xs text-purple-600 mt-1">
                          Quantity is tracked as on-order units. Customers cannot purchase until Live.
                        </div>
                      )}
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
                      <div className="flex flex-wrap gap-1">
                        {/* Show active sections as colored tags */}
                        {(product.status === 'coming-soon' ? 
                          product.show_in_featured_while_coming_soon : 
                          product.show_in_featured !== false) && 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        }
                        {product.show_in_staff_picks && 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Staff Picks
                          </span>
                        }
                        {product.show_in_limited_editions && 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Limited Ed
                          </span>
                        }
                        {product.show_in_new_releases && 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New Release
                          </span>
                        }
                        {/* Show empty state if no sections selected */}
                        {!(product.status === 'coming-soon' ? 
                          product.show_in_featured_while_coming_soon : 
                          product.show_in_featured !== false) && 
                         !product.show_in_staff_picks && 
                         !product.show_in_limited_editions && 
                         !product.show_in_new_releases && 
                          <span className="text-xs text-gray-400 italic">None selected</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.out_of_stock && 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        }
                        {product.quantity === 0 && !product.out_of_stock && 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Qty: 0
                          </span>
                        }
                        {product.quantity > 0 && !product.out_of_stock && 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock ({product.quantity})
                          </span>
                        }
                      </div>
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
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct(prev => prev ? {...prev, price: e.target.value ? parseFloat(e.target.value) : undefined} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={editingProduct.quantity || ''}
                      onChange={(e) => setEditingProduct(prev => prev ? {...prev, quantity: e.target.value ? parseInt(e.target.value) : 0} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingProduct.weight || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, weight: e.target.value ? parseFloat(e.target.value) : 0.3} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Length (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingProduct.length || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, length: e.target.value ? parseFloat(e.target.value) : 4} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Width (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingProduct.width || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, width: e.target.value ? parseFloat(e.target.value) : 3} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingProduct.height || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, height: e.target.value ? parseFloat(e.target.value) : 5} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Used for accurate shipping cost calculation. Defaults: 0.3 lbs, 4"×3"×5"</p>
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
                        value={editingProduct.purchase_cost || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, purchase_cost: e.target.value ? parseFloat(e.target.value) : undefined} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.shipping_cost || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? {...prev, shipping_cost: e.target.value ? parseFloat(e.target.value) : undefined} : null)}
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
                          ${((parseFloat(String(editingProduct.purchase_cost || 0)) || 0) + (parseFloat(String(editingProduct.shipping_cost || 0)) || 0)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit per Unit:</span>
                        <div className={`font-semibold ${
                          ((editingProduct.price || 0) - ((editingProduct.purchase_cost || 0) + (editingProduct.shipping_cost || 0))) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${((parseFloat(String(editingProduct.price || 0)) || 0) - ((parseFloat(String(editingProduct.purchase_cost || 0)) || 0) + (parseFloat(String(editingProduct.shipping_cost || 0)) || 0))).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit Margin:</span>
                        <div className="font-semibold text-purple-600">
                          {(editingProduct.price || 0) > 0 ? 
                            (((parseFloat(String(editingProduct.price || 0)) || 0) - ((parseFloat(String(editingProduct.purchase_cost || 0)) || 0) + (parseFloat(String(editingProduct.shipping_cost || 0)) || 0))) / (parseFloat(String(editingProduct.price || 0)) || 1) * 100).toFixed(1) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                
                  {/* Section Visibility Controls */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Section Visibility</h4>
                    <div className="space-y-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.show_in_new_releases || false}
                          onChange={(e) => setEditingProduct(prev => prev ? {...prev, show_in_new_releases: e.target.checked} : null)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors mr-3 ${
                          editingProduct.show_in_new_releases 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}>
                          {editingProduct.show_in_new_releases && '✓'}
                        </div>
                        <span className="text-sm text-gray-700">Show in New Releases</span>
                      </label>
                      
                      {/* Homepage Sections */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Homepage Sections
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Featured Section */}
                          <div 
                            onClick={() => {
                              if (editingProduct.status === 'coming-soon') {
                                setEditingProduct(prev => prev ? {
                                  ...prev, 
                                  show_in_featured_while_coming_soon: !prev.show_in_featured_while_coming_soon
                                } : null)
                              } else {
                                setEditingProduct(prev => prev ? {
                                  ...prev, 
                                  show_in_featured: !prev.show_in_featured
                                } : null)
                              }
                            }}
                            className="cursor-pointer group"
                          >
                            <div className={`p-3 rounded-lg border-2 transition-all ${
                              (editingProduct.status === 'coming-soon' ? 
                                editingProduct.show_in_featured_while_coming_soon : 
                                editingProduct.show_in_featured !== false)
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm text-gray-800">Featured</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  (editingProduct.status === 'coming-soon' ? 
                                    editingProduct.show_in_featured_while_coming_soon : 
                                    editingProduct.show_in_featured !== false)
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {(editingProduct.status === 'coming-soon' ? 
                                    editingProduct.show_in_featured_while_coming_soon : 
                                    editingProduct.show_in_featured !== false) && 
                                    <span className="text-white text-xs">✓</span>
                                  }
                                </div>
                              </div>
                              <p className="text-xs text-gray-600">
                                {editingProduct.status === 'coming-soon' 
                                  ? 'Show as "coming soon" in main collection' 
                                  : 'Main homepage collection'
                                }
                              </p>
                            </div>
                          </div>


                          {/* Staff Picks Section */}
                          <div 
                            onClick={() => setEditingProduct(prev => prev ? {
                              ...prev, 
                              show_in_staff_picks: !prev.show_in_staff_picks
                            } : null)}
                            className="cursor-pointer group"
                          >
                            <div className={`p-3 rounded-lg border-2 transition-all ${
                              editingProduct.show_in_staff_picks
                                ? 'border-yellow-500 bg-yellow-50' 
                                : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-25'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm text-gray-800">Staff Picks</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  editingProduct.show_in_staff_picks
                                    ? 'border-yellow-500 bg-yellow-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {editingProduct.show_in_staff_picks && 
                                    <span className="text-white text-xs">✓</span>
                                  }
                                </div>
                              </div>
                              <p className="text-xs text-gray-600">Curated team favorites</p>
                            </div>
                          </div>

                          {/* Limited Editions Section */}
                          <div 
                            onClick={() => setEditingProduct(prev => prev ? {
                              ...prev, 
                              show_in_limited_editions: !prev.show_in_limited_editions
                            } : null)}
                            className="cursor-pointer group"
                          >
                            <div className={`p-3 rounded-lg border-2 transition-all ${
                              editingProduct.show_in_limited_editions
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm text-gray-800">Limited Editions</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  editingProduct.show_in_limited_editions
                                    ? 'border-red-500 bg-red-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {editingProduct.show_in_limited_editions && 
                                    <span className="text-white text-xs">✓</span>
                                  }
                                </div>
                              </div>
                              <p className="text-xs text-gray-600">Rare & exclusive items</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          Stock Status
                        </h4>
                        <div 
                          onClick={() => setEditingProduct(prev => prev ? {
                            ...prev, 
                            out_of_stock: !prev.out_of_stock
                          } : null)}
                          className="cursor-pointer group w-fit"
                        >
                          <div className={`p-3 rounded-lg border-2 transition-all ${
                            editingProduct.out_of_stock
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-gray-800">Out of Stock</span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                editingProduct.out_of_stock
                                  ? 'border-red-500 bg-red-500' 
                                  : 'border-gray-300'
                              }`}>
                                {editingProduct.out_of_stock && 
                                  <span className="text-white text-xs">✓</span>
                                }
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">Override quantity-based stock status</p>
                          </div>
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
                      
                      // Debug logging
                      console.log('Saving product data:', {
                        sku: productData.sku,
                        show_in_staff_picks: productData.show_in_staff_picks,
                        show_in_limited_editions: productData.show_in_limited_editions,
                        show_in_featured_while_coming_soon: productData.show_in_featured_while_coming_soon,
                        out_of_stock: productData.out_of_stock
                      })
                      
                      const response = await fetch('/api/admin/products', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                      })
                      
                      if (response.ok) {
                        const responseData = await response.json()
                        console.log('Server response:', responseData)
                        
                        setProducts(prev => prev.map(p => 
                          p.sku === editingProduct.sku ? productData : p
                        ))
                        setEditingProduct(null)
                        
                        // Reload the products to get fresh data from server
                        loadProducts()
                      } else {
                        console.error('Save failed with status:', response.status)
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
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct(prev => ({...prev, price: e.target.value ? parseFloat(e.target.value) : undefined}))}
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
                      value={newProduct.quantity || ''}
                      onChange={(e) => setNewProduct(prev => ({...prev, quantity: e.target.value ? parseInt(e.target.value) : 1}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.weight || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, weight: e.target.value ? parseFloat(e.target.value) : 0.3}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Length (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.length || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, length: e.target.value ? parseFloat(e.target.value) : 4}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Width (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.width || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, width: e.target.value ? parseFloat(e.target.value) : 3}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.height || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, height: e.target.value ? parseFloat(e.target.value) : 5}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Used for accurate shipping cost calculation. Defaults: 0.3 lbs, 4"×3"×5"</p>
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
                        value={newProduct.purchase_cost || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, purchase_cost: e.target.value ? parseFloat(e.target.value) : undefined}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.shipping_cost || ''}
                        onChange={(e) => setNewProduct(prev => ({...prev, shipping_cost: e.target.value ? parseFloat(e.target.value) : undefined}))}
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
                          ${((parseFloat(String(newProduct.purchase_cost || 0)) || 0) + (parseFloat(String(newProduct.shipping_cost || 0)) || 0)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit per Unit:</span>
                        <div className={`font-semibold ${
                          ((newProduct.price || 0) - ((newProduct.purchase_cost || 0) + (newProduct.shipping_cost || 0))) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${((parseFloat(String(newProduct.price || 0)) || 0) - ((parseFloat(String(newProduct.purchase_cost || 0)) || 0) + (parseFloat(String(newProduct.shipping_cost || 0)) || 0))).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit Margin:</span>
                        <div className="font-semibold text-purple-600">
                          {(newProduct.price || 0) > 0 ? 
                            (((parseFloat(String(newProduct.price || 0)) || 0) - ((parseFloat(String(newProduct.purchase_cost || 0)) || 0) + (parseFloat(String(newProduct.shipping_cost || 0)) || 0))) / (parseFloat(String(newProduct.price || 0)) || 1) * 100).toFixed(1) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Homepage Sections for New Product */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Homepage Sections
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Featured Section */}
                      <div 
                        onClick={() => setNewProduct(prev => ({
                          ...prev, 
                          show_in_featured: !prev.show_in_featured
                        }))}
                        className="cursor-pointer group"
                      >
                        <div className={`p-3 rounded-lg border-2 transition-all ${
                          newProduct.show_in_featured
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-800">Featured</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              newProduct.show_in_featured
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {newProduct.show_in_featured && 
                                <span className="text-white text-xs">✓</span>
                              }
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Main homepage collection</p>
                        </div>
                      </div>


                      {/* Staff Picks Section */}
                      <div 
                        onClick={() => setNewProduct(prev => ({
                          ...prev, 
                          show_in_staff_picks: !prev.show_in_staff_picks
                        }))}
                        className="cursor-pointer group"
                      >
                        <div className={`p-3 rounded-lg border-2 transition-all ${
                          newProduct.show_in_staff_picks
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-25'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-800">Staff Picks</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              newProduct.show_in_staff_picks
                                ? 'border-yellow-500 bg-yellow-500' 
                                : 'border-gray-300'
                            }`}>
                              {newProduct.show_in_staff_picks && 
                                <span className="text-white text-xs">✓</span>
                              }
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Curated team favorites</p>
                        </div>
                      </div>

                      {/* Limited Editions Section */}
                      <div 
                        onClick={() => setNewProduct(prev => ({
                          ...prev, 
                          show_in_limited_editions: !prev.show_in_limited_editions
                        }))}
                        className="cursor-pointer group"
                      >
                        <div className={`p-3 rounded-lg border-2 transition-all ${
                          newProduct.show_in_limited_editions
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-800">Limited Editions</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              newProduct.show_in_limited_editions
                                ? 'border-red-500 bg-red-500' 
                                : 'border-gray-300'
                            }`}>
                              {newProduct.show_in_limited_editions && 
                                <span className="text-white text-xs">✓</span>
                              }
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Rare & exclusive items</p>
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
                      status: 'live',
                      show_in_new_releases: false,
                      show_in_featured: false,
                      show_in_staff_picks: false,
                      show_in_limited_editions: false,
                      out_of_stock: false,
                      show_in_featured_while_coming_soon: false,
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