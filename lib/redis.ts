import { Redis as UpstashRedis } from '@upstash/redis';

// Get environment variables with validation
const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Initialize Redis client with credentials
let _redis: UpstashRedis | null = null;

// Initialize Redis client
try {
  const redisUrl = getEnv('KV_REST_API_URL');
  const redisToken = getEnv('KV_REST_API_TOKEN');
  
  _redis = new UpstashRedis({
    url: redisUrl,
    token: redisToken,
  });
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.warn('Redis client not initialized:', errorMessage);
}

// Export initialized Redis client
export const redis = _redis;

// Test the Redis connection
export async function testRedisConnection() {
  if (!_redis) {
    const error = new Error('Redis client not initialized. Check your environment variables.');
    console.error('❌ Redis connection test failed:');
    console.error(error);
    return { success: false, error };
  }

  try {
    const testKey = `test:connection:${Date.now()}`;
    const testValue = `Test connection at ${new Date().toISOString()}`;
    
    // Set a value
    await _redis.set(testKey, testValue);
    
    // Get the value back
    const value = await _redis.get(testKey);
    
    // Clean up
    await _redis.del(testKey);
    
    if (value === testValue) {
      console.log('✅ Redis connection test successful');
      return { success: true, value };
    } else {
      const error = new Error('Redis test failed: Retrieved value does not match expected value');
      console.error('❌ Redis connection test failed:');
      console.error(error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ Redis connection test failed:');
    console.error(error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

// Rate limiting configuration
export const rateLimitConfig = {
  // Rate limiting for login attempts (per IP)
  login: {
    max: 5, // Maximum number of requests
    window: 60, // Time window in seconds
  },
  // Rate limiting for API endpoints (per IP)
  api: {
    max: 100, // Maximum number of requests
    window: 60, // Time window in seconds
  },
};

// Helper function to check rate limits
export async function checkRateLimit(
  key: string,
  max: number,
  window: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!_redis) {
    console.warn('Redis client not available. Rate limiting disabled.');
    return { allowed: true, remaining: max };
  }

  try {
    const current = await _redis.incr(key);
    if (current === 1) {
      // Set expiration only on first request
      await _redis.expire(key, window);
    }

    return {
      allowed: current <= max,
      remaining: Math.max(0, max - current),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: max }; // Fail open
  }
}
