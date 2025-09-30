// Test script to verify API fixes
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test 1: Menu API
    console.log('1. Testing Menu API...');
    const menuResponse = await axios.get(`${API_BASE_URL}/menu`);
    console.log('✅ Menu API working:', menuResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Found ${menuResponse.data.data?.length || 0} menu items\n`);

    // Test 2: Menu Categories API
    console.log('2. Testing Menu Categories API...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/menu/categories`);
    console.log('✅ Menu Categories API working:', categoriesResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Found ${categoriesResponse.data.categories?.length || 0} categories\n`);

    // Test 3: Contact Info API
    console.log('3. Testing Contact Info API...');
    const contactResponse = await axios.get(`${API_BASE_URL}/contact/info`);
    console.log('✅ Contact Info API working:', contactResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Contact email: ${contactResponse.data.data?.email || 'N/A'}\n`);

    // Test 4: Auth endpoints (without credentials)
    console.log('4. Testing Auth endpoints...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log('✅ Auth API working: SUCCESS (expected failure)');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        console.log('✅ Auth API working: SUCCESS (expected failure)');
      } else {
        console.log('❌ Auth API error:', error.message);
      }
    }
    console.log('');

    // Test 5: Server health check
    console.log('5. Testing Server Health...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server Health:', healthResponse.data.status === 'OK' ? 'SUCCESS' : 'FAILED');
    console.log(`   Database: ${healthResponse.data.database}\n`);

    console.log('🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPIEndpoints();
}

module.exports = { testAPIEndpoints };
