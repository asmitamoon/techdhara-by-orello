const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { globalErrorHandler } = require('./utils/errorHandler');
const passport = require('./config/passport');
const { isRedisConnected } = require('./services/cache/redisClient');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(passport.initialize());

app.get('/health', (req, res) => {
  const redisStatus = config.redis.enabled
    ? (isRedisConnected() ? 'connected' : 'disconnected')
    : 'disabled';

  res.status(200).json({
    status: 'OK',
    message: 'Innovation Guild Backend is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    redis: redisStatus
  });
});

app.use('/api',require('./api/routes'));

// 404 handler 
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handling middleware - must be last
app.use(globalErrorHandler);

module.exports = app;