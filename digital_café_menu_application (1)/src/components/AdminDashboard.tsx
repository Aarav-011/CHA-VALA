import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AdminDashboardProps {
  onLogout: () => void;
  adminUser: any;
}

export function AdminDashboard({ onLogout, adminUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'stats' | 'export'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const allOrders = useQuery(api.orders.getAllOrders) || [];
  const orderStats = useQuery(api.orders.getOrderStats);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const filteredOrders = statusFilter === 'all' 
    ? allOrders 
    : allOrders.filter(order => order.status === statusFilter);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus as any });
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Email', 'Table', 'Type', 'Items', 'Net Amount', 'GST Amount', 'Total', 'Status', 'Payment Status', 'Date'];
    const csvData = filteredOrders.map(order => [
      order.orderId,
      order.customerName,
      order.customerPhone,
      order.customerEmail,
      order.tableNumber,
      order.orderType,
      order.items.map(item => `${item.name} x${item.quantity}`).join('; '),
      order.netAmount || 0,
      order.gstAmount || 0,
      order.totalAmount,
      order.status,
      order.paymentStatus,
      new Date(order._creationTime).toLocaleString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">☕</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-800">CHA VALA - Admin</h1>
              <p className="text-sm text-gray-600">Welcome, {adminUser.name}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            {[
              { id: 'orders', label: 'Orders', icon: '📋' },
              { id: 'stats', label: 'Statistics', icon: '📊' },
              { id: 'export', label: 'Export', icon: '📤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Tab */}
        {activeTab === 'stats' && orderStats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{orderStats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{orderStats.completedOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-amber-600">₹{orderStats.totalRevenue}</p>
                  <p className="text-xs text-gray-500">GST: ₹{orderStats.totalGST}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">₹{orderStats.todayRevenue}</p>
                  <p className="text-xs text-gray-500">GST: ₹{orderStats.todayGST}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Orders</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>📤</span>
                Export to CSV
              </button>
              <p className="text-sm text-gray-600">
                Export {filteredOrders.length} orders with GST details based on current filter
              </p>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {/* Status Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Filter by status:</span>
                <div className="flex gap-2">
                  {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
                  <p className="text-gray-600">No orders match the current filter.</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="grid gap-4 lg:grid-cols-4">
                      {/* Order Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">{order.orderId}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(order._creationTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Customer:</p>
                            <p className="font-medium">{order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Phone:</p>
                            <p className="font-medium">{order.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Table:</p>
                            <p className="font-medium">{order.tableNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Type:</p>
                            <p className="font-medium capitalize">{order.orderType.replace('-', ' ')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Items:</h5>
                        <div className="space-y-1 text-sm">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.name} x{item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="border-t pt-1 mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Net Amount:</span>
                              <span>₹{order.netAmount || 0}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>GST (18%):</span>
                              <span>₹{order.gstAmount || 0}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Total:</span>
                              <span>₹{order.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Update */}
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Update Status:</h5>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                          disabled={order.paymentStatus !== 'completed'}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                        {order.paymentStatus !== 'completed' && (
                          <p className="text-xs text-red-600 mt-1">
                            Payment must be completed to update status
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
