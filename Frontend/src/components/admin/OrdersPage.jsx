import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { ordersApi } from "../../services/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Status");
  const [selectedOrder, setSelectedOrder] = useState(null); // for view popup

  useEffect(() => {
    fetchOrders();
  }, []);

  // Debug: Log orders state changes
  useEffect(() => {
    console.log('Orders state updated:', orders.length, 'orders');
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const res = await fetch("https://www.govardhanthal.com/api/orders/admin", {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.data.orders);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch (err) {
      toast.error("Server error while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update Order Status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const res = await fetch(`https://www.govardhanthal.com/api/orders/admin/${orderId}/status`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to update order status");
      }
    } catch (err) {
      toast.error("Server error while updating order status");
    }
  };

  // ✅ Delete Order
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      console.log('Deleting order with ID:', orderId);
      
      const response = await ordersApi.deleteOrder(orderId);
      
      if (response.success) {
        toast.success("Order deleted successfully");
        
        // Optimistic update - remove from UI immediately
        setOrders(prev => {
          const updatedOrders = prev.filter(order => order._id !== orderId);
          console.log('Orders after deletion:', updatedOrders.length, 'orders remaining');
          return updatedOrders;
        });
      } else {
        toast.error(response.message || "Failed to delete order");
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error("Server error while deleting order");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Preparing":
        return "bg-yellow-100 text-yellow-700";
      case "Pending":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders =
    filter === "All Status"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700">
          <ShoppingCart className="h-4 w-4" />
          New Order
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Search orders..."
              onChange={(e) =>
                setFilter(e.target.value ? e.target.value : "All Status")
              }
            />
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Preparing</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-6 text-gray-500">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="p-6 text-gray-500">No orders found</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.customerInfo?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status || "Pending"
                        )}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-500 hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-2 text-gray-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ✅ Order Popup (View Only) */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p>
                <span className="font-medium">Customer:</span>{" "}
                {selectedOrder.name}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedOrder.status}
              </p>
              <p>
                <span className="font-medium">Total:</span> $
                {selectedOrder.total}
              </p>
              <div className="border-t pt-3">
                <h3 className="font-semibold mb-2">Items:</h3>
                <ul className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>${item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;