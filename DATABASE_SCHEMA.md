# Database Schema for Card/Sticker Collection System

## Overview

This document defines the database schema for the Hip-Hop Metaverse RPG Card/Sticker Collection System. The schema is designed to be compatible with both SQL (PostgreSQL, MySQL) and NoSQL (MongoDB, DynamoDB) databases.

## Schema Design Principles

1. **Normalized Structure**: Reduce data redundancy
2. **Scalability**: Support millions of users and items
3. **Performance**: Optimized for common queries
4. **Flexibility**: Metadata fields for future expansion
5. **Audit Trail**: Track creation and modification times

## Tables/Collections

### 1. collectible_items

Stores all collectible cards/stickers in the game.

**SQL Schema:**
```sql
CREATE TABLE collectible_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  image_url VARCHAR(500),
  metadata JSONB,
  album_id VARCHAR(36),
  set_id VARCHAR(36),
  event_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_rarity (rarity),
  INDEX idx_event_id (event_id),
  INDEX idx_album_id (album_id),
  
  CONSTRAINT chk_category CHECK (category IN ('ARTIST', 'ALBUM', 'VENUE', 'CULTURAL_ICON', 'EVENT')),
  CONSTRAINT chk_rarity CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY'))
);
```

**NoSQL Schema (MongoDB):**
```javascript
{
  _id: ObjectId,
  id: String,        // UUID
  name: String,
  description: String,
  category: String,  // ARTIST, ALBUM, VENUE, CULTURAL_ICON, EVENT
  rarity: String,    // COMMON, RARE, EPIC, LEGENDARY
  imageUrl: String,
  metadata: Object,  // Flexible metadata
  albumId: String,
  setId: String,
  eventId: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.collectible_items.createIndex({ category: 1 })
db.collectible_items.createIndex({ rarity: 1 })
db.collectible_items.createIndex({ eventId: 1 })
db.collectible_items.createIndex({ albumId: 1 })
```

### 2. packs

Configuration for purchasable packs.

**SQL Schema:**
```sql
CREATE TABLE packs (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost INT NOT NULL,
  currency_type VARCHAR(20) NOT NULL,
  guaranteed_item_count INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  event_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_is_active (is_active),
  INDEX idx_event_id (event_id),
  
  CONSTRAINT chk_currency_type CHECK (currency_type IN ('SOFT', 'PREMIUM')),
  CONSTRAINT chk_cost CHECK (cost > 0),
  CONSTRAINT chk_guaranteed_count CHECK (guaranteed_item_count > 0)
);
```

### 3. pack_items

Many-to-many relationship between packs and items.

**SQL Schema:**
```sql
CREATE TABLE pack_items (
  pack_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (pack_id, item_id),
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES collectible_items(id) ON DELETE CASCADE,
  
  INDEX idx_pack_id (pack_id),
  INDEX idx_item_id (item_id)
);
```

### 4. pack_drop_rates

Drop rate configuration for each pack.

**SQL Schema:**
```sql
CREATE TABLE pack_drop_rates (
  id VARCHAR(36) PRIMARY KEY,
  pack_id VARCHAR(36) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  probability DECIMAL(5,4) NOT NULL,
  
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_pack_rarity (pack_id, rarity),
  
  CONSTRAINT chk_probability CHECK (probability >= 0 AND probability <= 1),
  CONSTRAINT chk_rarity CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY'))
);
```

### 5. albums

Collection sets that can be completed.

**SQL Schema:**
```sql
CREATE TABLE albums (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  event_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_is_active (is_active),
  INDEX idx_event_id (event_id),
  INDEX idx_theme (theme)
);
```

### 6. album_items

Items required to complete an album.

**SQL Schema:**
```sql
CREATE TABLE album_items (
  album_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  sort_order INT DEFAULT 0,
  
  PRIMARY KEY (album_id, item_id),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES collectible_items(id) ON DELETE CASCADE,
  
  INDEX idx_album_id (album_id)
);
```

### 7. album_rewards

Rewards for completing albums.

