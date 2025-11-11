import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import PlayerProfile from '../models/PlayerProfile';
import CityState from '../models/CityState';
import Collection from '../models/Collection';
import Achievement from '../models/Achievement';
import { hashPassword, comparePassword, generateToken, generateGuestUsername } from '../utils/auth';

export const registerWithEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, username, deviceId, deviceName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      isGuest: false,
      devices: [{ deviceId, deviceName, lastLogin: new Date() }],
    });
    
    // Create initial player profile and game state
    await Promise.all([
      PlayerProfile.create({
        userId: user._id,
        displayName: username,
      }),
      CityState.create({
        userId: user._id,
        cityName: `${username}'s City`,
      }),
      Collection.create({
        userId: user._id,
      }),
      Achievement.create({
        userId: user._id,
      }),
    ]);
    
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Register error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginWithEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, deviceId, deviceName } = req.body;
    
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Update device info
    const deviceIndex = user.devices.findIndex((d) => d.deviceId === deviceId);
    if (deviceIndex >= 0) {
      user.devices[deviceIndex].lastLogin = new Date();
    } else {
      user.devices.push({ deviceId, deviceName, lastLogin: new Date() });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Login failed' });
  }
};

export const createGuestAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId, deviceName } = req.body;
    
    const username = generateGuestUsername();
    
    // Create guest user
    const user = await User.create({
      username,
      isGuest: true,
      devices: [{ deviceId, deviceName, lastLogin: new Date() }],
    });
    
    // Create initial player profile and game state
    await Promise.all([
      PlayerProfile.create({
        userId: user._id,
        displayName: username,
      }),
      CityState.create({
        userId: user._id,
        cityName: `${username}'s City`,
      }),
      Collection.create({
        userId: user._id,
      }),
      Achievement.create({
        userId: user._id,
      }),
    ]);
    
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Guest account creation error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Guest account creation failed' });
  }
};

export const upgradeGuestAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    if (!user.isGuest) {
      res.status(400).json({ error: 'Account is not a guest account' });
      return;
    }
    
    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Upgrade account
    user.email = email;
    user.password = hashedPassword;
    user.isGuest = false;
    await user.save();
    
    res.json({
      message: 'Account upgraded successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Account upgrade error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Account upgrade failed' });
  }
};

export const linkDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId, deviceName } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Check if device already linked
    const deviceIndex = user.devices.findIndex((d) => d.deviceId === deviceId);
    if (deviceIndex >= 0) {
      user.devices[deviceIndex].lastLogin = new Date();
    } else {
      user.devices.push({ deviceId, deviceName, lastLogin: new Date() });
    }
    
    await user.save();
    
    res.json({
      message: 'Device linked successfully',
      devices: user.devices,
    });
  } catch (error) {
    console.error('Device linking error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Device linking failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isGuest: user.isGuest,
        devices: user.devices,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
