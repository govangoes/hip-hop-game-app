-- Currency System Database Schema
-- PostgreSQL Schema for Hip-Hop Metaverse RPG Currency System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Currency Types Enumeration
CREATE TYPE currency_type AS ENUM ('soft', 'premium');

-- Transaction Types Enumeration
CREATE TYPE transaction_type AS ENUM (
  'earn_mission',
  'earn_quiz',
  'earn_battle',
  'earn_city_building',
  'earn_achievement',
  'earn_event',
  'spend_upgrade',
  'spend_unlock',
  'spend_cosmetic',
  'spend_beat_pack',
  'spend_story_chapter',
  'spend_avatar',
  'spend_event',
  'purchase_currency',
  'refund',
  'admin_adjustment'
);

-- Users table (simplified for currency system)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Currency Balances
CREATE TABLE IF NOT EXISTS user_balances (
  balance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  currency_type currency_type NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, currency_type)
);

-- Transaction History
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  currency_type currency_type NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium Currency Purchases
CREATE TABLE IF NOT EXISTS currency_purchases (
  purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(transaction_id),
  package_id VARCHAR(50) NOT NULL,
  amount BIGINT NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_gateway VARCHAR(50),
  payment_transaction_id VARCHAR(255) UNIQUE,
  receipt_data TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Pricing Tiers for Premium Currency
CREATE TABLE IF NOT EXISTS currency_packages (
  package_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  currency_amount BIGINT NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  bonus_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics: Daily Currency Flow
CREATE TABLE IF NOT EXISTS currency_analytics (
  analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  currency_type currency_type NOT NULL,
  transaction_type transaction_type NOT NULL,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, currency_type, transaction_type)
);

-- Indexes for performance
CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_currency_purchases_user_id ON currency_purchases(user_id);
CREATE INDEX idx_currency_purchases_status ON currency_purchases(status);
CREATE INDEX idx_currency_analytics_date ON currency_analytics(date DESC);

-- Insert default premium currency packages
INSERT INTO currency_packages (package_id, name, description, currency_amount, price_usd, bonus_percentage, display_order)
VALUES
  ('starter', 'Starter Pack', '500 Premium Currency', 500, 4.99, 0, 1),
  ('bronze', 'Bronze Pack', '1200 Premium Currency', 1200, 9.99, 20, 2),
  ('silver', 'Silver Pack', '2600 Premium Currency', 2600, 19.99, 30, 3),
  ('gold', 'Gold Pack', '5500 Premium Currency', 5500, 39.99, 38, 4),
  ('platinum', 'Platinum Pack', '14000 Premium Currency', 14000, 99.99, 40, 5);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON user_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currency_packages_updated_at BEFORE UPDATE ON currency_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
