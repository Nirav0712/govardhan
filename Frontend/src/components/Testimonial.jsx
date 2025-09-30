import React, { useRef, useState } from 'react';
import { FaQuoteRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoMdStar, IoMdStarHalf, IoMdStarOutline } from 'react-icons/io';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Food Blogger',
      content: 'The food quality is exceptional! Every dish is prepared with fresh ingredients and authentic flavors. My family and I are regular customers now.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Local Resident',
      content: 'I love the variety of dishes they offer. The taste reminds me of home-cooked meals. The service is always friendly and prompt.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
  
    },
    {
      id: 3,
      name: 'Priya Patel',
      role: 'Food Critic',
      content: 'As someone who has tried countless restaurants, I can confidently say this place stands out. The balance of spices is perfect in every dish.',
      rating: 4,
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    
    },
    {
      id: 4,
      name: 'Priya Patel',
      role: 'Food Critic',
      content: 'As someone who has tried countless restaurants, I can confidently say this place stands out. The balance of spices is perfect in every dish.',
      rating: 4,
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    
    },
    {
      id: 5,
      name: 'Priya Patel',
      role: 'Food Critic',
      content: 'As someone who has tried countless restaurants, I can confidently say this place stands out. The balance of spices is perfect in every dish.',
      rating: 4,
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
  
    },
    {
      id: 6,
      name: 'Priya Patel',
      role: 'Food Critic',
      content: 'As someone who has tried countless restaurants, I can confidently say this place stands out. The balance of spices is perfect in every dish.',
      rating: 4,
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      
    }
  ];

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => {
      if (star <= rating) {
        return <IoMdStar key={star} className="text-yellow-400 w-5 h-5" />;
      } else if (star - 0.5 <= rating) {
        return <IoMdStarHalf key={star} className="text-yellow-400 w-5 h-5" />;
      } else {
        return <IoMdStarOutline key={star} className="text-yellow-400 w-5 h-5" />;
      }
    });
  };

  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigation = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-orange-100 text-orange-600 text-sm font-medium px-4 py-1 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Our <span className="text-orange-600">Customers</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear what our customers are saying about their experience with us.
          </p>
        </div>

        <div className="relative">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
              1280: {
                slidesPerView: 4,
              },
            }}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateNavigation(swiper);
            }}
            onSlideChange={(swiper) => updateNavigation(swiper)}
            className="w-full py-4"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="h-full group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-md"
                        src={testimonial.image} 
                        alt={testimonial.name}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1">
                        <FaQuoteRight className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{testimonial.date}</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                
                <p className="text-gray-600 relative pl-6">
                  <span className="absolute left-0 text-3xl text-orange-500 opacity-20 -top-2">"</span>
                  {testimonial.content}
                  <span className="absolute right-0 text-3xl text-orange-500 opacity-20 -bottom-4">"</span>
                </p>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Verified Purchase</span>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-orange-500 transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-orange-500 transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom Navigation Buttons */}
          <button 
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md text-orange-500 hover:bg-orange-50 transition-colors ${isBeginning ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Previous testimonial"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => swiperRef.current?.slideNext()}
            disabled={isEnd}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md text-orange-500 hover:bg-orange-50 transition-colors ${isEnd ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Next testimonial"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
        
       
      </div>
    </section>
  );
};

export default Testimonial;
