import { Phone, MapPin, Clock, Mail, Facebook, Instagram, Twitter, Heart } from 'lucide-react';
import {Link} from 'react-router-dom';

export default function Footer() {
  const quickLinks = [
    { id: 'home', name: 'Home', path: '/' },
    { id: 'about', name: 'About Us', path: '/about' },
    { id: 'menu', name: 'Menu', path: '/menu' },
    { id: 'order', name: 'Order', path: '/order' },
    { id: 'contact', name: 'Contact', path: '/contact' },
  ];

  const services = [
    
    { id: 'milkshake', name: 'Rajasthani Thali', path: '/menu' },
    { id: 'Sp. Govardhan Thali', name: 'Sp. Govardhan Thali', path: '/menu' },
    { id: 'Gujarati Thali', name: 'Gujarati Thali', path: '/menu' },
    { id: 'Punjabi Thali', name: 'Punjabi Thali', path: '/menu' },

  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">
                Govardhan Thal
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Authentic Gujarati cuisine served with love and tradition. Experience the rich flavors of Gujarat in every bite.
              </p>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-orange-600 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-orange-600 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    to={service.path}
                    className="text-gray-600 hover:text-orange-600 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-orange-600 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Access */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin</h3>
            <div className="space-y-4">
              <Link 
                to="/admin/login"
                className="text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors duration-300 block"
              >
                Admin Login
              </Link>
            </div>
          </div>

        </div>
      </div>

     

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="flex items-center mb-4 md:mb-0">
              <p>© 2024 Govardhan Thal. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for authentic Gujarati cuisine</span>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
