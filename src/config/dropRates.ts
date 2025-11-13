import { RarityTier } from '../types/enums';
import { DropRateConfig } from '../types/interfaces';

/**
 * Default drop rate configuration for standard packs
 * These probabilities should sum to 1.0
 */
export const DEFAULT_DROP_RATES: DropRateConfig[] = [
  { rarity: RarityTier.COMMON, probability: 0.70 },     // 70% chance
  { rarity: RarityTier.RARE, probability: 0.20 },       // 20% chance
  { rarity: RarityTier.EPIC, probability: 0.08 },       // 8% chance
  { rarity: RarityTier.LEGENDARY, probability: 0.02 }   // 2% chance
];

/**
 * Premium pack drop rates (better odds)
 */
export const PREMIUM_DROP_RATES: DropRateConfig[] = [
  { rarity: RarityTier.COMMON, probability: 0.50 },
  { rarity: RarityTier.RARE, probability: 0.30 },
  { rarity: RarityTier.EPIC, probability: 0.15 },
  { rarity: RarityTier.LEGENDARY, probability: 0.05 }
];

/**
 * Event-specific drop rates (enhanced for limited-time events)
 */
export const EVENT_DROP_RATES: DropRateConfig[] = [
  { rarity: RarityTier.COMMON, probability: 0.45 },
  { rarity: RarityTier.RARE, probability: 0.35 },
  { rarity: RarityTier.EPIC, probability: 0.15 },
  { rarity: RarityTier.LEGENDARY, probability: 0.05 }
];

/**
 * Standard pack configurations
 */
export const PACK_CONFIG = {
  STANDARD: {
    cost: 100,
    guaranteedItems: 3
  },
  PREMIUM: {
    cost: 500,
    guaranteedItems: 5
  },
  MEGA: {
    cost: 1000,
    guaranteedItems: 10
  }
};

/**
 * Currency costs for different operations
 */
export const CURRENCY_CONFIG = {
  TRADE_FEE: 50, // Soft currency fee for trades
  ALBUM_SLOT_EXPANSION: 200
};

/**
 * Time limits for various operations
 */
export const TIME_CONFIG = {
  TRADE_EXPIRATION_HOURS: 48,
  EVENT_NOTIFICATION_HOURS: 24
};
