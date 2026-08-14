require('dotenv').config();

const config = {
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'lms_db',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Server
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  
  // CORS
  cors: {
    // Production: client & server 1 port, tidak perlu CORS lintas origin
    // Development: client di port 5173, server di 5000
    origin: process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'),
  },
};

module.exports = config;
