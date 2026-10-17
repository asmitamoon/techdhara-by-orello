const redis = require('redis');
const config = require('../../config');

let redisClient = null;
let isConnected = false;

const createRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  if (!config.redis.enabled) {
    console.log('[Redis] Caching is disabled via CACHE_ENABLED flag');
    return null;
  }

  const client = redis.createClient({
    url: config.redis.url,
    password: config.redis.password || undefined,
    database: config.redis.db,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('[Redis] Max reconnection attempts reached. Giving up.');
          return new Error('Redis reconnection failed');
        }
        const delay = Math.min(retries * 100, 3000);
        console.log(`[Redis] Reconnecting... Attempt ${retries}, delay ${delay}ms`);
        return delay;
      }
    }
  });

  client.on('connect', () => {
    console.log('[Redis] Connecting...');
  });

  client.on('ready', () => {
    isConnected = true;
    console.log('[Redis] Connected successfully');
  });

  client.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
    isConnected = false;
  });

  client.on('end', () => {
    isConnected = false;
    console.log('[Redis] Connection closed');
  });

  client.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
  });

  redisClient = client;
  return client;
};

const getRedisClient = () => {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

const connectRedis = async () => {
  const client = getRedisClient();

  if (!client) {
    console.log('[Redis] Client not initialized (caching disabled)');
    return null;
  }

  try {
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    console.error('[Redis] Connection failed:', error.message);
    return null;
  }
};

const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      console.log('[Redis] Disconnected gracefully');
    } catch (error) {
      console.error('[Redis] Error during disconnect:', error.message);
      await redisClient.disconnect();
    }
  }
};

const isRedisConnected = () => {
  return isConnected && redisClient && redisClient.isOpen;
};

const set = async (key, value, ttl = null) => {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl) {
      await redisClient.setEx(key, ttl, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error(`[Redis] Error setting key ${key}:`, error.message);
    return false;
  }
};

const get = async (key) => {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`[Redis] Error getting key ${key}:`, error.message);
    return null;
  }
};

const del = async (key) => {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`[Redis] Error deleting key ${key}:`, error.message);
    return false;
  }
};

const exists = async (key) => {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`[Redis] Error checking key existence ${key}:`, error.message);
    return false;
  }
};

const deletePattern = async (pattern) => {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    let cursor = 0;
    let deletedCount = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });

      cursor = result.cursor;
      const keys = result.keys;

      if (keys.length > 0) {
        await redisClient.del(keys);
        deletedCount += keys.length;
      }
    } while (cursor !== 0);

    console.log(`[Redis] Deleted ${deletedCount} keys matching pattern: ${pattern}`);
    return deletedCount;
  } catch (error) {
    console.error(`[Redis] Error deleting pattern ${pattern}:`, error.message);
    return 0;
  }
};

const increment = async (key, ttl = null) => {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const value = await redisClient.incr(key);

    if (ttl && value === 1) {
      await redisClient.expire(key, ttl);
    }

    return value;
  } catch (error) {
    console.error(`[Redis] Error incrementing key ${key}:`, error.message);
    return null;
  }
};

const getTTL = async (key) => {
  if (!isRedisConnected()) {
    return -1;
  }

  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error(`[Redis] Error getting TTL for key ${key}:`, error.message);
    return -1;
  }
};

module.exports = {
  createRedisClient,
  getRedisClient,
  connectRedis,
  disconnectRedis,
  isRedisConnected,
  set,
  get,
  del,
  exists,
  deletePattern,
  increment,
  getTTL
};
