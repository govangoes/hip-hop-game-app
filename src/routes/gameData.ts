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

const router = Router();

// All routes require authentication
router.use(authenticate);

// Save/Load all player data
router.post('/save', savePlayerData);
router.get('/load', loadPlayerData);

// Player profile routes
router.get('/profile', getPlayerProfile);
router.put('/profile', updatePlayerProfile);

// City state routes
router.get('/city', getCityState);
router.put('/city', updateCityState);

// Collection routes
router.get('/collection', getCollection);
router.put('/collection', updateCollection);

// Achievement routes
router.get('/achievements', getAchievements);
router.put('/achievements', updateAchievements);

export default router;
