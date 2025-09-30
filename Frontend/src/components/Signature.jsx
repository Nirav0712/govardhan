import React, { useRef, useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaShoppingCart, FaClock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Signature = () => {
  const scrollContainer = useRef(null);
  const [favorites, setFavorites] = useState(new Set());
  const [visibleCards, setVisibleCards] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleAddToCart = (dish, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Remove any non-numeric characters except decimal point from price
    const price = parseFloat(dish.price.replace(/[^0-9.]/g, ''));
    
    // Check if item already exists in cart
    const existingItem = cartItems.find(item => item.id === dish.id);
    
    if (existingItem) {
      // If item exists, update the quantity
      updateQuantity(dish.id, existingItem.quantity + 1);
    } else {
      // If item doesn't exist, add it to cart
      addToCart({
        id: dish.id,
        name: dish.name,
        price: price,
        image: dish.image,
        quantity: 1
      });
    }
    
    // Open the cart sidebar
    setIsCartOpen(true);
    
    // Show a notification at the top of the page
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
    notification.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      ${dish.name} added to cart!
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 2 seconds with fade out effect
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 2000);
  };
  
  const dishes = [
    {
      id: 1,
      name: 'Undhiyu',
      description: 'A traditional Gujarati mixed vegetable dish, typically prepared in earthen pots.',
      price: '$12',
      image: '/images/Undhiyu.jpg',
    },
    {
      id: 2,
      name: 'Rajma',
     discription: 'Our signature unlimited thali with authentic Gujarati dishes including sweets, farsan, and more.',
      price: '$15',
      image: '/images/Rajma.jpg',
    },
    {
      id: 3,
      name: 'Jalebi',
     description: 'Traditional yogurt-based drink flavored with saffron, cardamom, and topped with nuts.',
      price: '$15',      
      image: '/images/Jalebi.jpg',
    },
   
    {
      id: 4,
      name: 'Samosa',
      
      price: '$08',
      
      image: '/images/Samosa.jpg',  
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards(prev => Math.max(prev, index + 1));
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.dish-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const { current } = scrollContainer;
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (dishId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(dishId)) {
        newFavorites.delete(dishId);
      } else {
        newFavorites.add(dishId);
      }
      return newFavorites;
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 w-3.5 h-3.5" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 w-3.5 h-3.5" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300 w-3.5 h-3.5" />);
      }
    }
    
    return stars;
  };

  

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-40 animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 text-sm font-semibold px-6 py-2 rounded-full mb-6 shadow-sm border border-orange-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
            Special Menu
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Our <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Signature</span> Dishes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Handpicked favorites that define the essence of authentic Gujarati cuisine, crafted with love and tradition
          </p>
        </div>

        {/* Cards Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button 
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-14 h-14 items-center justify-center rounded-full bg-white shadow-xl text-orange-500 hover:bg-orange-50 hover:shadow-2xl transition-all duration-300 group border border-orange-100"
            aria-label="Scroll left"
          >
            <FaChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <div 
            ref={scrollContainer}
            className="flex space-x-8 overflow-x-auto pb-8 -mx-4 px-4 lg:px-8 scrollbar-hide"
            style={{
              scrollSnapType: 'x mandatory',
              scrollPadding: '0 2rem',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {dishes.map((dish, index) => (
              <div 
                key={dish.id}
                data-index={index}
                className={`dish-card flex-shrink-0 w-80 sm:w-96 bg-white rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2 ${
                  index < visibleCards ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ 
                  scrollSnapAlign: 'start',
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  
                  {/* Overlay gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                 
                  
              
                  
                 
            
                 
                </div>
                
                {/* Content */}
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">{dish.name}</h3>
                   
                  </div>
                  
                
                  {/* Price section */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{dish.price}</span>
                      <span className="text-sm text-gray-400 line-through">{dish.originalPrice}</span>
                    </div>
                  </div>
                  
                  {/* Add to cart button */}
                  <button 
                    onClick={(e) => handleAddToCart(dish, e)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg hover:shadow-xl group/btn"
                  >
                    <FaShoppingCart className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                    <span>Add to Cart</span>
                    <div className="ml-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:rotate-180 transition-transform duration-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-14 h-14 items-center justify-center rounded-full bg-white shadow-xl text-orange-500 hover:bg-orange-50 hover:shadow-2xl transition-all duration-300 group border border-orange-100"
            aria-label="Scroll right"
          >
            <FaChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        
       
      </div>
      
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
      
      {/* Cart Sidebar */}
      <div 
        className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsCartOpen(false);
          }
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div 
          className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 -mr-2"
                aria-label="Close cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <FaShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-orange-600 font-semibold">${item.price.toFixed(2)}</p>
                        <div className="flex items-center mt-1">
                          <button 
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-orange-600 border rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, Math.max(1, item.quantity - 1));
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="mx-2 w-6 text-center">{item.quantity}</span>
                          <button 
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-orange-600 border rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button 
                        className="text-gray-400 hover:text-red-500 ml-4 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t">
              <div className="flex justify-between text-lg font-semibold mb-6">
                <span>Total:</span>
                <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                disabled={cartItems.length === 0}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  cartItems.length > 0 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className={`fixed bottom-8 right-8 ${
          cartItemCount > 0 
            ? 'bg-orange-600 hover:bg-orange-700' 
            : 'bg-gray-400 cursor-not-allowed'
        } text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 z-40`}
        aria-label="View cart"
        disabled={cartItemCount === 0}
      >
        <div className="relative">
          <FaShoppingCart className="text-2xl" />
          {cartItemCount > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
              {cartItemCount}
            </span>
          )}
        </div>
      </button>
    </section>
  );
};

export default Signature;