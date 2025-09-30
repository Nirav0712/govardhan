import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminPanelLayout from './admin/AdminPanelLayout';

const AdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists and is valid
    const token = localStorage.getItem('govardhanthal_admin_authenticated');
    const user = localStorage.getItem('govardhanthal_admin_user');
    
    if (token && user) {
      try {
        // Basic token validation (you can add more sophisticated checks)
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          // Clear invalid data
          localStorage.removeItem('govardhanthal_admin_authenticated');
          localStorage.removeItem('govardhanthal_admin_user');
        }
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        localStorage.removeItem('govardhanthal_admin_authenticated');
        localStorage.removeItem('govardhanthal_admin_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Listen for storage changes and custom events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'govardhanthal_admin_authenticated') {
        const token = localStorage.getItem('govardhanthal_admin_authenticated');
        const user = localStorage.getItem('govardhanthal_admin_user');
        
        if (token && user) {
          try {
            const userData = JSON.parse(user);
            if (userData.role === 'admin') {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          } catch (error) {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    };

    const handleLoginSuccess = () => {
      const token = localStorage.getItem('govardhanthal_admin_authenticated');
      const user = localStorage.getItem('govardhanthal_admin_user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === 'admin') {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminLoginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminLoginSuccess', handleLoginSuccess);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminPanelLayout>{children}</AdminPanelLayout>;
};

export default AdminAuth;
