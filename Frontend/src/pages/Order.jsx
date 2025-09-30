import React, { useState, useEffect } from 'react';
import {
  Clock, Package, Calendar, CheckCircle2, ShoppingCart,
  Trash2, Plus, Minus, ChefHat, Bike
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ordersApi } from '../services/api';

const Order = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('cart');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderType, setOrderType] = useState('DINE-IN');
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);
  const navigate = useNavigate();

  const getCurrentUser = () => {
    const adminUser = localStorage.getItem('govardhanthal_admin_user');
    if (adminUser) {
      try {
        const admin = JSON.parse(adminUser);
        return { ...admin, isAdmin: true };
      } catch {
        return null;
      }
    }
    if (user) return { ...user, isAdmin: false };
    return null;
  };
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      setErrorOrders(null);
      try {
        const response = await ordersApi.getMyOrders();
        if (response.data.success) {
          setUserOrders(response.data.data.orders);
        } else {
          setErrorOrders(response.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        setErrorOrders('Network error while fetching orders');
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user]);

  const calculateCharges = () => {
    const subtotal = totalPrice;
    const serviceChargeRate = orderType === 'DINE-IN' ? 0.10 : 0.05; // 10% for dine-in, 5% for takeaway
    const serviceCharge = subtotal * serviceChargeRate;
    const gstRate = 0.09; // 9% GST
    const gst = subtotal * gstRate;
    const total = subtotal + serviceCharge + gst;
    return { 
      subtotal, 
      serviceCharge, 
      gst, 
      total, 
      serviceChargeRate: serviceChargeRate * 100, 
      gstRate: gstRate * 100 
    };
  };
  const charges = calculateCharges();

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      const result = await Swal.fire({
        title: 'Login Required',
        text: 'You need to login to place an order.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Login',
        confirmButtonColor: '#f97316'
      });
      if (result.isConfirmed) navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      Swal.fire({ icon: 'error', title: 'Empty Cart', text: 'Please add items before placing an order.' });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({ menuItem: item.id || item._id, quantity: item.quantity })),
        orderType,
        customerInfo: {
          name: currentUser.name || currentUser.fullName || 'Guest',
          email: currentUser.email || 'guest@example.com',
          phone: currentUser.phone || '9876543210'
        }
      };
      const response = await ordersApi.create(orderData);
      const result = response.data;

      if (result.success) {
        await Swal.fire({
          title: 'Order Placed Successfully!',
          text: `Order Number: ${result.data.orderNumber}`,
          icon: 'success',
          confirmButtonColor: '#f97316'
        });
        clearCart();
        setActiveTab('upcoming');
        setUserOrders(prev => [result.data, ...prev]);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Order Failed', text: err.message || 'Something went wrong' });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const upcomingOrders = userOrders.filter(o => o.status !== 'delivered');
  const pastOrders = userOrders.filter(o => o.status === 'delivered');

  const getStatusDetails = (status) => {
    switch (status) {
      case 'preparing': return { icon: <ChefHat className="w-5 h-5 text-orange-600" />, text: 'Preparing', color: 'text-orange-600', progress: 50 };
      case 'ready': return { icon: <Clock className="w-5 h-5 text-blue-600" />, text: 'Ready', color: 'text-blue-600', progress: 80 };
      case 'delivered': return { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, text: 'Delivered', color: 'text-green-600', progress: 100 };
      case 'confirmed': return { icon: <CheckCircle2 className="w-5 h-5 text-orange-600" />, text: 'Confirmed', color: 'text-orange-600', progress: 30 };
      default: return { icon: <Package className="w-5 h-5 text-gray-500" />, text: 'Pending', color: 'text-gray-500', progress: 10 };
    }
  };

  // Delete order function
  const deleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Delete Order',
      text: 'Are you sure you want to delete this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await ordersApi.deleteOrder(orderId);
        
        if (response.success) {
          // Optimistic update - remove from UI immediately
          setUserOrders(prev => prev.filter(order => order._id !== orderId));
          
          Swal.fire({
            title: 'Deleted!',
            text: 'Order has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.message || 'Failed to delete order',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Delete order error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete order. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            {activeTab === 'cart' ? '🛒 Cart' : activeTab === 'upcoming' ? '📦 My Orders' : '📜 Order History'}
          </h1>
          <p className="text-orange-100">
            {activeTab === 'cart' ? 'Manage your cart items' : activeTab === 'upcoming' ? 'Track your ongoing orders' : 'See your past orders'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-center gap-3 mb-8">
          <button onClick={() => setActiveTab('cart')} className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm ${activeTab === 'cart' ? 'bg-orange-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
            Cart {totalItems > 0 && `(${totalItems})`}
          </button>
          <button onClick={() => setActiveTab('upcoming')} className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm ${activeTab === 'upcoming' ? 'bg-orange-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
            Upcoming
          </button>
          <button onClick={() => setActiveTab('past')} className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm ${activeTab === 'past' ? 'bg-orange-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
            Past
          </button>
        </div>

        {/* Cart */}
        {activeTab === 'cart' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-12 h-12 mx-auto text-orange-600 mb-4" />
                <p className="text-gray-600">Your cart is empty</p>
                <button onClick={() => navigate('/menu')} className="mt-5 px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700">
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-4">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded hover:bg-gray-100"><Minus className="w-4 h-4" /></button>
                        <span className="min-w-[20px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Type Selection */}
                <div className={`rounded-lg p-4 mt-6 border-2 transition-colors ${
                  orderType === 'DINE-IN' 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    {orderType === 'DINE-IN' ? '🍽️' : '📦'} Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    <option value="DINE-IN">🍽️ Dine-in</option>
                    <option value="TAKEAWAY">📦 Takeaway</option>
                  </select>
                  <p className={`text-xs mt-2 font-medium ${
                    orderType === 'DINE-IN' ? 'text-orange-600' : 'text-blue-600'
                  }`}>
                    {orderType === 'DINE-IN' 
                      ? '✓ Service charge (10%) applies for dine-in orders' 
                      : '✓ Parcel charge (5%) applies for takeaway orders'
                    }
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Bill Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${charges.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {orderType === 'DINE-IN' 
                          ? `Service Charge (${charges.serviceChargeRate}%)` 
                          : `Parcel Charge (${charges.serviceChargeRate}%)`
                        }:
                      </span>
                      <span>${charges.serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Include GST ({charges.gstRate}%):</span>
                      <span>${charges.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2 mt-2 text-lg">
                      <span>Total:</span>
                      <span className={orderType === 'TAKEAWAY' ? 'text-green-600' : ''}>
                        ${charges.total.toFixed(2)}
                      </span>
                    </div>
                    {orderType === 'TAKEAWAY' && (
                      <p className="text-xs text-green-600 text-center mt-1">
                        💰 You save 5% compared to dine-in!
                      </p>
                    )}
                  </div>
                  <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full mt-5 py-3 bg-orange-600 text-white rounded-lg font-medium shadow hover:bg-orange-700">
                    {isPlacingOrder ? 'Placing Order...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Upcoming & Past Orders */}
        {(activeTab === 'upcoming' || activeTab === 'past') && (
          <div>
            {loadingOrders && <p className="text-center text-gray-600">Loading orders...</p>}
            {errorOrders && <p className="text-center text-red-600">{errorOrders}</p>}
            {!loadingOrders && !errorOrders && (
              <>
                {(activeTab === 'upcoming' ? upcomingOrders : pastOrders).length === 0 ? (
                  <p className="text-center text-gray-600 py-12">No {activeTab} orders found</p>
                ) : (
                  <div className="grid gap-6">
                    {(activeTab === 'upcoming' ? upcomingOrders : pastOrders).map(order => {
                      const status = getStatusDetails(order.status);
                      return (
                        <div key={order._id} className="bg-white rounded-xl shadow p-6">
                          <div className="flex justify-between items-center border-b pb-3 mb-3">
                            <div>
                              <p className="font-bold">Order #{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`flex items-center gap-1 text-sm font-medium ${status.color}`}>
                                {status.icon} {status.text}
                              </span>
                              <button
                                onClick={() => deleteOrder(order._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{i.quantity}x {i.name}</span>
                                <span>${i.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 font-bold">Total: ${order.totalAmount.toFixed(2)}</div>
                          {/* Progress Bar */}
                          {activeTab === 'upcoming' && (
                            <div className="w-full bg-gray-200 h-2 rounded mt-4">
                              <div className="h-2 rounded bg-orange-600 transition-all" style={{ width: `${status.progress}%` }}></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
