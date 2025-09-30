import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

const AppContext = createContext();

// API Base URL
export const API_BASE_URL = 'https://www.govardhanthal.com/api';

const initialState = {
  user: null,
  isLoading: false,
  pendingOtp: null,
  error: null
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    case 'SET_PENDING_OTP':
      return { ...state, pendingOtp: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, pendingOtp: null, error: null };
    default:
      return state;
  }
};

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cart state
  const [cart, setCart] = useState([]);

  // Session management
  const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [timeoutId, setTimeoutId] = useState(null);
  const [lastSessionExtension, setLastSessionExtension] = useState(Date.now());

  // Session timeout and activity tracking functions
  const resetSessionTimeout = async () => {
    const now = Date.now();
    setLastActivity(now);
    
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for automatic logout
    const newTimeoutId = setTimeout(() => {
      console.log('🕐 Session expired due to inactivity');
      handleLogout();
    }, SESSION_TIMEOUT);

    setTimeoutId(newTimeoutId);

    // Extend session on backend if user is logged in
    // Only extend if more than 5 minutes have passed since last extension
    const EXTENSION_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    if (state.user && (now - lastSessionExtension) > EXTENSION_THRESHOLD) {
      setLastSessionExtension(now);
      try {
        const { authApi } = await import('../services/api');
        await authApi.extendSession();
        console.log('🔄 Session extended on backend');
      } catch (error) {
        console.error('Failed to extend session on backend:', error);
      }
    }
  };

  const handleLogout = async () => {
    // Clear timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    // Call backend logout endpoint
    try {
      const { authApi } = await import('../services/api');
      await authApi.logout();
      console.log('🔄 Logged out from backend');
    } catch (error) {
      console.error('Failed to logout from backend:', error);
    }

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('govardhanthal_admin_authenticated');
    localStorage.removeItem('govardhanthal_admin_user');
    
    // Reset state
    dispatch({ type: 'LOGOUT' });
    
    // Clear cart
    setCart([]);
    
    console.log('🚪 User logged out');
  };

  // Activity tracking - reset timeout on user activity
  useEffect(() => {
    const trackActivity = () => {
      if (state.user) {
        setLastActivity(Date.now());
        resetSessionTimeout();
      }
    };

    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
    };
  }, [state.user]);

  // Initialize session timeout when user logs in
  useEffect(() => {
    if (state.user) {
      resetSessionTimeout();
    } else {
      // Clear timeout if no user
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [state.user]);

  // Page close logout functionality
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (state.user) {
        // Logout user when page is being closed/refreshed
        handleLogout();
        console.log('🚪 User logged out due to page close/refresh');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && state.user) {
        // Optional: Logout when tab becomes hidden (mobile browsers)
        // Uncomment the next line if you want logout on tab hide
        // handleLogout();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.user]);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // =========================
  // CART FUNCTIONS
  // =========================
  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i._id !== itemId));
  };

  const updateCartItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // =========================
  // AUTH FUNCTIONS
  // =========================
  const startRegistration = async (name, phone, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE_URL}/users/register/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password }),
      });
      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_PENDING_OTP', payload: { phone, name } });
        if (data.data?.testOtp) console.log(`🔐 OTP for testing: ${data.data.testOtp}`);
      }

      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const registerUser = async (name, email, phone, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await response.json();

      if (data.success) {
        // Store user ID and OTP for verification
        dispatch({ type: 'SET_PENDING_OTP', payload: { userId: data.data.userId, otp: data.data.otp, phone: data.data.phone } });
      }

      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyRegistrationOtp = async (userId, otp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await response.json();

      if (data.success) {
        // User is now verified and logged in
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        dispatch({ type: 'SET_USER', payload: data.data.user });
        dispatch({ type: 'CLEAR_PENDING_OTP' });
      }

      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyOtp = async (otp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (!state.pendingOtp?.phone) throw new Error('No pending OTP verification');

      const response = await fetch(`${API_BASE_URL}/users/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: state.pendingOtp.phone, otp }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        dispatch({ type: 'SET_USER', payload: data.data.user });
        dispatch({ type: 'SET_PENDING_OTP', payload: null });
      }

      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loginUser = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        dispatch({ type: 'SET_USER', payload: data.data.user });
        
        // Set auth token for API calls immediately
        const { setAuthToken } = await import('../services/api');
        setAuthToken(data.data.token);
        
        console.log('Login successful, token set:', data.data.token ? 'Yes' : 'No');
      }

      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    handleLogout();
  };

  // =========================
  // USERS & RESERVATION FUNCTIONS
  // =========================
  const getAllUsers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Check for admin token first, then fallback to regular token
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const token = adminToken || localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(`${API_BASE_URL}/users/admin/users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return { ok: data.success, message: data.message, users: data.users || [], total: data.total || 0 };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred', users: [], total: 0 };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createReservation = async (reservationData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE_URL}/reservations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });
      const data = await response.json();
      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyReservationOtp = async (reservationId, otp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE_URL}/reservations/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, otp }),
      });
      const data = await response.json();
      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resendReservationOtp = async (reservationId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE_URL}/reservations/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId }),
      });
      const data = await response.json();
      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getAllReservations = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Check for admin token first, then fallback to regular token
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const token = adminToken || localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/reservations/admin/all${queryParams ? `?${queryParams}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return { ok: data.success, message: data.message, data: data.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { ok: false, message: 'Network error occurred', data: { reservations: [], total: 0 } };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // =========================
  // MENU FUNCTIONS
  // =========================
  const getMenuItems = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu`);
      const data = await res.json();
      return { ok: res.ok, ...data };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  const getCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/categories`);
      const data = await res.json();
      return { ok: res.ok, ...data };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  const addMenuItem = async (item, file) => {
    try {
      const formData = new FormData();
      formData.append("name", item.name);
      formData.append("description", item.description);
      formData.append("price", item.price);
      formData.append("category", item.category);
      if (file) formData.append("image", file);

      // Use admin token for menu operations
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const token = adminToken || localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE_URL}/menu/admin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      return { ok: res.ok, ...data };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  const updateMenuItem = async (id, item, file) => {
    try {
      const formData = new FormData();
      formData.append("name", item.name);
      formData.append("description", item.description);
      formData.append("price", item.price);
      formData.append("category", item.category);
      if (file) formData.append("image", file);

      // Use admin token for menu operations
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const token = adminToken || localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE_URL}/menu/admin/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      return { ok: res.ok, ...data };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      // Use admin token for menu operations
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const token = adminToken || localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE_URL}/menu/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return { ok: res.ok, ...data };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  // =========================
  // CONTEXT VALUE
  // =========================
  const value = {
    ...state,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    API_BASE_URL,
    startRegistration,
    registerUser,
    verifyRegistrationOtp,
    verifyOtp,
    loginUser,
    logout,
    getAllUsers,
    createReservation,
    verifyReservationOtp,
    resendReservationOtp,
    getAllReservations,
    getMenuItems,
    getCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    clearCart,
    // Session management
    lastActivity,
    SESSION_TIMEOUT,
    resetSessionTimeout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppContextProvider');
  return context;
};

export default AppContext;
