export enum CurrencyType {
  SOFT = 'soft',
  PREMIUM = 'premium'
}

export enum TransactionType {
  EARN_MISSION = 'earn_mission',
  EARN_QUIZ = 'earn_quiz',
  EARN_BATTLE = 'earn_battle',
  EARN_CITY_BUILDING = 'earn_city_building',
  EARN_ACHIEVEMENT = 'earn_achievement',
  EARN_EVENT = 'earn_event',
  SPEND_UPGRADE = 'spend_upgrade',
  SPEND_UNLOCK = 'spend_unlock',
  SPEND_COSMETIC = 'spend_cosmetic',
  SPEND_BEAT_PACK = 'spend_beat_pack',
  SPEND_STORY_CHAPTER = 'spend_story_chapter',
  SPEND_AVATAR = 'spend_avatar',
  SPEND_EVENT = 'spend_event',
  PURCHASE_CURRENCY = 'purchase_currency',
  REFUND = 'refund',
  ADMIN_ADJUSTMENT = 'admin_adjustment'
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  is_premium: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserBalance {
  balance_id: string;
  user_id: string;
  currency_type: CurrencyType;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  transaction_id: string;
  user_id: string;
  currency_type: CurrencyType;
  transaction_type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

export interface CurrencyPurchase {
  purchase_id: string;
  user_id: string;
  transaction_id?: string;
  package_id: string;
  amount: number;
  price_usd: number;
  payment_method?: string;
  payment_gateway?: string;
  payment_transaction_id?: string;
  receipt_data?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
  completed_at?: Date;
}

export interface CurrencyPackage {
  package_id: string;
  name: string;
  description?: string;
  currency_amount: number;
  price_usd: number;
  bonus_percentage: number;
  is_active: boolean;
  display_order?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CurrencyAnalytics {
  analytics_id: string;
  date: Date;
  currency_type: CurrencyType;
  transaction_type: TransactionType;
  total_transactions: number;
  total_amount: number;
  unique_users: number;
  created_at: Date;
}

export interface EarnCurrencyRequest {
  user_id: string;
  currency_type: CurrencyType;
  transaction_type: TransactionType;
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface SpendCurrencyRequest {
  user_id: string;
  currency_type: CurrencyType;
  transaction_type: TransactionType;
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PurchaseCurrencyRequest {
  user_id: string;
  package_id: string;
  payment_method: string;
  payment_gateway: string;
  payment_transaction_id: string;
  receipt_data?: string;
}

export interface CurrencyBalance {
  user_id: string;
  soft_currency: number;
  premium_currency: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total_count: number;
  page: number;
  page_size: number;
}
