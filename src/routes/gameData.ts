import { Router } from 'express';
import {
  savePlayerData,
  loadPlayerData,
  getPlayerProfile,
  updatePlayerProfile,
  getCityState,
  updateCityState,
  getCollection,
  updateCollection,
  getAchievements,
  updateAchievements,
} from '../controllers/gameDataController';
import { authenticate } from '../middleware/auth';
import { apiLimiter, saveLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Save/Load all player data
router.post('/save', saveLimiter, savePlayerData);
router.get('/load', apiLimiter, loadPlayerData);

// Player profile routes
router.get('/profile', apiLimiter, getPlayerProfile);
router.put('/profile', apiLimiter, updatePlayerProfile);

// City state routes
router.get('/city', apiLimiter, getCityState);
router.put('/city', saveLimiter, updateCityState);

// Collection routes
router.get('/collection', apiLimiter, getCollection);
router.put('/collection', apiLimiter, updateCollection);

// Achievement routes
router.get('/achievements', apiLimiter, getAchievements);
router.put('/achievements', apiLimiter, updateAchievements);

export default router;
