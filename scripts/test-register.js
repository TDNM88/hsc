const http = require('http');

// Test user data
const testUser = {
  username: `testuser_${Math.random().toString(36).substring(2, 8)}`,
  email: `test_${Math.random().toString(36).substring(2, 8)}@example.com`,
  password: 'Test@1234',
  name: 'Test User',
  phone: `1${Math.floor(100000000 + Math.random() * 900000000)}`
};

console.log('Test user data:', testUser);

// Request options
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Make the request
console.log('Sending registration request...');
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);

  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Registration successful!');
        console.log('User ID:', response.user?.id);
      } else {
        console.error('❌ Registration failed:', response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

// Send the request with test user data
req.write(JSON.stringify(testUser));
req.end();
