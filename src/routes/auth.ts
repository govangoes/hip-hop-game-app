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

const router = Router();

// Guest account creation
router.post(
  '/guest',
  [
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('deviceName').notEmpty().withMessage('Device name is required'),
  ],
  createGuestAccount
);

// Email registration
router.post(
  '/register',
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
