// config/redis.js
const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'  // Use your Redis URL or default to localhost
});

// Connect to Redis
client.connect();

// Listen for the connection event
client.on('connect', () => {
  console.log('Connected to Redis...');
});

// Listen for error events
client.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = client;
