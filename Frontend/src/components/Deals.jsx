import React, { useEffect, useState, useRef } from "react";
import { ArrowRight, Clock, Tag, Star, ChevronLeft, ChevronRight, Sparkles, Timer, TrendingUp, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const deals = [
  {
    id: 1,
    title: "Gujarati Thali",
    desc: "Experience the authentic taste of Gujarat with our special thali including dal, kadhi, vegetables, roti, rice, and sweets.",
    price: "12.00",
    image: "/images/gj.jpg",
    timeLeft: "03:45:30",
    bgColor: "from-orange-400/20 via-orange-300/10 to-amber-200/20",
    accentColor: "orange"
  },
  {
    id: 2,
    title: "Rajasthani Thali",
    desc: "Savor the royal flavors of Rajasthan with dal baati churma, gatte ki sabzi, and other traditional delicacies.",
    price: "15.00",
    image: "/images/rajasthani thali.jpg",
    timeLeft: "05:20:15",
    bgColor: "from-amber-400/20 via-yellow-300/10 to-orange-200/20",
    accentColor: "amber"
  },
  {
    id: 3,
    title: "Sp. Govardhan Thali",
    desc: "Our signature thali featuring a variety of seasonal vegetables, dals, and traditional sweets.",
    price: "16.00",
    image: "/images/sp. govardhan thali.png",
    timeLeft: "02:15:45",
    bgColor: "from-red-400/20 via-pink-300/10 to-rose-200/20",
    accentColor: "red"
  },
  {
    id: 4,
    title: "Punjabi Thali",
    desc: "Hearty Punjabi thali with sarson ka saag, makki roti, dal makhani, and more delicious items.",
    price: "14.00",
    image: "/images/punjabi thali.png",
    timeLeft: "04:30:00",
    bgColor: "from-yellow-400/20 via-amber-300/10 to-orange-200/20",
    accentColor: "yellow"
  }
];

const Deals = () => {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  
  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleAddToCart = (deal) => {
    addToCart({
      id: deal.id,
      name: deal.title,
      price: parseFloat(deal.price),
      image: deal.image,
      quantity: 1
    });
    
    toast.success(`${deal.title} added to cart!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      icon: '🛒',
      style: {
        background: '#fff',
        color: '#1f2937',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderRadius: '0.5rem',
        borderLeft: '4px solid #f97316',
      }
    });
  };
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);
  const intervalRef = useRef(null);

  // Auto-slide functionality
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % deals.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update active index when slide changes
  useEffect(() => {
    setActiveIndex(currentSlide);
  }, [currentSlide]);

  // Calculate time left for the current deal
  useEffect(() => {
    const timer = setInterval(() => {
      const [hours, minutes, seconds] = deals[activeIndex].timeLeft.split(':').map(Number);
      let totalSeconds = hours * 3600 + minutes * 60 + seconds - 1;
      
      if (totalSeconds >= 0) {
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        
        setTimeLeft({ days, hours, mins, secs });
        
        // Update the time left in the deals array
        const newTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        deals[activeIndex].timeLeft = newTime;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const nextSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentSlide((prev) => (prev + 1) % deals.length);
    // Restart auto-slide
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % deals.length);
    }, 5000);
  };

  const prevSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentSlide((prev) => (prev - 1 + deals.length) % deals.length);
    // Restart auto-slide
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % deals.length);
    }, 5000);
  };

  const goToSlide = (index) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentSlide(index);
    // Restart auto-slide
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % deals.length);
    }, 5000);
  };

  const currentDeal = deals[currentSlide];

  return (
    <section className="relative py-8 overflow-hidden min-h-screen flex items-center">
      <div className="toast-container">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08),transparent_50%)]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-red-300/15 to-pink-300/15 rounded-full blur-2xl animate-bounce" style={{animationDuration: '3s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-300/25 to-orange-300/25 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Compact Header */}
        <div className="text-center mb-8">
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
            Hot{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
                Deals
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 blur-lg -z-10 animate-pulse"></div>
            </span>{" "}
            of the Day
          </h2>
          
        </div>

        {/* Main Slider - Reduced Height */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-gray-900/10">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {deals.map((deal, index) => (
                <div 
                  key={deal.id} 
                  className={`w-full flex-shrink-0 bg-gradient-to-br ${deal.bgColor} relative overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,146,60,0.3),transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.25),transparent_50%)]"></div>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center p-6 sm:p-8 lg:p-12 min-h-[450px]">
                    {/* Content */}
                    <div className="space-y-4">
                     
                      {/* Title */}
                      <div>
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2 leading-none">
                          {deal.title}
                        </h3>
                      
                      </div>

                      {/* Description - Shortened */}
                      <p className="text-base text-gray-700 leading-relaxed max-w-xl line-clamp-2">
                        {deal.desc}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl sm:text-5xl font-black text-gray-900">
                          ${deal.price}
                        </span>
                       
                       
                      </div>

                      {/* Compact Timer */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                            <Timer className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-gray-800 font-semibold text-sm">
                            Hurry! Offer ends in:
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {Object.entries(timeLeft).map(([unit, value]) => (
                            <div key={unit} className="text-center">
                              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg p-2 min-w-[50px] shadow-lg">
                                <div className="text-lg sm:text-xl font-black">
                                  {value.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                                  {unit}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button - Compact */}
                      <button 
                        onClick={() => handleAddToCart(deal)}
                        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">Order Now</span>
                        <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </button>
                    </div>

                    {/* Image - Reduced Height */}
                    <div className="relative">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="w-full h-60 sm:h-72 lg:h-80 object-cover"
                        />
                      </div>

                      {/* Decorative Elements - Smaller */}
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-orange-400/40 to-red-400/40 rounded-full blur-xl animate-bounce"></div>
                      <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-6 gap-4">
            <button
              onClick={prevSlide}
              className="group p-2 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
            </button>

            <div className="flex gap-2">
              {deals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="group p-2 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <button
        onClick={() => cartItemCount > 0 && navigate('/order')}
        className={`fixed bottom-8 right-8 ${
          cartItemCount > 0 
            ? 'bg-orange-600 hover:bg-orange-700' 
            : 'bg-gray-400 cursor-not-allowed'
        } text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 z-20`}
        aria-label="View cart"
        disabled={cartItemCount === 0}
      >
        <div className="relative">
          <ShoppingCart className="text-2xl" />
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

export default Deals;