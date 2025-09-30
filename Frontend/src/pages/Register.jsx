import React, { useState } from 'react';
import { User, Mail, Phone, Lock, UserPlus, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Swal from 'sweetalert2';

// 🔹 Import Firebase
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, verifyRegistrationOtp, pendingOtp } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOtpStep) {
      // Step 1: Register user and show OTP
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'Passwords do not match. Please try again.',
        });
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        Swal.fire({
          icon: 'error',
          title: 'Weak Password',
          text: 'Password must be at least 6 characters long.',
        });
        return;
      }

      // Validate email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          text: 'Please enter a valid email address.',
        });
        return;
      }

      // Validate phone number
      if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Phone Number',
          text: 'Please enter a valid 10-digit phone number starting with 6-9.',
        });
        return;
      }

      setIsLoading(true);

      try {
        // Register user
        const registerResult = await registerUser(formData.name, formData.email, formData.phone, formData.password);
        
        if (registerResult.ok) {
          // Show OTP in SweetAlert
          await Swal.fire({
            icon: 'info',
            title: 'OTP Verification Required',
            html: `
              <div class="text-center">
                <p class="mb-4">We've sent a verification code to your phone.</p>
                <div class="bg-orange-50 p-4 rounded-lg mb-4">
                  <p class="text-lg font-bold text-orange-800">Your OTP: ${registerResult.data.otp}</p>
                  <p class="text-sm text-orange-600">Valid for 5 minutes</p>
                </div>
                <p class="text-sm text-gray-600">Please enter this OTP below to complete registration.</p>
              </div>
            `,
            confirmButtonText: 'Got it!',
            confirmButtonColor: '#f97316'
          });

          // Move to OTP step
          setIsOtpStep(true);
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: registerResult.message || 'Something went wrong. Please try again.',
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Something went wrong. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Step 2: Verify OTP
      if (!otp || otp.length !== 6) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: 'Please enter a valid 6-digit OTP.',
        });
        return;
      }

      setIsLoading(true);

      try {
        const verifyResult = await verifyRegistrationOtp(pendingOtp.userId, otp);
        
        if (verifyResult.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Your account has been created and verified successfully. You are now logged in!',
            confirmButtonText: 'Continue'
          });

          // Redirect to home page
          navigate('/');
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            text: verifyResult.message || 'Invalid OTP. Please try again.',
          });
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: 'Something went wrong. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 🔹 Handle Google Sign-Up/Sign-In
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('🔥 Google user signed up:', user);

      // Get Firebase ID token
      const firebaseIdToken = await user.getIdToken();
      console.log('🔑 Firebase ID token retrieved:', firebaseIdToken ? 'Yes' : 'No');
      
      // Store Firebase token in localStorage
      localStorage.setItem('firebaseToken', firebaseIdToken);

      // 🔹 Send Firebase token to backend for session management
      try {
        const backendResponse = await fetch("https://www.govardhanthal.com/api/auth/google", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${firebaseIdToken}`
          },
          body: JSON.stringify({ 
            token: firebaseIdToken,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL
          })
        });

        const backendData = await backendResponse.json();
        console.log('📡 Backend response:', backendData);

        if (backendResponse.ok && backendData.success) {
          // Store backend JWT token and user data
          if (backendData.token) {
            localStorage.setItem('token', backendData.token);
            console.log('💾 Backend JWT token stored');
          }
          
          if (backendData.user) {
            localStorage.setItem('user', JSON.stringify(backendData.user));
            console.log('👤 User data stored:', backendData.user);
          }
          
          // Set auth token for API calls
          const { setAuthToken } = await import('../services/api');
          setAuthToken(backendData.token);
          console.log('🔐 Auth token set for API calls');

          // Show success message
          await Swal.fire({
            icon: 'success',
            title: 'Google Sign-Up Successful!',
            html: `
              <div class="text-center">
                <p class="mb-2">Welcome to Govardhan Thal!</p>
                <div class="bg-orange-50 p-3 rounded-lg">
                  <p class="font-semibold text-orange-800">${user.displayName || 'User'}</p>
                  <p class="text-sm text-orange-600">${user.email}</p>
                </div>
                <p class="mt-3 text-sm text-gray-600">You have been automatically signed in!</p>
              </div>
            `,
            confirmButtonText: 'Continue',
            confirmButtonColor: '#f97316',
            timer: 2000
          });

          // Navigate to home and reload to update state
          window.location.href = '/';
        } else {
          throw new Error(backendData.message || 'Backend authentication failed');
        }
      } catch (backendError) {
        console.error('❌ Backend integration failed:', backendError);
        await Swal.fire({
          icon: 'error',
          title: 'Sign-Up Failed',
          text: 'Failed to authenticate with backend. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Unable to sign up with Google. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up was cancelled. Please try again if you want to continue.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email. Please sign in instead.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      await Swal.fire({
        icon: 'error',
        title: 'Google Sign-Up Failed',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f97316'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-orange-600 py-4 px-6">
          <div className="flex items-center justify-center space-x-2">
            <UserPlus className="h-8 w-8 text-white" />
            <h2 className="text-2xl font-bold text-white">
              {isOtpStep ? 'Verify Phone' : 'Create Account'}
            </h2>
          </div>
          <p className="mt-1 text-center text-orange-100 text-sm">
            {isOtpStep ? 'Enter the verification code' : 'Join Govardhan Thal family today!'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!isOtpStep ? (
            // Registration Form
            <>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Email Address"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Phone Number (10 digits)"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Password"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="text-orange-600 hover:text-orange-500 font-medium">Terms</a> and <a href="#" className="text-orange-600 hover:text-orange-500 font-medium">Privacy Policy</a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              {/* 🔹 Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* 🔹 Google Sign-Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-5 w-5 mr-2"
                />
                Sign up with Google
              </button>
            </>
          ) : (
            // OTP Verification Form
            <>
              <div className="text-center mb-6">
                <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Verify Your Phone</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Enter the 6-digit code sent to {formData.phone}
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !otp || otp.length !== 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="text-sm text-orange-600 hover:text-orange-500 font-medium"
                >
                  ← Back to Registration
                </button>
              </div>
            </>
          )}
        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;