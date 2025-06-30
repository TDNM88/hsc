import { redis } from '../lib/redis';

// Define Redis keys structure
const REDIS_KEYS = {
  // Rate limiting
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  LOGIN_ATTEMPTS: (ip: string) => `login_attempts:${ip}`,
  
  // Application data
  USERS: 'users',
  SESSIONS: 'sessions',
  BLACKLIST: 'blacklist',
  
  // Cache
  CACHE: 'cache',
};

async function initializeRedis() {
  if (!redis) {
    console.error('❌ Redis client is not initialized. Check your environment variables.');
    process.exit(1);
  }

  try {
    console.log('Initializing Redis database...');
    
    // Test the connection
    const pong = await redis.ping();
    if (pong !== 'PONG') {
      throw new Error('Unexpected response from Redis PING');
    }
    
    // Initialize data structures if they don't exist
    const initData = {
      initializedAt: new Date().toISOString(),
      appName: 'London Trading Platform',
      version: '1.0.0',
    };
    
    await redis.hset('app:info', initData);
    
    console.log('✅ Redis database initialized successfully');
    console.log('Initial data:', {
      ...initData,
      redisKeys: Object.entries(REDIS_KEYS).map(([key, value]) => ({
        key,
        example: typeof value === 'function' ? value('example') : value
      }))
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    process.exit(1);
  } finally {
    // No need to call quit() on Upstash Redis client
    process.exit(0);
  }
}

initializeRedis();
