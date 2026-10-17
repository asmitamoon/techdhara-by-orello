require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/innovation_guild',

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'your-jwt-access-secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-key',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0,
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: {
      otp: parseInt(process.env.REDIS_TTL_OTP) || 600,
      list: 300,
      detail: 600
    }
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    approvalTemplateSid: process.env.WHATSAPP_APPROVAL_TEMPLATE_SID,
    rejectionTemplateSid: process.env.WHATSAPP_REJECTION_TEMPLATE_SID
  },

  sendgridApiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.FROM_EMAIL,

  spaces: {
    key: process.env.DO_SPACES_KEY,
    secret: process.env.DO_SPACES_SECRET,
    endpoint: process.env.DO_SPACES_ENDPOINT,
    bucket: process.env.DO_SPACES_BUCKET
  },

  aiServiceUrl: process.env.AI_SERVICE_URL,
  perplexityApiKey: process.env.PERPLEXITY_API_KEY || '',

  adminEmails: process.env.ADMIN_EMAILS?.split(',') || []
};

module.exports = config;