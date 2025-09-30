import React from 'react';
import { FaTruck, FaUtensils, FaLeaf,  } from 'react-icons/fa';
import { GoShieldCheck } from "react-icons/go";

const Services = () => {
  const services = [
    {
      id: 1,
      icon: <GoShieldCheck className="w-12 h-12 text-orange-500 mx-auto mb-4" />,
      title: "Premium Quality",
      description: "The quality and safety of our products is our top priority. We continue to quest for even greater product quality."
    },
    {
      id: 2,
      icon: <FaUtensils className="w-12 h-12 text-orange-500 mx-auto mb-4" />,
      title: "Always Fresh",
      description: "Botanica Shop is always committed to 100% fresh, organic food with certification of food safety."
    },
    {
      id: 3,
      icon: <FaLeaf className="w-12 h-12 text-orange-500 mx-auto mb-4" />,
      title: "Organic Farming",
      description: "Agricultural system that uses ecologically based pest controls and natural fertilizers derived from animals."
    },
   
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-orange-600">Services</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide the best services to make your dining experience memorable and satisfying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 p-4 rounded-full">
                  {service.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
