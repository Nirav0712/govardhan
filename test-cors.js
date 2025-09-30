// Test CORS configuration
const axios = require('axios');

async function testCORS() {
  try {
    console.log('🧪 Testing CORS configuration...');
    
    // Test preflight request
    console.log('\n1. Testing OPTIONS preflight request...');
    const preflightResponse = await axios.options('http://localhost:5000/api/auth/extend-session', {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log('✅ Preflight response status:', preflightResponse.status);
    console.log('✅ CORS headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': preflightResponse.headers['access-control-allow-credentials']
    });

    // Test actual request
    console.log('\n2. Testing actual POST request...');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/extend-session', {}, {
        headers: {
          'Origin': 'http://localhost:5173',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token-for-testing'
        }
      });
      console.log('✅ POST response status:', response.status);
    } catch (error) {
      if (error.response) {
        console.log('✅ POST response status:', error.response.status);
        console.log('✅ CORS headers in error response:', {
          'Access-Control-Allow-Origin': error.response.headers['access-control-allow-origin'],
          'Access-Control-Allow-Credentials': error.response.headers['access-control-allow-credentials']
        });
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    // Test health endpoint
    console.log('\n3. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health', {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('✅ Health response status:', healthResponse.status);
    console.log('✅ Health CORS headers:', {
      'Access-Control-Allow-Origin': healthResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Credentials': healthResponse.headers['access-control-allow-credentials']
    });

  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testCORS();
