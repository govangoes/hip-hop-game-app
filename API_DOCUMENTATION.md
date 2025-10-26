# Card/Sticker Collection System - API Documentation

## Overview

The Card/Sticker Collection System provides a complete backend implementation for a collection-based gameplay feature in the Hip-Hop Metaverse RPG. It includes pack opening mechanics, collection management, trading, and event systems.

## Table of Contents

1. [Architecture](#architecture)
2. [Data Models](#data-models)
3. [Services](#services)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)

## Architecture

The system is built with TypeScript and follows a service-oriented architecture:

```
src/
├── types/              # Type definitions and enums
├── models/             # Data models (future database implementations)
├── services/           # Business logic services
├── utils/              # Utility functions
└── config/             # Configuration files
```

## Data Models

### Core Types

#### CollectibleItem
Represents a single card or sticker in the collection system.

```typescript
interface CollectibleItem {
  id: string;
  name: string;
  description: string;
  category: CollectibleCategory;  // ARTIST, ALBUM, VENUE, CULTURAL_ICON, EVENT
  rarity: RarityTier;             // COMMON, RARE, EPIC, LEGENDARY
  imageUrl?: string;
  metadata: Record<string, any>;  // Flexible metadata storage
  albumId?: string;               // Optional album association
  setId?: string;                 // Optional set association
  eventId?: string;               // Optional event association
  createdAt: Date;
}
```

#### Pack
Configuration for a pack of collectible items.

```typescript
interface Pack {
  id: string;
  name: string;
  description: string;
  cost: number;
  currencyType: CurrencyType;     // SOFT or PREMIUM
  guaranteedItemCount: number;
  possibleItems: string[];        // Item IDs that can be obtained
  dropRates: DropRateConfig[];
  isActive: boolean;
  eventId?: string;
  createdAt: Date;
}
```

#### Album
Represents a collection set that can be completed for rewards.

```typescript
interface Album {
  id: string;
  name: string;
  description: string;
  theme: string;                  // e.g., "1990s Hip-Hop"
  requiredItems: string[];        // Item IDs needed to complete
  rewards: Reward[];
  isActive: boolean;
  eventId?: string;
  createdAt: Date;
}
```

#### UserCollection
A user's personal collection of items.

```typescript
interface UserCollection {
  userId: string;
  items: UserCollectibleItem[];
  completedSets: string[];
  totalValue: number;
  lastUpdated: Date;
}
```

### Rarity System

The system uses four rarity tiers:
- **COMMON**: Most frequent drops (default 70%)
- **RARE**: Uncommon drops (default 20%)
- **EPIC**: Very rare drops (default 8%)
- **LEGENDARY**: Extremely rare drops (default 2%)

## Services

### PackOpeningService

Handles the mechanics of opening packs and awarding items to users.

#### Key Methods

**openPack()**
```typescript
async openPack(
  pack: Pack,
  userId: string,
  availableItems: CollectibleItem[],
  userCollection: UserCollection
): Promise<PackOpeningResult>
```

Opens a pack for a user and returns the items received.

**Example:**
```typescript
const packService = new PackOpeningService();

const result = await packService.openPack(
  standardPack,
  'user123',
  allAvailableItems,
  userCollection
);

console.log(`Received ${result.itemsReceived.length} items!`);
result.itemsReceived.forEach(item => {
  console.log(`- ${item.name} (${item.rarity})`);
});
```

### CollectionService

Manages user collections, album progress, and reward claiming.

#### Key Methods

**isAlbumComplete()**
```typescript
isAlbumComplete(album: Album, userCollection: UserCollection): boolean
```

Checks if a user has all items needed to complete an album.

**getAlbumProgress()**
```typescript
getAlbumProgress(album: Album, userCollection: UserCollection): {
  collected: number;
  total: number;
  percentage: number;
  missingItems: string[];
}
```

Returns detailed progress for an album.

**claimAlbumRewards()**
```typescript
async claimAlbumRewards(
  userId: string,
  albumId: string,
  album: Album,
  userCollection: UserCollection
): Promise<Reward[]>
```

Claims rewards for a completed album.

**Example:**
```typescript
const collectionService = new CollectionService();

// Check progress
const progress = collectionService.getAlbumProgress(album, userCollection);
console.log(`Progress: ${progress.percentage}%`);

// Claim rewards if complete
if (collectionService.isAlbumComplete(album, userCollection)) {
  const rewards = await collectionService.claimAlbumRewards(
    'user123',
    'album1',
    album,
    userCollection
  );
}
```

### TradingService

Facilitates peer-to-peer trading of collectible items.

#### Key Methods

**createTradeOffer()**
```typescript
async createTradeOffer(
  fromUserId: string,
  toUserId: string,
  offeredItems: string[],
  requestedItems: string[],
  fromUserCollection: UserCollection,
  toUserCollection: UserCollection
): Promise<TradeOffer>
```

Creates a new trade offer between two users.

**acceptTradeOffer()**
```typescript
async acceptTradeOffer(
  tradeId: string,
  trade: TradeOffer,
  fromUserCollection: UserCollection,
  toUserCollection: UserCollection
): Promise<void>
```

Accepts and executes a trade offer.

**Example:**
```typescript
const tradingService = new TradingService();

// Create trade offer
const trade = await tradingService.createTradeOffer(
  'user1',
  'user2',
  ['item1', 'item2'],  // Offering
  ['item5'],           // Requesting
  user1Collection,
  user2Collection
);

// User 2 accepts
await tradingService.acceptTradeOffer(
  trade.id,
  trade,
  user1Collection,
  user2Collection
);
```

### EventService

Manages limited-time events and seasonal content.

#### Key Methods

**createEvent()**
```typescript
async createEvent(
  name: string,
  description: string,
  eventType: EventType,
  startDate: Date,
  endDate: Date,
  exclusiveItems: string[],
  exclusivePacks: string[],
  exclusiveAlbums: string[]
): Promise<CollectionEvent>
```

Creates a new limited-time event.

**isEventActive()**
```typescript
isEventActive(event: CollectionEvent): boolean
```

Checks if an event is currently active.

**Example:**
```typescript
const eventService = new EventService();

// Create seasonal event
const event = await eventService.createEvent(
  'Summer Hip-Hop Festival',
  'Limited-time summer collection',
  EventType.SEASONAL,
  new Date('2025-06-01'),
  new Date('2025-08-31'),
  ['summer_item1', 'summer_item2'],
  ['summer_pack1'],
  ['summer_album1']
);

// Check if active
if (eventService.isEventActive(event)) {
  console.log('Event is live!');
}
```

## Configuration

### Drop Rate Configuration

Located in `src/config/dropRates.ts`:

**Standard Pack (default)**
- Common: 70%
- Rare: 20%
- Epic: 8%
- Legendary: 2%

**Premium Pack (better odds)**
- Common: 50%
- Rare: 30%
- Epic: 15%
- Legendary: 5%

**Event Pack (enhanced)**
- Common: 45%
- Rare: 35%
- Epic: 15%
- Legendary: 5%

### Pack Costs

```typescript
PACK_CONFIG = {
  STANDARD: { cost: 100, guaranteedItems: 3 },
  PREMIUM: { cost: 500, guaranteedItems: 5 },
  MEGA: { cost: 1000, guaranteedItems: 10 }
}
```

### Trading Configuration

- **Trade Fee**: 50 soft currency per trade
- **Trade Expiration**: 48 hours

## Usage Examples

### Complete Flow: Pack Opening to Reward Claim

```typescript
import { 
  PackOpeningService, 
  CollectionService,
  Pack,
  CollectibleItem,
  UserCollection 
} from './src';

// Initialize services
const packService = new PackOpeningService();
const collectionService = new CollectionService();

// Open a pack
const result = await packService.openPack(
  standardPack,
  'user123',
  allItems,
  userCollection
);

// Update user's collection with new items
// (In production, this would update the database)

// Check for completed albums
const completedAlbums = collectionService.getCompletedAlbums(
  allAlbums,
  updatedCollection
);

// Claim rewards for completed albums
for (const album of completedAlbums) {
  if (!updatedCollection.completedSets.includes(album.id)) {
    const rewards = await collectionService.claimAlbumRewards(
      'user123',
      album.id,
      album,
      updatedCollection
    );
    console.log(`Claimed rewards for ${album.name}:`, rewards);
  }
}
```

### Creating and Managing Events

```typescript
import { EventService, EventType } from './src';

const eventService = new EventService();

// Create limited-time event
const event = await eventService.createEvent(
  'Hip-Hop Hall of Fame',
  'Collect legendary artists and venues',
  EventType.LIMITED_TIME,
  new Date(),
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  ['legend1', 'legend2', 'legend3'],
  ['legend_pack'],
  ['legend_album']
);

// Get event-specific items
const eventItems = await eventService.getEventItems(event.id, allItems);
console.log(`Event has ${eventItems.length} exclusive items`);
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

The test suite includes:

- **Unit Tests**: All utility functions and service methods
- **Integration Tests**: Pack opening flow, collection management
- **Probability Tests**: Drop rate distribution verification

### Example Test

```typescript
describe('PackOpeningService', () => {
  it('should respect drop rate probabilities', async () => {
    const iterations = 10000;
    const rarityCount = {
      COMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0
    };

    for (let i = 0; i < iterations; i++) {
      const result = await packService.openPack(...);
      result.itemsReceived.forEach(item => {
        rarityCount[item.rarity]++;
      });
    }

    // Verify distributions are within acceptable range
    expect(rarityCount.COMMON / iterations).toBeCloseTo(0.70, 1);
  });
});
```

## Building

```bash
# Build TypeScript
npm run build

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Integration Guide

### Database Integration

The current implementation uses in-memory data structures. To integrate with a database:

1. Implement data access layer for each service
2. Replace placeholder methods with actual database queries
3. Add transaction support for critical operations (trades, rewards)

Example:
```typescript
class PackOpeningService {
  constructor(private db: Database) {}

  async openPack(...) {
    // Use this.db for queries
    const pack = await this.db.packs.findById(packId);
    // ...
  }
}
```

### API Integration

To expose as REST API:

```typescript
// Example Express route
app.post('/api/packs/:packId/open', async (req, res) => {
  const packService = new PackOpeningService();
  
  try {
    const result = await packService.openPack(
      pack,
      req.user.id,
      availableItems,
      userCollection
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Analytics Integration

Hook into analytics events:

```typescript
class AnalyticsService {
  async trackEvent(event: AnalyticsEvent) {
    // Send to analytics platform (e.g., Mixpanel, Amplitude)
    await mixpanel.track(event.eventType, {
      userId: event.userId,
      ...event.metadata
    });
  }
}
```

## Security Considerations

1. **Currency Validation**: Always validate user has sufficient currency before pack purchase
2. **Trade Validation**: Verify both users own their offered items at trade execution time
3. **Rate Limiting**: Implement rate limits on pack opening and trading to prevent abuse
4. **Drop Rate Integrity**: Store drop rates securely and validate they haven't been tampered with
5. **Event Timing**: Use server-side timestamps for event validation

## Performance Optimization

1. **Caching**: Cache active events, pack configurations, and item metadata
2. **Batch Operations**: Support opening multiple packs in a single transaction
3. **Indexing**: Index items by rarity, category, and event for faster filtering
4. **Pagination**: Implement pagination for large collections

## Future Enhancements

- [ ] Marketplace for buying/selling items with in-game currency
- [ ] Crafting system to combine duplicates
- [ ] Daily login rewards with guaranteed packs
- [ ] Achievement system tied to collection milestones
- [ ] Leaderboards for collection completion
- [ ] Social features (showcasing collections, gifting)
- [ ] Pity system (guaranteed rare after X packs)
- [ ] Collection insurance/protection features

## Support

For questions or issues, please refer to the test files for usage examples or consult the inline documentation in the source code.
