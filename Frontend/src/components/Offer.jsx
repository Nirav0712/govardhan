import React from 'react';
import { Star, ShoppingCart, Clock, Plus } from 'lucide-react';

const Offer = () => {
    const offers = [
        {
            id: 1,
            title: 'Gujarati Thali',
           
            price: '$12',
            
            image: '/images/gj.jpg',
          
            
        },
        {
            id: 2,
            title: 'Punjabi Thali',
           
            price: '$12',
        
            image: '/images/thal 2.jpg',
            
         
        },
        {
            id: 3,
            title: 'Special Govardhan Thali',
           
            price: '$16',
            
            image: '/images/sp. govardhan thali.png',
            
         
        },
        {
            id: 4,
            title: 'Rajasthani Thali',
           
            price: '$12',
            
            image: '/images/rajasthani thali.jpg',
            
            
        }
    ];

    return (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Today's <span className="text-orange-600">Special Offers</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover our delicious thali options with exclusive discounts for today only!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            {/* Image with Badge */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={offer.image}
                                    alt={offer.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                
                              
                            </div>

                            {/* Content */}
                            <div className="p-3 text-center">
                                <div className="flex justify-center items-center ">
                                    <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>
                                   
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 ">
                                    {offer.description}
                                </p>

                                <div className="flex justify-center text-center">
                                    <div>
                                        <span className="text-xl font-bold text-center text-orange-600">{offer.price}</span>
                                       
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Offer;
