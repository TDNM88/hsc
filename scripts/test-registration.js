const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Configure logging
const LOG_FILE = path.join(__dirname, 'test-registration.log');

function logToFile(message, data = '') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  
  console.log(message, data ? JSON.stringify(data, null, 2) : '');
  
  fs.appendFileSync(LOG_FILE, logEntry, 'utf-8');
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
  timeout: 10000, // 10 seconds timeout
};

// Test user data
const testUser = {
  username: 'testuser_' + Math.random().toString(36).substring(2, 8),
  email: `test_${Math.random().toString(36).substring(2, 8)}@example.com`,
  password: 'Test@1234', // 8+ chars with uppercase, lowercase, number, special char
  name: 'Test User',
  phone: '1234567890',
};

logToFile('=== STARTING REGISTRATION TEST ===');
logToFile('Test user:', testUser);

// Create the request
logToFile('Sending registration request to:', {
  url: `http://${TEST_CONFIG.hostname}:${TEST_CONFIG.port}${TEST_CONFIG.path}`,
  method: TEST_CONFIG.method,
  headers: TEST_CONFIG.headers
});

const req = http.request(TEST_CONFIG, (res) => {
  logToFile(`Response Status: ${res.statusCode} ${res.statusMessage}`);
  logToFile('Response Headers:', res.headers);

  let responseData = Buffer.alloc(0);
  
  res.on('data', (chunk) => {
    responseData = Buffer.concat([responseData, Buffer.from(chunk)]);
  });

  res.on('end', () => {
    try {
      const data = responseData.length > 0 
        ? JSON.parse(responseData.toString('utf8')) 
        : {};
      
      logToFile('Response Body:', data);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logToFile('✅ Registration successful!', { userId: data.user?.id });
        console.log('✅ Registration successful!');
        console.log('User ID:', data.user?.id);
      } else {
        const errorMsg = data.error || 'Unknown error';
        logToFile('❌ Registration failed:', { 
          statusCode: res.statusCode,
          error: errorMsg,
          details: data.details || 'No details provided'
        });
        console.error('❌ Registration failed:', errorMsg);
        if (data.details) {
          console.error('Details:', data.details);
        }
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

// Send the request with test user data
console.log('Sending registration request...');
req.write(JSON.stringify(testUser));
req.end();
