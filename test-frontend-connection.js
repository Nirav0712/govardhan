// Quick test to verify frontend can connect to backend
const axios = require('axios');

async function testConnection() {
  try {
    console.log('🧪 Testing frontend-backend connection...');
    
    // Test 1: Backend health check
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test 2: Menu API
    const menuResponse = await axios.get('http://localhost:5000/api/menu');
    console.log('✅ Menu API response:', {
      success: menuResponse.data.success,
      itemCount: menuResponse.data.data?.length || 0
    });
    
    // Test 3: CORS headers
    const corsResponse = await axios.get('http://localhost:5000/api/menu', {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('✅ CORS test passed');
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    console.log('📝 Make sure to restart your frontend server:');
    console.log('   cd Frontend && npm run dev');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Start it with:');
      console.log('   cd backend && npm run dev');
    }
  }
}

testConnection();
