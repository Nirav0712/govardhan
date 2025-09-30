

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Calendar,
  DollarSign,
  Users,
  Bell,
  Settings,
  Eye,
  Edit,
  Loader2,
  Clock,
  TrendingUp,
  Package,
  ArrowUpRight,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordersApi, reservationApi, setAdminToken } from "../../services/api";
import { toast } from "react-toastify";

// Real API calls using fetch
const api = {
  get: async (url, config = {}) => {
    const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    const response = await fetch(`https://www.govardhanthal.com/api${url}`, {
      method: 'GET',
      headers,
      ...config
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  },
  
  delete: async (url, config = {}) => {
    const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    const response = await fetch(`https://www.govardhanthal.com/api${url}`, {
      method: 'DELETE',
      headers,
      ...config
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }
};

const formatUSD = (value) => `$${Number(value).toFixed(2)}`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [todaysReservations, setTodaysReservations] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [reservationsError, setReservationsError] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const refreshOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);

      const response = await ordersApi.getAdminOrders({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
      
      if (response.data.success) {
        const orders = response.data.data.orders || [];
        setRecentOrders(orders);
      } else {
        setOrdersError(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        setOrdersError("Authentication failed. Please log in again.");
        toast.error("Session expired. Please log in again.");
        // Clear invalid token and redirect to login
        localStorage.removeItem('govardhanthal_admin_authenticated');
        localStorage.removeItem('govardhanthal_admin_user');
        navigate('/admin/login');
      } else {
        setOrdersError("Failed to fetch orders");
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const refreshReservations = async () => {
    try {
      setReservationsLoading(true);
      setReservationsError(null);

      const response = await api.get("/reservations/today");
      const data = await response.json();

      if (data.success) {
        const reservations = data.data.reservations || [];
        setTodaysReservations(reservations);
      } else {
        setReservationsError(data.message || "Failed to fetch reservations");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      
      if (error.message?.includes('401')) {
        setReservationsError("Authentication failed. Please log in again.");
      } else {
        setReservationsError("Failed to fetch reservations");
      }
    } finally {
      setReservationsLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get("/orders/admin/stats");
      const data = await response.json();
      
      if (data.success) {
        setOrderStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      refreshOrders(),
      refreshReservations(),
      fetchOrderStats()
    ]);
  };

  // View order function
  const viewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Update order status function
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await ordersApi.updateStatus(orderId, newStatus);
      
      if (response.success) {
        // Optimistic update - update status in UI immediately
        setRecentOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(response.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Delete order function
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await ordersApi.deleteOrder(orderId);
      
      if (response.success) {
        // Optimistic update - remove from UI immediately
        setRecentOrders(prev => prev.filter(order => order._id !== orderId));
        // Refresh stats to update totals
        fetchOrderStats();
        toast.success("Order deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  useEffect(() => {
    // Ensure admin token is set for API calls
    const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
    if (adminToken) {
      setAdminToken(adminToken);
      console.log('Admin token set for dashboard API calls');
    } else {
      console.error('No admin token found - redirecting to login');
      navigate('/admin/login');
      return;
    }
    
    refreshOrders();
    refreshReservations();
    fetchOrderStats();
  }, [navigate]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalReservationsToday = todaysReservations.length;
  const confirmedReservationsToday = todaysReservations.filter(
    (r) => r.status?.toLowerCase() === "confirmed"
  ).length;
  const totalGuestsToday = todaysReservations.reduce(
    (sum, r) => sum + (r.partySize || 0),
    0
  );

  const stats = [
    {
      name: "Total Revenue",
      value: orderStats?.overall?.totalRevenue || 0,
      change: orderStats?.today?.todayRevenue ? `+$${orderStats.today.todayRevenue.toFixed(2)}` : "$0.00",
      changeLabel: "today",
      changeType: "positive",
      icon: DollarSign,
      bgColor: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      name: "Orders Today",
      value: orderStats?.today?.todayOrders || 0,
      change: orderStats?.overall?.totalOrders || 0,
      changeLabel: "total",
      changeType: "neutral",
      icon: ShoppingCart,
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Reservations",
      value: totalReservationsToday,
      change: confirmedReservationsToday,
      changeLabel: "confirmed",
      changeType: "positive",
      icon: Calendar,
      bgColor: "bg-purple-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      name: "Total Guests",
      value: totalGuestsToday,
      change: totalReservationsToday,
      changeLabel: "bookings",
      changeType: "neutral",
      icon: Users,
      bgColor: "bg-orange-500",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "preparing":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getReservationStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'N/A';
      
      if (timeString.includes('T') || timeString.includes('Z')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch {
      return timeString || 'N/A';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString || 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sidebar Navigation - Fixed Left */}
      <div className="fixed left-0 top-0 h-full w-20 bg-white border-r border-gray-200 hidden lg:flex flex-col items-center py-6 space-y-8 z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 flex flex-col items-center space-y-6">
          <button className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors">
            <Users className="w-5 h-5" />
          </button>
        </div>
        <button className="w-12 h-12 rounded-xl hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-20 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live updates • Last refresh: just now
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-3 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={refreshAllData}
                disabled={ordersLoading || statsLoading || reservationsLoading}
                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {(ordersLoading || statsLoading || reservationsLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                Refresh Data
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="relative group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.lightBg} p-3 rounded-xl`}>
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {typeof stat.value === "number" && stat.name.includes("Revenue")
                        ? formatUSD(stat.value)
                        : stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${stat.textColor}`}>
                        {typeof stat.change === "number" ? stat.change : stat.change}
                      </span>
                      <span className="text-xs text-gray-500">{stat.changeLabel}</span>
                      {stat.changeType === "positive" && (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Orders - Takes 2 columns */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">Latest customer orders</p>
                  </div>
                  <button className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-3" />
                    <span className="text-gray-600">Loading orders...</span>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-medium mb-1">Error loading orders</p>
                    <p className="text-sm text-gray-500">{ordersError}</p>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">No orders yet</p>
                    <p className="text-sm text-gray-500">Recent orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order, index) => (
                      <div
                        key={order._id}
                        className="group flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 border border-transparent hover:border-orange-200 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white font-bold text-sm">
                                {(order.customerInfo?.name || order.user?.name || 'N/A')
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-gray-100">
                              <span className="text-xs font-bold text-gray-600">#{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {order.customerInfo?.name || order.user?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-sm text-gray-500">
                              #{order._id.slice(-6)} • {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatUSD(order.totalAmount)}
                            </p>
                            <span
                              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                                order.status || "Pending"
                              )}`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => viewOrder(order._id)}
                              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                              title="View Order"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              title="Update Status"
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
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Today's Reservations - Takes 1 column */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-gray-900">Reservations</h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                    {totalReservationsToday}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Today's bookings</p>
              </div>
              <div className="p-6">
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {reservationsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-3" />
                      <span className="text-gray-600">Loading...</span>
                    </div>
                  ) : reservationsError ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-8 w-8 text-red-600" />
                      </div>
                      <p className="text-red-600 font-medium mb-1">Error loading</p>
                      <p className="text-sm text-gray-500 mb-3">{reservationsError}</p>
                      <button
                        onClick={refreshReservations}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : todaysReservations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-medium mb-1">No reservations</p>
                      <p className="text-sm text-gray-500">Today's bookings will appear here</p>
                    </div>
                  ) : (
                    todaysReservations.map((reservation) => (
                      <div
                        key={reservation._id}
                        className="p-4 rounded-xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{reservation.name}</p>
                            <p className="text-xs text-gray-500">#{reservation._id.slice(-6)}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full border flex-shrink-0 ${getReservationStatusColor(
                              reservation.status || "pending"
                            )}`}
                          >
                            {reservation.status || "pending"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {formatTime(reservation.time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {reservation.partySize}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate">{reservation.phone}</span>
                          <span className="flex-shrink-0">{formatDate(reservation.date)}</span>
                        </div>
                        {reservation.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-600 italic">
                              "{reservation.notes.substring(0, 60)}
                              {reservation.notes.length > 60 ? "..." : ""}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {todaysReservations.length > 0 && (
                  <button 
                    onClick={() => navigate('/admin/reservations')}
                    className="w-full mt-4 py-3 text-sm font-medium text-orange-600 hover:text-white hover:bg-orange-600 border-2 border-orange-200 hover:border-orange-600 rounded-xl transition-all"
                  >
                    View All Reservations
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;