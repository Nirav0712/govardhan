import React from 'react';
import { Users, Utensils, Award, Clock } from 'lucide-react';
import Contact from '../components/Contact';



const About = () => {
  const stats = [
    { id: 1, name: 'Happy Customers', value: '5000+', icon: Users },
    { id: 2, name: 'Years Experience', value: '15+', icon: Clock },
    { id: 3, name: 'Menu Items', value: '100+', icon: Utensils },
    { id: 4, name: 'Awards Won', value: '25+', icon: Award },
  ];

  

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-orange-600 min-h-[500px] md:min-h-[400px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/Fast%20Food%203.jpg)'
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Our Story
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto font-medium drop-shadow">
              Discover the story behind Govardhan Thal
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center p-6 bg-orange-50 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4">
                  <stat.icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="mt-2 text-sm font-medium text-gray-600">{stat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Discover Our Heritage
              </h2>
              <p className="text-gray-600 mb-6">
              Govardhan Thal began as a humble dream in 1990 moved from Kadi, Gujarat (India) to Singapore. Bringing generations-old recipes and a passion for authentic Gujarati cuisine, they established what has now become one of the most beloved Gujarati restaurants in the area.
              </p>
              <p className="text-gray-600 mb-6">
              The name "Govardhan" is inspired by the sacred Govardhan hill in India, symbolizing abundance and nourishment—values we bring to every plate we serve.
              </p>
              <p className="text-gray-600 mb-6">
              Our mission is simple: to provide an authentic taste of Gujarat through carefully crafted dishes made with traditional methods and the finest ingredients.
              </p>
              <div className="mt-8">
                <a
                  href="/menu"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Explore Our Menu
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto rounded-lg shadow-xl overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    className="w-full h-full object-cover"
                    src="/images/about 1.png"
                    alt="Traditional Gujarati Thali"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="text-orange-600 text-5xl font-bold">15+</div>
                  <div className="text-gray-600 text-sm">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 mt-12 lg:mt-0">
              <div className="relative rounded-lg shadow-xl overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  alt="Fresh Ingredients"
                />
                <div className="absolute -bottom-6 -left-6 bg-orange-600 text-white p-4 rounded-lg shadow-lg">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm">Fresh Ingredients</div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6">
                At Govardhan Thal, our mission is to preserve and share the authentic taste of Gujarat while creating memorable dining experiences. We believe in the power of food to bring people together and create lasting memories.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-600">Source the freshest local ingredients</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-600">Maintain traditional cooking methods</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-600">Deliver exceptional service with a personal touch</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

     

      {/* CTA Section */}
      <div className="relative ">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: 'url(/images/dark.jpg)',
           
          }}
        />
        
        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">
            Experience Authentic Gujarati Cuisine
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto font-medium">
            Join us for a culinary journey through the rich flavors of Gujarat
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 z-20 relative">
            <a
              href="/reservation"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-semibold rounded-lg text-orange-600 bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-300 md:py-4 md:text-lg md:px-10"
            >
              Book a Table
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-semibold rounded-lg text-white bg-transparent  hover:bg-opacity-10 hover:scale-105 transition-all duration-300 md:py-4 md:text-lg md:px-10"
            >
              Contact Us
            </a>
          </div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30 z-0" />
      </div>

      {/* Contact Us */}
      <Contact/>
    </div>
  );
};

export default About;
