import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

export const securityMiddlewares = (server) => {
  // Security headers
  server.use(helmet());

  // Basic request logging
  server.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Sanitize inputs against NoSQL injection
  // Temporarily disabled due to compatibility issue with Express 5.1.0
  // server.use(mongoSanitize());

  // Rate limit login attempts
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  });

  // Expose limiter to attach per-route where needed
  server.set('loginLimiter', loginLimiter);
};