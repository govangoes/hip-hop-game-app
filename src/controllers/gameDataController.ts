import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PlayerProfile from '../models/PlayerProfile';
import CityState from '../models/CityState';
import Collection from '../models/Collection';
import Achievement from '../models/Achievement';

export const savePlayerData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const { profile, cityState, collection, achievements } = req.body;
    
    const updates = [];
    
    // Update player profile
    if (profile) {
      updates.push(
        PlayerProfile.findOneAndUpdate(
          { userId },
          { ...profile, userId },
          { upsert: true, new: true }
        )
      );
    }
    
    // Update city state
    if (cityState) {
      updates.push(
        CityState.findOneAndUpdate(
          { userId },
          { ...cityState, userId, lastSaved: new Date() },
          { upsert: true, new: true }
        )
      );
    }
    
    // Update collection
    if (collection) {
      updates.push(
        Collection.findOneAndUpdate(
          { userId },
          { ...collection, userId },
          { upsert: true, new: true }
        )
      );
    }
    
    // Update achievements
    if (achievements) {
      updates.push(
        Achievement.findOneAndUpdate(
          { userId },
          { ...achievements, userId },
          { upsert: true, new: true }
        )
      );
    }
    
    await Promise.all(updates);
    
    res.json({
      message: 'Player data saved successfully',
      savedAt: new Date(),
    });
  } catch (error) {
    console.error('Save player data error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to save player data' });
  }
};

export const loadPlayerData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const [profile, cityState, collection, achievements] = await Promise.all([
      PlayerProfile.findOne({ userId }),
      CityState.findOne({ userId }),
      Collection.findOne({ userId }),
      Achievement.findOne({ userId }),
    ]);
    
    res.json({
      profile,
      cityState,
      collection,
      achievements,
      loadedAt: new Date(),
    });
  } catch (error) {
    console.error('Load player data error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to load player data' });
  }
};

export const getPlayerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const profile = await PlayerProfile.findOne({ userId });
    
    if (!profile) {
      res.status(404).json({ error: 'Player profile not found' });
      return;
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get player profile error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch player profile' });
  }
};

export const updatePlayerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const updates = req.body;
    
    const profile = await PlayerProfile.findOneAndUpdate(
      { userId },
      { ...updates, userId },
      { new: true, upsert: true }
    );
    
    res.json({
      message: 'Player profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update player profile error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to update player profile' });
  }
};

export const getCityState = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const cityState = await CityState.findOne({ userId });
    
    if (!cityState) {
      res.status(404).json({ error: 'City state not found' });
      return;
    }
    
    res.json({ cityState });
  } catch (error) {
    console.error('Get city state error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch city state' });
  }
};

export const updateCityState = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const updates = req.body;
    
    const cityState = await CityState.findOneAndUpdate(
      { userId },
      { ...updates, userId, lastSaved: new Date() },
      { new: true, upsert: true }
    );
    
    res.json({
      message: 'City state updated successfully',
      cityState,
    });
  } catch (error) {
    console.error('Update city state error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to update city state' });
  }
};

export const getCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const collection = await Collection.findOne({ userId });
    
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }
    
    res.json({ collection });
  } catch (error) {
    console.error('Get collection error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
};

export const updateCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const updates = req.body;
    
    const collection = await Collection.findOneAndUpdate(
      { userId },
      { ...updates, userId },
      { new: true, upsert: true }
    );
    
    res.json({
      message: 'Collection updated successfully',
      collection,
    });
  } catch (error) {
    console.error('Update collection error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to update collection' });
  }
};

export const getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const achievements = await Achievement.findOne({ userId });
    
    if (!achievements) {
      res.status(404).json({ error: 'Achievements not found' });
      return;
    }
    
    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

export const updateAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const updates = req.body;
    
    const achievements = await Achievement.findOneAndUpdate(
      { userId },
      { ...updates, userId },
      { new: true, upsert: true }
    );
    
    res.json({
      message: 'Achievements updated successfully',
      achievements,
    });
  } catch (error) {
    console.error('Update achievements error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to update achievements' });
  }
};
