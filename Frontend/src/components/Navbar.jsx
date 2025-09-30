import { useState } from 'react';
import { Menu, X, Phone, MapPin, Clock, ShoppingCart, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAppContext();
  
  // Check for both regular user and admin authentication
  const getCurrentUser = () => {
    // Check for admin user first
    const adminUser = localStorage.getItem('govardhanthal_admin_user');
    if (adminUser) {
      try {
        const admin = JSON.parse(adminUser);
        return { ...admin, isAdmin: true };
      } catch (error) {
        console.error('Error parsing admin user:', error);
      }
    }
    
    // Check for regular user
    if (user) {
      return { ...user, isAdmin: false };
    }
    
    return null;
  };

  const currentUser = getCurrentUser();

  const handleLogout = () => {
    if (currentUser?.isAdmin) {
      // Admin logout
      localStorage.removeItem('govardhanthal_admin_authenticated');
      localStorage.removeItem('govardhanthal_admin_user');
      window.location.href = '/';
    } else {
      // Regular user logout
      logout();
    }
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Menu", href: "/menu" },
    { name: "Order", href: "/order" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <div className="bg-white">
     

      {/* Main Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="flex items-center">
                
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
                    <Link to="/"> Govardhan Thal</Link>
                   
                  </h1>
                
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Link to="/reservation">Book Table</Link>
              </button>
              
                  {currentUser ? (
                    <div className="flex items-center space-x-3">
                      {!currentUser.isAdmin && (
                        <Link 
                          to="/my-orders"
                          className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300"
                        >
                          My Orders
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
              ) : (
                <button className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300">
                  <Link to="/login" className="flex items-center space-x-1">
                    <span>Login</span>
                  </Link>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile buttons */}
              <div className="pt-4 space-y-3">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-300">
                  <Link to="/reservation">Book Table</Link>
                </button>
                
                {currentUser ? (
                  <div className="space-y-2">
                    {!currentUser.isAdmin && (
                      <Link 
                        to="/my-orders"
                        className="w-full flex items-center justify-center px-4 py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        My Orders
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-4 py-3 rounded-lg font-medium transition-colors duration-300">
                    <Link to="/login">Login</Link>
                  </button>
                )}
              </div>
        
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}