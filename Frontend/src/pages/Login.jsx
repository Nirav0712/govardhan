import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Swal from 'sweetalert2';

// 🔹 Import Firebase
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Handle Google Login
  const handleGoogleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('🔥 Google user signed in:', user);

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
            title: 'Login Successful!',
            text: `Welcome ${user.displayName || 'User'}!`,
            confirmButtonText: 'Continue',
            timer: 2000,
            showConfirmButton: false
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
          title: 'Login Failed',
          text: 'Failed to authenticate with backend. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Google Login Failed',
        text: error.message || 'Unable to sign in with Google. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 py-8 px-6">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <LogIn className="h-10 w-10 text-white" />
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            </div>
            <p className="text-center text-orange-100 text-sm">
              Sign in to access your Govardhan Thal account
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Sign in with Google
              </h3>
              <p className="text-gray-600 text-sm">
                Quick, secure, and easy access to your account
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 border-2 border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-orange-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-6 w-6 mr-3"
                  />
                  Continue with Google
                </>
              )}
            </button>

            {/* Info Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Why Google Sign-In?</p>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    <li>• No password to remember</li>
                    <li>• Secure authentication by Google</li>
                    <li>• Quick and easy access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;