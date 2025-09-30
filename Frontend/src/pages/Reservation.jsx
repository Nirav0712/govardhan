import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Users, Phone, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';

const Reservation = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: '',
    phone: '',
    email: '',
    specialRequests: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in when they try to submit
    if (!user) {
      const result = await Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please log in with Google to complete your reservation.',
        showCancelButton: true,
        confirmButtonText: 'Login with Google',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#f97316'
      });

      if (result.isConfirmed) {
        navigate('/login');
      }
      return;
    }

    setIsLoading(true);

    try {
      // Create reservation directly without OTP
      const response = await fetch('https://www.govardhanthal.com/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          date: formData.date,
          time: formData.time,
          partySize: parseInt(formData.guests),
          specialRequests: formData.specialRequests,
          status: 'confirmed'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Reservation Confirmed!',
          html: `
            <div class="text-center">
              <p class="text-lg mb-3">Your table has been reserved successfully!</p>
              <div class="bg-orange-50 p-4 rounded-lg">
                <p class="font-semibold text-orange-800">Reservation Details:</p>
                <p class="text-gray-700 mt-2">Date: ${formData.date}</p>
                <p class="text-gray-700">Time: ${formData.time}</p>
                <p class="text-gray-700">Guests: ${formData.guests} people</p>
              </div>
              <p class="text-sm text-gray-600 mt-3">We'll see you soon!</p>
            </div>
          `,
          confirmButtonText: 'Done',
          confirmButtonColor: '#f97316'
        });

        // Reset form
        setFormData({
          date: '',
          time: '',
          guests: '2',
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          specialRequests: ''
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Reservation Failed',
          text: data.message || 'Unable to create reservation. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Reservation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Network error occurred. Please check your connection and try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Make a Reservation</h1>
          <p className="text-lg text-gray-600">Book your table and enjoy a delightful dining experience</p>
          {!user && (
            <p className="text-sm text-orange-600 mt-2">
              💡 You'll need to log in to complete your reservation
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Form Section */}
            <div className="p-8 md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservation Details</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="relative">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        required
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="relative">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        required
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="relative">
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="guests"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Person' : 'People'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="md:col-span-2 relative">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute top-3 left-3">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="specialRequests"
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleChange}
                        rows="3"
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="Any special requirements or preferences..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center
                      ${isLoading 
                        ? 'bg-orange-400 cursor-not-allowed' 
                        : 'bg-orange-600 hover:bg-orange-700'
                      } text-white`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Book a Table'
                    )}
                  </button>
                  {!user && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      You'll be asked to log in when you submit
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Contact Info Section */}
            <div className="hidden md:block md:w-1/3 bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500 to-orange-600 opacity-90"></div>
              <div className="relative h-full flex flex-col justify-center p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Contact Info</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-orange-200">Address</h3>
                    <p className="mt-1">470 Serangoon Road, Singapore 218143</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-200">Phone</h3>
                    <p className="mt-1">+65 1234 5678</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-200">Email</h3>
                    <p className="mt-1">info@govardhanthal.com</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-200">Opening Hours</h3>
                    <p className="mt-1">Monday - Friday: 11:00 AM - 10:00 PM</p>
                    <p>Saturday - Sunday: 10:00 AM - 11:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;