**SQL Schema:**
```sql
CREATE TABLE album_rewards (
  id VARCHAR(36) PRIMARY KEY,
  album_id VARCHAR(36) NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  amount INT,
  item_id VARCHAR(36),
  metadata JSONB,
  
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  
  INDEX idx_album_id (album_id),
  
  CONSTRAINT chk_reward_type CHECK (reward_type IN ('CURRENCY', 'ITEM', 'COSMETIC', 'SKILL_POINTS', 'KNOWLEDGE_POINTS'))
);
```

### 8. user_collections

User's overall collection metadata.

**SQL Schema:**
```sql
CREATE TABLE user_collections (
  user_id VARCHAR(36) PRIMARY KEY,
  total_value INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_total_value (total_value),
  INDEX idx_updated_at (updated_at)
);
```

### 9. user_collectible_items

Individual items in a user's collection.

**SQL Schema:**
```sql
CREATE TABLE user_collectible_items (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  collectible_id VARCHAR(36) NOT NULL,
  count INT DEFAULT 1,
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_new BOOLEAN DEFAULT TRUE,
  
  UNIQUE KEY unique_user_item (user_id, collectible_id),
  FOREIGN KEY (collectible_id) REFERENCES collectible_items(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_collectible_id (collectible_id),
  INDEX idx_acquired_at (acquired_at),
  
  CONSTRAINT chk_count CHECK (count > 0)
);
```

### 10. user_completed_albums

Track which albums users have completed.

**SQL Schema:**
```sql
CREATE TABLE user_completed_albums (
  user_id VARCHAR(36) NOT NULL,
  album_id VARCHAR(36) NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rewards_claimed BOOLEAN DEFAULT FALSE,
  
  PRIMARY KEY (user_id, album_id),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_completed_at (completed_at)
);
```

### 11. events

Limited-time events and seasons.

**SQL Schema:**
```sql
CREATE TABLE events (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_is_active (is_active),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_event_type (event_type),
  
  CONSTRAINT chk_event_type CHECK (event_type IN ('SEASONAL', 'LIMITED_TIME', 'PROMOTIONAL')),
  CONSTRAINT chk_dates CHECK (end_date > start_date)
);
```

### 12. trade_offers

Player-to-player trade offers.

**SQL Schema:**
```sql
CREATE TABLE trade_offers (
  id VARCHAR(36) PRIMARY KEY,
  from_user_id VARCHAR(36) NOT NULL,
  to_user_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at),
  
  CONSTRAINT chk_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
  CONSTRAINT chk_different_users CHECK (from_user_id != to_user_id)
);
```

### 13. trade_offer_items

Items involved in trades.

**SQL Schema:**
```sql
CREATE TABLE trade_offer_items (
  id VARCHAR(36) PRIMARY KEY,
  trade_offer_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  collectible_id VARCHAR(36) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id) ON DELETE CASCADE,
  FOREIGN KEY (collectible_id) REFERENCES collectible_items(id) ON DELETE CASCADE,
  
  INDEX idx_trade_offer (trade_offer_id),
  
  CONSTRAINT chk_item_type CHECK (item_type IN ('OFFERED', 'REQUESTED'))
);
```

### 14. pack_opening_history

Audit trail for pack openings.

**SQL Schema:**
```sql
CREATE TABLE pack_opening_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  pack_id VARCHAR(36) NOT NULL,
  currency_spent INT NOT NULL,
  currency_type VARCHAR(20) NOT NULL,
  items_received JSONB NOT NULL,
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_pack_id (pack_id),
  INDEX idx_opened_at (opened_at),
  
  FOREIGN KEY (pack_id) REFERENCES packs(id)
);
```

### 15. analytics_events

General analytics tracking.

**SQL Schema:**
```sql
CREATE TABLE analytics_events (
  id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_event_type (event_type),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  
  CONSTRAINT chk_event_type CHECK (event_type IN ('PACK_OPENED', 'ITEM_ACQUIRED', 'SET_COMPLETED', 'TRADE_COMPLETED'))
);
```

## Sample Queries

