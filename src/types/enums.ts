/**
 * Rarity tiers for collectible items
 */
export enum RarityTier {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

/**
 * Categories for collectible items
 */
export enum CollectibleCategory {
  ARTIST = 'ARTIST',
  ALBUM = 'ALBUM',
  VENUE = 'VENUE',
  CULTURAL_ICON = 'CULTURAL_ICON',
  EVENT = 'EVENT'
}

/**
 * Currency types for purchases
 */
export enum CurrencyType {
  SOFT = 'SOFT',      // In-game earned currency
  PREMIUM = 'PREMIUM' // Real money purchase currency
}

/**
 * Event types for limited-time collections
 */
export enum EventType {
  SEASONAL = 'SEASONAL',
  LIMITED_TIME = 'LIMITED_TIME',
  PROMOTIONAL = 'PROMOTIONAL'
}

/**
 * Trade status
 */
export enum TradeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}
