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
  show_in_new_releases: boolean
  show_in_featured: boolean
  show_in_staff_picks: boolean
  show_in_limited_editions: boolean
  out_of_stock: boolean
  show_in_featured_while_coming_soon: boolean
  // Cost tracking fields
  purchase_cost?: number
  shipping_cost?: number
  total_cost?: number
  purchase_date?: string
  supplier?: string
  tracking_number?: string
  weight?: number
  length?: number
  width?: number
  height?: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState<ProductForm>({
    sku: '',
    title: '',
    description: '',
    quantity: 0,
    price: undefined,
    images: [],
    status: 'draft',
    sale_state: 'DRAFT',
    drop_date: '',
    released_date: '',
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
  })

  const formToProduct = (form: ProductForm): Omit<Product, 'sku'> & { sku?: string } => ({
    ...form,
    images: form.images.join(', '),
    show_in_new_releases: form.show_in_new_releases ?? false,
    show_in_featured: form.show_in_featured ?? false,
    show_in_staff_picks: form.show_in_staff_picks ?? false,
    show_in_limited_editions: form.show_in_limited_editions ?? false,
    out_of_stock: form.out_of_stock ?? false,
    show_in_featured_while_coming_soon: form.show_in_featured_while_coming_soon ?? false,
    total_cost: (form.purchase_cost || 0) + (form.shipping_cost || 0)
  })

  useEffect(() => {
    // Check authentication - in development mode, auto-set session storage
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        // Auto-set session storage for development
        if (!sessionStorage.getItem('adminAuth')) {
          sessionStorage.setItem('adminAuth', 'dev-admin')
        }
      } else {
        // Production authentication check
        const hasAuth = sessionStorage.getItem('adminAuth') || sessionStorage.getItem('tempAdminAccess')
        if (!hasAuth) {
          window.location.href = '/admin-bypass'
          return
        }
      }
      
      // Load products after auth check
      loadProducts()
    }
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        console.error('Failed to load products')
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setForm(productToForm(product))
    setShowAddForm(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setForm({
      sku: '',
      title: '',
      description: '',
      quantity: 0,
      price: undefined,
      images: [],
      status: 'draft',
      sale_state: 'DRAFT',
      drop_date: '',
      released_date: '',
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
    setShowAddForm(true)
  }

  const handleClearPastDates = async () => {
    if (!confirm('Clear all past release dates? Products will remain in coming soon but without dates.')) {
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/cleanup-dates', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        alert(`Successfully cleared ${result.updated} past release dates`)
        loadProducts() // Reload to show updated data
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error clearing past dates:', error)
      alert('Failed to clear past dates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = formToProduct(form)
      const response = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          originalSku: editingProduct?.sku
        }),
      })

      if (response.ok) {
        await loadProducts()
        setShowAddForm(false)
        setEditingProduct(null)
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
      } else {
        const error = await response.text()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (sku: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products?sku=${encodeURIComponent(sku)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadProducts()
        alert('Product deleted successfully!')
      } else {
        const error = await response.text()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="text-center mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleClearPastDates}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg font-medium"
            >
              Clear Past Dates
            </button>
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Add New Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.sku}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.description?.substring(0, 100)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'live' ? 'bg-green-100 text-green-800' :
                        product.status === 'coming-soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price ? `$${product.price}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.sku)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        required
                        value={form.sku}
                        onChange={(e) => setForm({...form, sku: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price || ''}
                        onChange={(e) => setForm({...form, price: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={form.quantity}
                        onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Status
                      </label>
                      <select
                        value={form.sale_state || 'DRAFT'}
                        onChange={(e) => {
                          const saleState = e.target.value as 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
                          // Auto-set the status field based on sale_state for consistency
                          const status = saleState === 'PREVIEW' ? 'coming-soon' : 'live'
                          setForm({...form, sale_state: saleState, status})
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="DRAFT">Draft (Hidden)</option>
                        <option value="PREVIEW">Coming Soon (Preview)</option>
                        <option value="LIVE">Live (In Stock)</option>
                        <option value="ARCHIVED">Archived (Hidden)</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Choose "Coming Soon" to display products in the coming soon section
                      </p>
                    </div>
                  </div>

                  {/* Release Date - only show when status is PREVIEW/Coming Soon */}
                  {form.sale_state === 'PREVIEW' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Release Date (Optional)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="datetime-local"
                          value={form.release_at ? new Date(form.release_at).toISOString().slice(0, 16) : ''}
                          onChange={(e) => {
                            setForm({
                              ...form, 
                              release_at: e.target.value ? new Date(e.target.value).toISOString() : null
                            })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({...form, release_at: null})}
                          className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Clear
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Optional release date for coming soon products. Leave empty to hide date.
                      </p>
                    </div>
                  )}

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    <ImageUpload
                      images={form.images}
                      onChange={(images) => setForm({...form, images})}
                      maxImages={5}
                    />
                  </div>

                  {/* Checkboxes for different sections */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Display Settings</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.show_in_featured}
                          onChange={(e) => setForm({...form, show_in_featured: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.show_in_staff_picks}
                          onChange={(e) => setForm({...form, show_in_staff_picks: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Staff Picks</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.show_in_limited_editions}
                          onChange={(e) => setForm({...form, show_in_limited_editions: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Limited Edition</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.show_in_new_releases}
                          onChange={(e) => setForm({...form, show_in_new_releases: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">New Releases</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.out_of_stock}
                          onChange={(e) => setForm({...form, out_of_stock: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.show_in_featured_while_coming_soon}
                          onChange={(e) => setForm({...form, show_in_featured_while_coming_soon: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured While Coming Soon</span>
                      </label>
                    </div>
                  </div>

                  {/* Cost tracking fields */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Cost Tracking (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purchase Cost ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.purchase_cost || ''}
                          onChange={(e) => setForm({...form, purchase_cost: e.target.value ? parseFloat(e.target.value) : 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shipping Cost ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.shipping_cost || ''}
                          onChange={(e) => setForm({...form, shipping_cost: e.target.value ? parseFloat(e.target.value) : 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier
                        </label>
                        <input
                          type="text"
                          value={form.supplier || ''}
                          onChange={(e) => setForm({...form, supplier: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weight and dimensions for shipping */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Shipping Info</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (lbs)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.weight || ''}
                          onChange={(e) => setForm({...form, weight: e.target.value ? parseFloat(e.target.value) : 0.3})}
                          placeholder="0.3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Length (in)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.length || ''}
                          onChange={(e) => setForm({...form, length: e.target.value ? parseFloat(e.target.value) : undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Width (in)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.width || ''}
                          onChange={(e) => setForm({...form, width: e.target.value ? parseFloat(e.target.value) : undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (in)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.height || ''}
                          onChange={(e) => setForm({...form, height: e.target.value ? parseFloat(e.target.value) : undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}