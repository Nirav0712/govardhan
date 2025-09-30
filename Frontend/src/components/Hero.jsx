import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <img
          className="w-full h-full object-cover object-center"
          src="/images/Fast Food 2.jpg"
          alt="Delicious Fast Food"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/heroimage.png';
          }}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Main Content with Buttons */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Text Content */}
        <div className="flex-1 flex items-start px-8 sm:px-12 md:px-16 lg:px-24 pt-24 sm:pt-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white">
              Discover Our <span className="text-orange-400">Delicious</span> Menu
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 mb-8 sm:mb-12 max-w-lg">
              Experience the perfect blend of authentic flavors and modern culinary art. Our chefs craft each dish with passion and the finest ingredients.
            </p>
          </div>
        </div>

        {/* Buttons Container */}
        <div className="button-container px-4 sm:px-8 md:px-12 lg:px-24 pb-12 sm:pb-16 w-full max-w-7xl mx-auto">
          <div className="button-wrapper flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
            <Link
              to="/reservation"
              className="cta-button group relative flex items-center justify-center px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 bg-orange-600 text-white font-medium rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 w-full sm:w-auto min-w-[160px] text-center"
            >
              <span className="relative z-10 flex items-center justify-center w-full">
                <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Book a Table</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            
            <Link
              to="/order"
              className="cta-button group relative flex items-center justify-center px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 bg-orange-600 text-white font-medium rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 w-full sm:w-auto min-w-[160px] text-center"
            >
              <span className="relative z-10 flex items-center justify-center w-full">
                <ShoppingBag className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Order Now</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </div>
        </div>
      </div>

     
     
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-12 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-orange-500 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        /* Custom styles for 320px screens */
        @media (max-width: 320px) {
          .button-container {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 1rem;
          }
          .button-wrapper {
            gap: 0.5rem;
          }
          .cta-button {
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
            min-width: 0;
          }
          .cta-button svg {
            width: 1rem;
            height: 1rem;
            margin-right: 0.375rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;
