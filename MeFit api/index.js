import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

import { configEnv } from '../src/configs/env.config.js';
import { connectToMongoDB } from '../src/configs/mongodb.config.js';
import { userRouter } from '../src/routes/user.route.js';
import { securityMiddlewares } from '../src/middlewares/security.middleware.js';

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

configEnv();

const server = express();

// Security + parsers
server.use(cors());
server.use(express.json());
securityMiddlewares(server);

// Connect to MongoDB on demand (no-op if already connected)
server.use(async (_req, _res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Swagger setup (relative server so it works on Vercel)
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MEFIT API',
      version: '1.0.0',
      description: 'API for MEFIT fitness tracking application',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './api/index.js',
  ],
});
server.use(['/docs', '/api/docs'], swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
import { profileRouter } from '../src/routes/profile.route.js';
import { goalRouter } from '../src/routes/goal.route.js';
import { programRouter } from '../src/routes/program.route.js';
import { workoutRouter } from '../src/routes/workout.route.js';
import { exerciseRouter } from '../src/routes/exercise.route.js';
import { seedRouter } from '../src/routes/seed.route.js';
server.use('/api/user', userRouter);
server.use('/api/profile', profileRouter);
server.use('/api/goal', goalRouter);
server.use('/api/program', programRouter);
server.use('/api/workout', workoutRouter);
server.use('/api/exercise', exerciseRouter);
server.use('/api/exercises', exerciseRouter);
server.use('/api/seed', seedRouter);
// Root route - health check
server.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: '🚀 Server is running',
    docs: '/docs',
  });
});

// Global error handler
server.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

// HTTPS enforcement (behind proxy)
server.enable('trust proxy');
server.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
    return res.status(403).json({ message: 'HTTPS required' });
  }
  next();
});

// Export Vercel serverless handler
const handler = serverless(server);
export default handler;

// Local development server (only when not running on Vercel)
if (!process.env.VERCEL) {
  connectToMongoDB()
    .then(() => {
      const port = process.env.PORT || 3000;
      server.listen(port, () => {
        console.log(' ');
        console.log('*');
        console.log('> Status : Running');
        console.log('> Database : Connected');
        const env = process.env.NODE_ENV || 'development';
        console.log(`> Environment : ${env.charAt(0).toUpperCase() + env.substring(1)}`);
        console.log(`> PORT : ${port}`);
        console.log('> Docs : /docs');
        console.log('*');
        console.log(' ');
      });
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err);
    });
}
