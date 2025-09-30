import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, MapPin, User, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../services/api';
import Swal from 'sweetalert2';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { cart, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cash',
    orderType: 'dine-in'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const serviceCharge = formData.orderType === 'dine-in' ? subtotal * 0.10 : subtotal * 0.05;
  const gst = subtotal * 0.09;
  const total = subtotal + serviceCharge + gst;

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0) {
      navigate('/menu');
      return;
    }

    // Pre-fill user data if logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user, cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        customerDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          }
        },
        orderType: formData.orderType,
        paymentMethod: formData.paymentMethod,
        subtotal,
        serviceCharge,
        gst,
        total
      };

      const response = await ordersApi.create(orderData);

      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          html: `
            <div class="text-center">
              <p class="mb-3">Your order has been confirmed!</p>
              <div class="bg-orange-50 p-3 rounded-lg">
                <p class="font-semibold text-orange-800">Order #${response.data.data.orderNumber}</p>
                <p class="text-sm text-orange-600">Total: ₹${total.toFixed(2)}</p>
              </div>
              <p class="mt-3 text-sm text-gray-600">We'll contact you shortly for confirmation.</p>
            </div>
          `,
          confirmButtonText: 'Continue Shopping',
          confirmButtonColor: '#f97316'
        });

        // Clear cart and redirect
        clearCart();
        navigate('/my-orders');
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Order Failed',
          text: response.data.message || 'Failed to place order. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: 'Something went wrong. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Menu
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{formData.orderType === 'dine-in' ? 'Service Charge (10%):' : 'Parcel Charge (5%):'}</span>
                  <span>₹{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (9%):</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-orange-600" />
                  Customer Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Type *
                    </label>
                    <select
                      name="orderType"
                      value={formData.orderType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="dine-in">Dine-in</option>
                      <option value="takeaway">Takeaway</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                  Delivery Address
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                  Payment Method
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <span>Card Payment</span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
