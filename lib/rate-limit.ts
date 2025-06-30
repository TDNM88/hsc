import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client with provided credentials
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

// Rate limit configuration
const RATE_LIMIT = {
  // General API rate limiting
  API: {
    REQUESTS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
    WINDOW: '60 s', // 60 seconds (1 minute)
    PREFIX: 'ratelimit',
  },
  // Login attempt rate limiting
  LOGIN: {
    MAX_ATTEMPTS: parseInt(process.env.LOGIN_ATTEMPTS_BEFORE_LOCKOUT || '5', 10),
    WINDOW: `${parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10) * 60} s`, // Convert minutes to seconds
    PREFIX: 'login-ratelimit',
  },
} as const;

// Create rate limiters
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMIT.API.REQUESTS_PER_MINUTE,
    RATE_LIMIT.API.WINDOW
  ),
  analytics: true,
  prefix: RATE_LIMIT.API.PREFIX,
});

// Rate limiting middleware for API routes
export async function rateLimitRequest(
  identifier: string,
  tokens: number = 1
) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}

// Rate limiting middleware for login attempts
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMIT.LOGIN.MAX_ATTEMPTS,
    RATE_LIMIT.LOGIN.WINDOW
  ),
  analytics: true,
  prefix: RATE_LIMIT.LOGIN.PREFIX,
});

// Test Redis connection
export async function testRedisConnection() {
  try {
    await redis.set('test', 'Hello from Upstash Redis!');
    const value = await redis.get('test');
    console.log('Redis connection test successful');
    return { success: true, value };
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return { success: false, error };
  }
}
