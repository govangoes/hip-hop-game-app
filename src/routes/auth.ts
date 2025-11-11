import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerWithEmail,
  loginWithEmail,
  createGuestAccount,
  upgradeGuestAccount,
  linkDevice,
  getProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Guest account creation
router.post(
  '/guest',
  authLimiter,
  [
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('deviceName').notEmpty().withMessage('Device name is required'),
  ],
  createGuestAccount
);

// Email registration
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').notEmpty().withMessage('Username is required'),
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('deviceName').notEmpty().withMessage('Device name is required'),
  ],
  registerWithEmail
);

// Email login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('deviceName').notEmpty().withMessage('Device name is required'),
  ],
  loginWithEmail
);

// Upgrade guest account
router.post(
  '/upgrade',
  authLimiter,
  authenticate,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  upgradeGuestAccount
);

// Link device to account
router.post(
  '/link-device',
  authLimiter,
  authenticate,
  [
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('deviceName').notEmpty().withMessage('Device name is required'),
  ],
  linkDevice
);

// Get user profile
router.get('/profile', authenticate, getProfile);

export default router;
