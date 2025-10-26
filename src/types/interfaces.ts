import { RarityTier, CollectibleCategory, CurrencyType, EventType, TradeStatus } from './enums';

/**
 * Base collectible item (card/sticker)
 */
export interface CollectibleItem {
  id: string;
  name: string;
  description: string;
  category: CollectibleCategory;
  rarity: RarityTier;
  imageUrl?: string;
  metadata: Record<string, any>;
  albumId?: string;
  setId?: string;
  eventId?: string;
  createdAt: Date;
}

/**
 * Pack configuration defining what items can be obtained
 */
export interface Pack {
  id: string;
  name: string;
  description: string;
  cost: number;
  currencyType: CurrencyType;
  guaranteedItemCount: number;
  possibleItems: string[]; // IDs of collectible items
  dropRates: DropRateConfig[];
  isActive: boolean;
  eventId?: string;
  createdAt: Date;
}

/**
 * Drop rate configuration per rarity tier
 */
export interface DropRateConfig {
  rarity: RarityTier;
  probability: number; // 0-1 range
}

/**
 * User's collection of items
 */
export interface UserCollection {
  userId: string;
  items: UserCollectibleItem[];
  completedSets: string[];
  totalValue: number;
  lastUpdated: Date;
}

/**
 * Individual item in user's collection
 */
export interface UserCollectibleItem {
  collectibleId: string;
  acquiredAt: Date;
  count: number;
  isNew: boolean;
}

/**
 * Album/set definition
 */
export interface Album {
  id: string;
  name: string;
  description: string;
  theme: string; // e.g., "1990s Hip-Hop", "West Coast Legends"
  requiredItems: string[]; // IDs of collectibles needed to complete
  rewards: Reward[];
  isActive: boolean;
  eventId?: string;
  createdAt: Date;
}

/**
 * Reward for completing sets
 */
export interface Reward {
  type: 'CURRENCY' | 'ITEM' | 'COSMETIC' | 'SKILL_POINTS' | 'KNOWLEDGE_POINTS';
  amount?: number;
  itemId?: string;
  metadata?: Record<string, any>;
}

/**
 * Event configuration for limited-time collections
 */
export interface CollectionEvent {
  id: string;
  name: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
  exclusiveItems: string[];
  exclusivePacks: string[];
  exclusiveAlbums: string[];
  isActive: boolean;
  createdAt: Date;
}

/**
 * Trading offer between players
 */
export interface TradeOffer {
  id: string;
  fromUserId: string;
  toUserId: string;
  offeredItems: string[]; // collectible IDs
  requestedItems: string[]; // collectible IDs
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * Pack opening result
 */
export interface PackOpeningResult {
  packId: string;
  userId: string;
  itemsReceived: CollectibleItem[];
  newCompletedSets: string[];
  rewardsEarned: Reward[];
  openedAt: Date;
}

/**
 * Analytics event for tracking
 */
export interface AnalyticsEvent {
  eventType: 'PACK_OPENED' | 'ITEM_ACQUIRED' | 'SET_COMPLETED' | 'TRADE_COMPLETED';
  userId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}
