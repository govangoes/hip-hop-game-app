import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiter for game data save operations
export const saveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 saves per minute (allows auto-save every 2 seconds)
  message: 'Too many save requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