### Get user's collection with item details
```sql
SELECT 
  ci.id,
  ci.name,
  ci.rarity,
  ci.category,
  uci.count,
  uci.acquired_at
FROM user_collectible_items uci
JOIN collectible_items ci ON uci.collectible_id = ci.id
WHERE uci.user_id = ?
ORDER BY ci.rarity DESC, ci.name ASC;
```

### Check album completion progress
```sql
SELECT 
  a.id,
  a.name,
  COUNT(ai.item_id) as total_items,
  COUNT(uci.collectible_id) as collected_items,
  ROUND(COUNT(uci.collectible_id) * 100.0 / COUNT(ai.item_id), 2) as completion_percentage
FROM albums a
JOIN album_items ai ON a.id = ai.album_id
LEFT JOIN user_collectible_items uci ON ai.item_id = uci.collectible_id AND uci.user_id = ?
WHERE a.is_active = TRUE
GROUP BY a.id, a.name;
```

### Get active events with exclusive items
```sql
SELECT 
  e.id,
  e.name,
  e.start_date,
  e.end_date,
  COUNT(ci.id) as exclusive_items_count
FROM events e
LEFT JOIN collectible_items ci ON e.id = ci.event_id
WHERE e.is_active = TRUE 
  AND NOW() BETWEEN e.start_date AND e.end_date
GROUP BY e.id, e.name, e.start_date, e.end_date;
```

### Get user's duplicate items
```sql
SELECT 
  ci.id,
  ci.name,
  ci.rarity,
  uci.count
FROM user_collectible_items uci
JOIN collectible_items ci ON uci.collectible_id = ci.id
WHERE uci.user_id = ? AND uci.count > 1
ORDER BY uci.count DESC, ci.rarity DESC;
```

### Get pack drop statistics
```sql
SELECT 
  p.name,
  pdr.rarity,
  pdr.probability,
  COUNT(pi.item_id) as available_items
FROM packs p
JOIN pack_drop_rates pdr ON p.id = pdr.pack_id
JOIN pack_items pi ON p.id = pi.pack_id
JOIN collectible_items ci ON pi.item_id = ci.id AND ci.rarity = pdr.rarity
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, pdr.rarity, pdr.probability
ORDER BY p.name, 
  CASE pdr.rarity 
    WHEN 'LEGENDARY' THEN 1
    WHEN 'EPIC' THEN 2
    WHEN 'RARE' THEN 3
    WHEN 'COMMON' THEN 4
  END;
```

## Migration Scripts

### Initial Setup Script (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables
\i create_tables.sql

-- Create indexes
CREATE INDEX idx_user_items_composite ON user_collectible_items(user_id, collectible_id);
CREATE INDEX idx_pack_items_composite ON pack_items(pack_id, item_id);
CREATE INDEX idx_trade_composite ON trade_offers(from_user_id, to_user_id, status);

-- Create views for common queries
CREATE VIEW v_user_collection_summary AS
SELECT 
  uc.user_id,
  COUNT(uci.id) as total_items,
  SUM(uci.count) as total_count,
  uc.total_value,
  COUNT(DISTINCT CASE WHEN ci.rarity = 'LEGENDARY' THEN ci.id END) as legendary_count,
  COUNT(DISTINCT CASE WHEN ci.rarity = 'EPIC' THEN ci.id END) as epic_count,
  COUNT(DISTINCT CASE WHEN ci.rarity = 'RARE' THEN ci.id END) as rare_count,
  COUNT(DISTINCT CASE WHEN ci.rarity = 'COMMON' THEN ci.id END) as common_count
FROM user_collections uc
LEFT JOIN user_collectible_items uci ON uc.user_id = uci.user_id
LEFT JOIN collectible_items ci ON uci.collectible_id = ci.id
GROUP BY uc.user_id, uc.total_value;
```

## Data Seeding

### Sample Data for Testing

```sql
-- Insert sample rarities and categories
INSERT INTO collectible_items (id, name, description, category, rarity, created_at) VALUES
('item-001', 'Tupac Shakur', 'Legendary West Coast rapper', 'ARTIST', 'LEGENDARY', NOW()),
('item-002', 'Notorious B.I.G.', 'Legendary East Coast rapper', 'ARTIST', 'LEGENDARY', NOW()),
('item-003', 'The Chronic', 'Classic album by Dr. Dre', 'ALBUM', 'EPIC', NOW()),
('item-004', 'Apollo Theater', 'Historic Harlem venue', 'VENUE', 'RARE', NOW()),
('item-005', 'Breakdancing', 'Cultural icon representing hip-hop dance', 'CULTURAL_ICON', 'COMMON', NOW());

