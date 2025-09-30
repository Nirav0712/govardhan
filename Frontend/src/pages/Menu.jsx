import React, { useState, useEffect, useMemo } from 'react';
import { FiShoppingCart, FiPlus, FiFilter, FiChevronDown, FiChevronUp, FiX, FiLoader } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const { addToCart, cartItems, totalItems } = useCart();
  const { getMenuItems, getCategories } = useAppContext();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get quantities from cart items
  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId || item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };
  
  // Handle add to cart
  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    // Ensure the item has the correct ID format for cart
    const cartItem = {
      ...item,
      id: item._id || item.id // Use _id from API or fallback to id
    };
    addToCart(cartItem);
    console.log('Added to cart:', cartItem);
    // Show a small notification or toast that item was added (optional)
    // You can implement a toast notification here if desired
  };
  
  // Calculate total items in cart (using from context)
  // const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Import API service
        const { menuApi } = await import('../services/api');
        
        // Fetch menu items
        const menuResponse = await menuApi.list();
        
        if (menuResponse.data?.success) {
          const menuItems = menuResponse.data.data || [];
          setMenuItems(menuItems);
          
          // Extract unique categories from menu items
          const apiCategories = [...new Set(menuItems.map(item => item.category))];
          
          // Merge with default categories and remove duplicates
          const defaultCats = [
            "Welcome Drinks", "Milk Shake", "Raita", "Rice", "Thali",
            "Gujarati Sabzi", "Punjabi Sabzi", "South Indian", "Chinese",
            "Snacks", "Desserts"
          ];
          const mergedCategories = [...new Set([...defaultCats, ...apiCategories])];
          setCategories(mergedCategories);
        } else {
          setError(menuResponse.data?.message || 'Failed to fetch menu items');
          // Fallback to default categories
          setCategories([
            "Welcome Drinks", "Milk Shake", "Raita", "Rice", "Thali",
            "Gujarati Sabzi", "Punjabi Sabzi", "South Indian", "Chinese",
            "Snacks", "Desserts"
          ]);
        }
      } catch (err) {
        console.error('Error fetching menu data:', err);
        
        // Check if it's a network error (server not running)
        if (err.code === 'ERR_NETWORK' || err.message.includes('ERR_CONNECTION_REFUSED')) {
          setError('Server is not running. Please start the backend server on port 5000.');
        } else {
          setError('Failed to load menu. Please try again.');
        }
        
        // Set fallback data
        setMenuItems([]);
        setCategories([
          "Welcome Drinks", "Milk Shake", "Raita", "Rice", "Thali",
          "Gujarati Sabzi", "Punjabi Sabzi", "South Indian", "Chinese",
          "Snacks", "Desserts"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transform categories array to include descriptions and icons
  const categoryData = useMemo(() => categories.map(category => ({
    id: category,
    name: category,
    description: getCategoryDescription(category),
    icon: getCategoryIcon(category)
  })), [categories]);

  // Helper function to get category descriptions
  function getCategoryDescription(category) {
    const descriptions = {
      'Milk Shake': 'Refreshing and creamy milk-based drinks',
      'Raita': 'Cool and refreshing yogurt-based side dishes',
      'Rice': 'Aromatic and flavorful rice preparations',
      'Thali': 'Complete traditional meals with multiple dishes',
      'Gujarati Sabzi': 'Flavorful Gujarati vegetable preparations',
      'Punjabi Sabzi': 'Rich and hearty Punjabi vegetable dishes',
      'Chinese': 'Delicious Chinese cuisine favorites',
      'Snacks': 'Quick bites and appetizers',
      'South Indian': 'Authentic South Indian delicacies',
      'Desserts': 'Sweet endings to your meal',
      'Welcome Drinks': 'Refreshing welcome beverages'
    };
    return descriptions[category] || 'Delicious dishes from our kitchen';
  }

  // Helper function to get category icons
  function getCategoryIcon(category) {
    const icons = {
      'Milk Shake': '🥤',
      'Raita': '🥒',
      'Rice': '🍚',
      'Thali': '🍽️',
      'Gujarati Sabzi': '🥬',
      'Punjabi Sabzi': '🥘',
      'Chinese': '🥢',
      'Snacks': '🍿',
      'South Indian': '🍛',
      'Desserts': '🍰',
      'Welcome Drinks': '🥤'
    };
    return icons[category] || '🍽️';
  }


  // Initialize expanded categories state
  useEffect(() => {
    if (categoryData.length > 0) {
      const initialExpandedState = {};
      categoryData.forEach(cat => {
        initialExpandedState[cat.id] = true;
      });
      setExpandedCategories(initialExpandedState);
    } else {
      // Fallback: initialize with default categories
      const defaultCategories = [
        "Welcome Drinks", "Milk Shake", "Raita", "Rice", "Thali",
        "Gujarati Sabzi", "Punjabi Sabzi", "South Indian", "Chinese",
        "Snacks", "Desserts"
      ];
      const initialExpandedState = {};
      defaultCategories.forEach(cat => {
        initialExpandedState[cat] = true;
      });
      setExpandedCategories(initialExpandedState);
    }
  }, [categoryData]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Filter items based on search query and active category
  const getFilteredItems = (categoryId) => {
    return menuItems.filter(item => {
      const matchesCategory = item.category === categoryId;
      const matchesSearch = searchQuery === '' || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  // Check if any items match the search query in any category
  const hasSearchResults = searchQuery === '' || 
    menuItems.some(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get categories that have items matching the search query
  const visibleCategories = searchQuery === '' 
    ? categoryData 
    : categoryData.filter(cat => 
        menuItems.some(item => 
          item.category === cat.id && 
          (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );

  // Filter menu items based on active category and search query
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).map(item => ({
    ...item,
    quantity: getItemQuantity(item._id || item.id)
  }));

  // Calculate cart total (using from context)
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-orange-600/90 to-orange-700/90 text-white" style={{
        backgroundImage: ' url("/images/Fast%20Food.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold  text-center mb-4">Our Exquisite Menu</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-2xl text-center">
            Discover our handcrafted dishes made with the finest  <br/> ingredients and authentic recipes from around the world.
          </p>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <div className={`sticky top-0 z-10 bg-white shadow-md transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-2 space-x-2 hide-scrollbar">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveCategory('all');
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === 'all' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categoryData.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  const element = document.getElementById(`category-${category.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  setActiveCategory(category.id);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors flex items-center ${
                  activeCategory === category.id 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Your Favorite Dishes</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for dishes, ingredients, or categories..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          
        </div>
      </div>

      {/* Menu Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FiLoader className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Loading Menu...</h3>
            <p className="text-gray-500 mt-2">Please wait while we fetch the latest menu items</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-medium text-red-600">Error Loading Menu</h3>
            <p className="text-gray-500 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : !hasSearchResults ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-medium text-gray-700">No items found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {visibleCategories.map(category => {
              const categoryItems = getFilteredItems(category.id);
              if (categoryItems.length === 0 && searchQuery) return null;
              
              const isExpanded = expandedCategories[category.id] !== false;
              
              return (
                <div key={category.id} id={`category-${category.id}`} className="scroll-mt-24">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-6"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <span className="mr-3">{category.icon}</span>
                        {category.name}
                        <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {searchQuery ? categoryItems.length : menuItems.filter(item => item.category === category.id).length} items
                        </span>
                      </h2>
                      <p className="text-gray-500 ml-10 mt-1">{category.description}</p>
                    </div>
                    {isExpanded ? (
                      <FiChevronUp className="text-gray-500 text-xl" />
                    ) : (
                      <FiChevronDown className="text-gray-500 text-xl" />
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryItems.map(item => (
                        <div 
                          key={item._id || item.id} 
                          className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${
                            item.isPopular ? 'border-2 border-orange-300' : 'border-gray-100'
                          }`}
                        >
                          <div className="relative">
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={item.image || '/images/placeholder.jpg'} 
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                onError={(e) => {
                                  e.target.src = '/images/placeholder.jpg';
                                }}
                              />
                            </div>
                            {item.isPopular && (
                              <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Popular
                              </div>
                            )}
                            <div className="absolute top-3 right-3 flex flex-col space-y-2">
                              {item.isVeg && (
                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  Veg
                                </span>
                              )}
                              {item.isSpicy && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  Spicy
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <div className="flex justify-between items-start">
                              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                              <span className="text-lg font-bold text-orange-600">${Number(item.price).toFixed(2)}</span>
                            </div>
                            
                            <p className="text-gray-600 mt-2 mb-4">{item.description}</p>
                            
                            {item.size && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Size:</p>
                                <div className="flex space-x-2">
                                  {item.size.map((size, index) => (
                                    <button 
                                      key={index}
                                      className="px-3 py-1 text-sm border rounded-full hover:bg-orange-50 border-orange-200 text-orange-700"
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle favorite
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                                >
                                 
                                </button>
                               
                              </div>
                              
                              <button
                                onClick={(e) => handleAddToCart(item, e)}
                                className="bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                              >
                                <FiPlus className="text-lg" />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 ? (
        <a
          href="/order"
          className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 z-20"
          aria-label="View cart"
        >
          <div className="relative">
            <FiShoppingCart className="text-2xl" />
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
              {totalItems}
            </span>
          </div>
        </a>
      ) : (
        <button
          className="fixed bottom-8 right-8 bg-gray-400 cursor-not-allowed text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 z-20"
          aria-label="View cart"
          disabled
        >
          <div className="relative">
            <FiShoppingCart className="text-2xl" />
          </div>
        </button>
      )}
    </div>
  );
};

export default Menu;