'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PurchaseOrder {
  id: string
  purchase_date: string
  supplier: string
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number?: string
  total_product_cost: number
  allocated_shipping_cost: number
  total_cost: number
  notes?: string
  created_at: string
}

interface Shipment {
  id: string
  shipment_date: string
  total_shipping_cost: number
  tracking_numbers: string
  notes?: string
  allocated: boolean
  created_at: string
}

export default function PurchasesPage() {
  const router = useRouter()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'shipments'>('orders')
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false)

  // New Purchase Order Form
  const [newOrder, setNewOrder] = useState(() => ({
    purchase_date: new Date().toISOString().split('T')[0],
    supplier: '',
    notes: '',
    items: [{ 
      id: `item-${Date.now()}`,
      product_sku: '', 
      product_name: '', 
      quantity: 1, 
      unit_cost: 0,
      is_set: false,
      figures_per_set: 6,
      total_set_price: 0
    }]
  }))

  // New Shipment Form
  const [newShipment, setNewShipment] = useState(() => ({
    shipment_date: new Date().toISOString().split('T')[0],
    total_shipping_cost: 0,
    tracking_numbers: '',
    notes: '',
    allocate_immediately: true
  }))

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined' && !sessionStorage.getItem('adminAuth')) {
      router.push('/admin/login')
      return
    }
    
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const [ordersRes, shipmentsRes] = await Promise.all([
        fetch('/api/admin/purchase-orders'),
        fetch('/api/admin/shipments')
      ])
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setPurchaseOrders(ordersData.purchase_orders || [])
      }
      
      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json()
        setShipments(shipmentsData || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addOrderItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...(prev.items || []), { 
        id: `item-${Date.now()}-${Math.random()}`,
        product_sku: '', 
        product_name: '', 
        quantity: 1, 
        unit_cost: 0,
        is_set: false,
        figures_per_set: 6,
        total_set_price: 0
      }]
    }))
  }

  const removeOrderItem = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }))
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    setNewOrder(prev => ({
      ...prev,
      items: (prev.items || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const createPurchaseOrder = async () => {
    try {
      const response = await fetch('/api/admin/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      })
      
      if (response.ok) {
        await loadData()
        setShowNewOrderModal(false)
        setNewOrder({
          purchase_date: new Date().toISOString().split('T')[0],
          supplier: '',
          notes: '',
          items: [{ 
            id: `item-${Date.now()}`,
            product_sku: '', 
            product_name: '', 
            quantity: 1, 
            unit_cost: 0,
            is_set: false,
            figures_per_set: 6,
            total_set_price: 0
          }]
        })
      }
    } catch (error) {
      console.error('Failed to create purchase order:', error)
    }
  }

  const createShipment = async () => {
    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipment)
      })
      
      if (response.ok) {
        await loadData()
        setShowNewShipmentModal(false)
        setNewShipment({
          shipment_date: new Date().toISOString().split('T')[0],
          total_shipping_cost: 0,
          tracking_numbers: '',
          notes: '',
          allocate_immediately: true
        })
      }
    } catch (error) {
      console.error('Failed to create shipment:', error)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pop-purple mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading purchases...</p>
        </div>
      </div>
    )
  }

  const totalOrderValue = purchaseOrders.reduce((sum, order) => sum + (parseFloat(order.total_cost) || 0), 0)
  const totalShippingCosts = shipments.reduce((sum, shipment) => sum + (parseFloat(shipment.total_shipping_cost) || 0), 0)
  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending').length
  const unallocatedShipments = shipments.filter(shipment => !shipment.allocated).length

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
            <h1 className="text-2xl font-bold text-gray-900">Purchase Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Order Value</h3>
            <p className="text-2xl font-bold text-blue-600">${totalOrderValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Shipping</h3>
            <p className="text-2xl font-bold text-purple-600">${totalShippingCosts.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-pop-purple text-pop-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Purchase Orders ({purchaseOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('shipments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shipments'
                    ? 'border-pop-purple text-pop-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Shipments ({shipments.length})
                {unallocatedShipments > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {unallocatedShipments} unallocated
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                {activeTab === 'orders' ? 'Purchase Orders' : 'Shipping Costs'}
              </h2>
              <button
                onClick={() => activeTab === 'orders' ? setShowNewOrderModal(true) : setShowNewShipmentModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                {activeTab === 'orders' ? 'New Purchase Order' : 'Record Shipping Cost'}
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'orders' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Product Cost</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Shipping</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.purchase_date}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.supplier}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${(parseFloat(order.total_product_cost) || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${(parseFloat(order.allocated_shipping_cost) || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">${(parseFloat(order.total_cost) || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Shipment ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Shipping Cost</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{shipment.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{shipment.shipment_date}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">${(parseFloat(shipment.total_shipping_cost) || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{shipment.tracking_numbers || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            shipment.allocated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {shipment.allocated ? 'Allocated' : 'Unallocated'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create Purchase Order</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={newOrder.purchase_date}
                    onChange={(e) => setNewOrder(prev => ({...prev, purchase_date: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    value={newOrder.supplier}
                    onChange={(e) => setNewOrder(prev => ({...prev, supplier: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3">Items</h4>
                
                {(newOrder.items || []).map((item, index) => (
                  <div key={item.id || `item-${index}`} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Product SKU</label>
                        <input
                          type="text"
                          placeholder="SKU123"
                          value={item.product_sku}
                          onChange={(e) => updateOrderItem(index, 'product_sku', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          placeholder="Labubu Series 1 Complete Set"
                          value={item.product_name}
                          onChange={(e) => updateOrderItem(index, 'product_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Type Selection */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Item Type</label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!item.is_set}
                            onChange={() => updateOrderItem(index, 'is_set', false)}
                            className="mr-2"
                          />
                          <span className="text-sm">Single Item</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={item.is_set}
                            onChange={() => updateOrderItem(index, 'is_set', true)}
                            className="mr-2"
                          />
                          <span className="text-sm">Figure Set (6-8 pieces)</span>
                        </label>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    {item.is_set ? (
                      /* Set Pricing */
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Sets Bought</label>
                          <input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Figures per Set</label>
                          <select
                            value={item.figures_per_set}
                            onChange={(e) => {
                              const figuresPerSet = parseInt(e.target.value)
                              updateOrderItem(index, 'figures_per_set', figuresPerSet)
                              // Recalculate unit cost when figures per set changes
                              if (item.total_set_price > 0) {
                                updateOrderItem(index, 'unit_cost', item.total_set_price / figuresPerSet)
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent text-sm"
                          >
                            <option value={6}>6 figures</option>
                            <option value={7}>7 figures</option>
                            <option value={8}>8 figures</option>
                            <option value={9}>9 figures</option>
                            <option value={10}>10 figures</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Total Set Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="95.99"
                            min="0"
                            value={item.total_set_price}
                            onChange={(e) => {
                              const setPrice = parseFloat(e.target.value) || 0
                              updateOrderItem(index, 'total_set_price', setPrice)
                              // Auto-calculate per figure cost
                              updateOrderItem(index, 'unit_cost', setPrice / item.figures_per_set)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Per Figure Cost</label>
                          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-800">
                            ${(item.unit_cost || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Single Item Pricing */
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="15.99"
                            min="0"
                            value={item.unit_cost}
                            onChange={(e) => updateOrderItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Total Cost</label>
                          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-800">
                            ${(item.quantity * (item.unit_cost || 0)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary and Remove */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                      <div className="text-sm text-gray-600">
                        {item.is_set ? (
                          <span>
                            <strong>{item.quantity} set(s)</strong> × <strong>{item.figures_per_set} figures</strong> = 
                            <strong className="text-purple-600"> {item.quantity * item.figures_per_set} total figures</strong> 
                            @ ${(item.unit_cost || 0).toFixed(2)} each
                          </span>
                        ) : (
                          <span>
                            <strong>{item.quantity} item(s)</strong> @ ${(item.unit_cost || 0).toFixed(2)} each
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeOrderItem(index)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        disabled={(newOrder.items || []).length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Total Calculation */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold text-blue-800">
                    Total Order Value: ${newOrder.items ? newOrder.items.reduce((sum, item) => {
                      if (item.is_set) {
                        return sum + (item.quantity * (item.total_set_price || 0))
                      } else {
                        return sum + (item.quantity * (item.unit_cost || 0))
                      }
                    }, 0).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    *Shipping costs will be allocated separately when recorded
                  </div>
                </div>
                <button
                  onClick={addOrderItem}
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
                >
                  + Add Item
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({...prev, notes: e.target.value}))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Order notes..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createPurchaseOrder}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Shipment Modal */}
      {showNewShipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Record Shipping Cost</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipment Date</label>
                  <input
                    type="date"
                    value={newShipment.shipment_date}
                    onChange={(e) => setNewShipment(prev => ({...prev, shipment_date: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Shipping Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newShipment.total_shipping_cost}
                    onChange={(e) => setNewShipment(prev => ({...prev, total_shipping_cost: parseFloat(e.target.value) || 0}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pop-purple focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Numbers</label>
                <input
                  type="text"
                  value={newShipment.tracking_numbers}
                  onChange={(e) => setNewShipment(prev => ({...prev, tracking_numbers: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Comma-separated tracking numbers"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newShipment.allocate_immediately}
                    onChange={(e) => setNewShipment(prev => ({...prev, allocate_immediately: e.target.checked}))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Automatically allocate to purchase orders from this date</span>
                </label>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowNewShipmentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createShipment}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Record Shipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}