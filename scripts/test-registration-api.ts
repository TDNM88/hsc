import http from 'http';
import { config } from '../config';

interface TestUser {
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
}

// Test configuration
const TEST_CONFIG = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
};

// Generate a random test user
function createTestUser(): TestUser {
  const randomString = Math.random().toString(36).substring(2, 8);
  return {
    username: `testuser_${randomString}`,
    email: `test_${randomString}@example.com`,
    password: 'Test@1234',
    name: `Test User ${randomString}`,
    phone: `1${Math.floor(100000000 + Math.random() * 900000000)}`.substring(0, 10),
  };
}

// Make an HTTP request
function makeRequest(options: any, data: any): Promise<{ statusCode?: number; headers: any; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const body = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run the test
async function testRegistration() {
  console.log('=== Registration API Test ===');
  
  // 1. Test with valid data
  console.log('\n1. Testing registration with valid data...');
  const testUser = createTestUser();
  console.log('Test user:', testUser);
  
  try {
    const response = await makeRequest({
      ...TEST_CONFIG,
      headers: {
        'Content-Type': 'application/json',
      },
    }, testUser);
    
    console.log('Response status:', response.statusCode);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Registration successful!');
      console.log('User ID:', response.body.user?.id);
    } else {
      console.error('❌ Registration failed:', response.body.error || 'Unknown error');
      if (response.body.details) {
        console.error('Details:', response.body.details);
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  // 2. Test with missing required fields
  console.log('\n2. Testing registration with missing required fields...');
  try {
    const invalidUser = { ...createTestUser(), email: '' };
    const response = await makeRequest({
      ...TEST_CONFIG,
    }, invalidUser);
    
    console.log('Response status:', response.statusCode);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 400) {
      console.log('✅ Correctly handled invalid data');
    } else {
      console.error('❌ Unexpected response for invalid data');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  // 3. Test with duplicate email
  console.log('\n3. Testing registration with duplicate email...');
  try {
    const duplicateUser = { ...createTestUser(), email: testUser.email };
    const response = await makeRequest({
      ...TEST_CONFIG,
    }, duplicateUser);
    
    console.log('Response status:', response.statusCode);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 409) {
      console.log('✅ Correctly handled duplicate email');
    } else {
      console.error('❌ Unexpected response for duplicate email');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n=== Test completed ===');
}

// Run the test
testRegistration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
