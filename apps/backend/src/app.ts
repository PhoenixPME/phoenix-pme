import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { config } from 'dotenv';
import { authRoutes } from './routes/auth.routes';
import { requestLogger, errorHandler, corsMiddleware } from './middleware/auth.middleware';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.ALLOWED_ORIGINS || ''],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-CSRF-Token'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
if (NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'phoenix-pme-backend',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    documentation: {
      authentication: {
        endpoints: [
          { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
          { method: 'POST', path: '/api/auth/login', description: 'User login' },
          { method: 'POST', path: '/api/auth/refresh-token', description: 'Refresh access token' },
          { method: 'POST', path: '/api/auth/logout', description: 'Logout user' },
          { method: 'GET', path: '/api/auth/me', description: 'Get current user profile' },
          { method: 'PUT', path: '/api/auth/me', description: 'Update user profile' },
        ],
        authentication: 'Bearer token required for protected endpoints',
        rateLimiting: 'Most endpoints have rate limiting',
      },
      upcoming: {
        auctions: 'Coming soon',
        transactions: 'Coming soon',
        admin: 'Coming soon',
        webhooks: 'Coming soon',
      },
    },
    links: {
      github: 'https://github.com/PhoenixPME/coreum-pme',
      documentation: 'https://docs.phoenixpme.com',
      support: 'support@phoenixpme.com',
    },
  });
});

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/auth/*',
      '/api/health',
      '/api/docs',
    ],
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  // Close database connections, etc.
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Starting graceful shutdown...');
  // Close database connections, etc.
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to monitoring service
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to monitoring service
  process.exit(1);
});

// Start server only if not in test environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
      🚀 PhoenixPME Backend Server Started
      =====================================
      🌐 Environment: ${NODE_ENV}
      📍 Port: ${PORT}
      ⏰ Time: ${new Date().toISOString()}
      🔗 Health: http://localhost:${PORT}/api/health
      📚 Docs: http://localhost:${PORT}/api/docs
      
      Available Endpoints:
      - POST   /api/auth/register     Register new user
      - POST   /api/auth/login        User login
      - POST   /api/auth/refresh-token Refresh access token
      - GET    /api/auth/me           Get current user (authenticated)
      - GET    /api/health            Health check
      - GET    /api/docs              API documentation
      
      =====================================
    `);
  });
}

export { app };
