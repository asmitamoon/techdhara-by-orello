// Force IPv4-first DNS resolution process-wide. The droplet has no routable IPv6,
// so resolving external hosts (incl. the SendGrid API) to IPv6 first caused ENETUNREACH.
require('dns').setDefaultResultOrder('ipv4first');

const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config');
const { connectRedis, disconnectRedis } = require('./src/services/cache/redisClient');
const fs = require('fs').promises;
const { STORAGE } = require('./src/config/videoProcessing');

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    if (config.redis.enabled) {
      await connectRedis();
    }

    // Initialize video processing temp directory
    try {
      await fs.mkdir(STORAGE.tempDir, { recursive: true });
      console.log(`Video temp directory initialized: ${STORAGE.tempDir}`);
    } catch (error) {
      console.error('Failed to create video temp directory:', error.message);
    }

    // Start the server
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed');

        if (config.redis.enabled) {
          await disconnectRedis();
        }

        console.log('Graceful shutdown completed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forcefully shutting down after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();