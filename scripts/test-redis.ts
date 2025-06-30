// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`🔍 Looking for .env.local at: ${envPath}`);

// Load environment variables synchronously before any other imports
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.error('❌ Error loading .env.local:', envConfig.error);
  process.exit(1);
}

console.log(`📂 File exists: ✅ Yes`);

// Now import other modules after environment is loaded
import { testRedisConnection } from '../lib/redis';

// Debug: Show loaded environment variables
console.log('\n🔑 Loaded environment variables:');
console.log(`- KV_URL: ${process.env.KV_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`- KV_REST_API_URL: ${process.env.KV_REST_API_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`- KV_REST_API_TOKEN: ${process.env.KV_REST_API_TOKEN ? '✅ Set' : '❌ Not set'}`);

async function runTest() {
  console.log('\n🚀 Testing Redis connection...');
  try {
    const result = await testRedisConnection();
    
    if (result.success) {
      console.log('✅ Redis connection successful!');
      console.log('Test value:', result.value);
      process.exit(0);
    } else {
      console.error('❌ Redis connection failed:');
      console.error(result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error during test:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runTest();
