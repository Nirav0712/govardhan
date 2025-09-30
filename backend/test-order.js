const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Menu = require('./models/Menu');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dhaval:123456789@cluster0.4jqjq.mongodb.net/govardhan_thal?retryWrites=true&w=majority');

async function testOrderCreation() {
  try {
    console.log('Testing order creation...');
    
    // Find a user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('No test user found. Creating one...');
      const newUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'password123',
        isVerified: true
      });
      await newUser.save();
      console.log('Test user created');
    }
    
    // Find or create a menu item
    let menuItem = await Menu.findOne();
    if (!menuItem) {
      console.log('No menu items found. Creating one...');
      const newMenuItem = new Menu({
        name: 'Test Item',
        description: 'A test menu item',
        price: 10.99,
        category: 'Main Course',
        isAvailable: true
      });
      await newMenuItem.save();
      menuItem = newMenuItem;
      console.log('Test menu item created');
    }
    
    // Create an order
    const order = new Order({
      orderNumber: 'TEST-' + Date.now(),
      user: user._id,
      items: [{
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 2,
        total: menuItem.price * 2
      }],
      orderType: 'DINE-IN',
      subtotal: menuItem.price * 2,
      serviceCharge: (menuItem.price * 2) * 0.10,
      gst: (menuItem.price * 2) * 0.09,
      totalAmount: (menuItem.price * 2) * 1.19,
      status: 'pending'
    });
    
    await order.save();
    console.log('Test order created:', order);
    
    // Test fetching orders
    const orders = await Order.find({ user: user._id }).populate('items.menuItem');
    console.log('User orders:', orders);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testOrderCreation();