-- Insert sample pack
INSERT INTO packs (id, name, description, cost, currency_type, guaranteed_item_count, is_active, created_at) VALUES
('pack-001', 'Standard Hip-Hop Pack', 'A basic pack with 3 random items', 100, 'SOFT', 3, TRUE, NOW());

-- Link items to pack
INSERT INTO pack_items (pack_id, item_id) VALUES
('pack-001', 'item-001'),
('pack-001', 'item-002'),
('pack-001', 'item-003'),
('pack-001', 'item-004'),
('pack-001', 'item-005');

-- Set drop rates
INSERT INTO pack_drop_rates (id, pack_id, rarity, probability) VALUES
('rate-001', 'pack-001', 'COMMON', 0.70),
('rate-002', 'pack-001', 'RARE', 0.20),
('rate-003', 'pack-001', 'EPIC', 0.08),
('rate-004', 'pack-001', 'LEGENDARY', 0.02);

-- Create sample album
INSERT INTO albums (id, name, description, theme, is_active, created_at) VALUES
('album-001', 'Legends of the 90s', 'Complete the legendary artists from the golden era', '1990s Hip-Hop', TRUE, NOW());

-- Link items to album
INSERT INTO album_items (album_id, item_id, sort_order) VALUES
('album-001', 'item-001', 1),
('album-001', 'item-002', 2);

-- Define rewards
INSERT INTO album_rewards (id, album_id, reward_type, amount) VALUES
('reward-001', 'album-001', 'CURRENCY', 1000),
('reward-002', 'album-001', 'SKILL_POINTS', 50);
```

## Performance Optimization

### Recommended Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_user_items_rarity ON user_collectible_items(user_id, collectible_id) 
  INCLUDE (count, acquired_at);

CREATE INDEX idx_items_event_rarity ON collectible_items(event_id, rarity) 
  WHERE event_id IS NOT NULL;

-- Partial indexes
CREATE INDEX idx_active_packs ON packs(id) WHERE is_active = TRUE;
CREATE INDEX idx_active_events ON events(id) WHERE is_active = TRUE;
CREATE INDEX idx_pending_trades ON trade_offers(id) WHERE status = 'PENDING';
```

### Partitioning Strategy (for large scale)

```sql
-- Partition pack_opening_history by month
CREATE TABLE pack_opening_history (
  -- columns as defined above
) PARTITION BY RANGE (opened_at);

CREATE TABLE pack_opening_history_2025_01 PARTITION OF pack_opening_history
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE pack_opening_history_2025_02 PARTITION OF pack_opening_history
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- Continue for each month...
```

## Backup and Maintenance

```sql
-- Daily backup of critical tables
pg_dump -t user_collections -t user_collectible_items -t user_completed_albums > daily_backup.sql

-- Weekly analytics aggregation
INSERT INTO analytics_summary (week, event_type, total_count)
SELECT 
  DATE_TRUNC('week', timestamp) as week,
  event_type,
  COUNT(*) as total_count
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '1 week'
GROUP BY week, event_type;

-- Clean up old analytics
DELETE FROM analytics_events WHERE timestamp < NOW() - INTERVAL '90 days';
```

## Scalability Considerations

1. **Sharding**: Partition user data by user_id hash
2. **Caching**: Cache pack configurations, drop rates, and active events in Redis
3. **Read Replicas**: Use read replicas for analytics and reporting queries
4. **Archive Strategy**: Move old pack opening history to cold storage after 1 year

## Security

1. **Row-Level Security**: Enable RLS on user tables
2. **Encryption**: Encrypt sensitive metadata fields
3. **Audit Logging**: Track all modifications to rewards and currency
4. **Rate Limiting**: Database-level rate limiting on pack opening operations
