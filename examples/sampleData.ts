import { 
  CollectibleItem, 
  Pack, 
  Album,
  CollectionEvent 
} from '../src/types/interfaces';
import { 
  RarityTier, 
  CollectibleCategory, 
  CurrencyType,
  EventType 
} from '../src/types/enums';
import { DEFAULT_DROP_RATES, PREMIUM_DROP_RATES } from '../src/config/dropRates';

/**
 * Sample collectible items representing hip-hop artists, albums, venues, and cultural icons
 */
export const sampleItems: CollectibleItem[] = [
  // Legendary Artists
  {
    id: 'item-001',
    name: 'Tupac Shakur',
    description: 'Legendary West Coast rapper and actor, known for poetic lyrics and social commentary',
    category: CollectibleCategory.ARTIST,
    rarity: RarityTier.LEGENDARY,
    imageUrl: '/assets/artists/tupac.png',
    metadata: { era: '1990s', region: 'West Coast', genre: 'Gangsta Rap' },
    albumId: 'album-001',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-002',
    name: 'Notorious B.I.G.',
    description: 'Legendary East Coast rapper, master storyteller and lyricist',
    category: CollectibleCategory.ARTIST,
    rarity: RarityTier.LEGENDARY,
    imageUrl: '/assets/artists/biggie.png',
    metadata: { era: '1990s', region: 'East Coast', genre: 'East Coast Hip-Hop' },
    albumId: 'album-001',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-003',
    name: 'Jay-Z',
    description: 'Hip-hop mogul and legendary rapper from Brooklyn',
    category: CollectibleCategory.ARTIST,
    rarity: RarityTier.LEGENDARY,
    imageUrl: '/assets/artists/jayz.png',
    metadata: { era: '1990s-2020s', region: 'East Coast', genre: 'Hip-Hop' },
    createdAt: new Date('2025-01-01')
  },

  // Epic Albums
  {
    id: 'item-004',
    name: 'The Chronic',
    description: 'Dr. Dre\'s groundbreaking debut solo album that defined G-Funk',
    category: CollectibleCategory.ALBUM,
    rarity: RarityTier.EPIC,
    imageUrl: '/assets/albums/chronic.png',
    metadata: { year: 1992, artist: 'Dr. Dre', genre: 'G-Funk' },
    albumId: 'album-002',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-005',
    name: 'Illmatic',
    description: 'Nas\'s debut album, considered one of the greatest hip-hop albums ever',
    category: CollectibleCategory.ALBUM,
    rarity: RarityTier.EPIC,
    imageUrl: '/assets/albums/illmatic.png',
    metadata: { year: 1994, artist: 'Nas', genre: 'East Coast Hip-Hop' },
    albumId: 'album-002',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-006',
    name: 'Enter the Wu-Tang (36 Chambers)',
    description: 'Wu-Tang Clan\'s revolutionary debut album',
    category: CollectibleCategory.ALBUM,
    rarity: RarityTier.EPIC,
    imageUrl: '/assets/albums/wu-tang.png',
    metadata: { year: 1993, artist: 'Wu-Tang Clan', genre: 'East Coast Hip-Hop' },
    albumId: 'album-002',
    createdAt: new Date('2025-01-01')
  },

  // Rare Venues
  {
    id: 'item-007',
    name: 'Apollo Theater',
    description: 'Historic Harlem venue, birthplace of many music legends',
    category: CollectibleCategory.VENUE,
    rarity: RarityTier.RARE,
    imageUrl: '/assets/venues/apollo.png',
    metadata: { location: 'Harlem, NYC', established: 1934 },
    albumId: 'album-003',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-008',
    name: 'The Warehouse',
    description: 'Legendary underground hip-hop venue',
    category: CollectibleCategory.VENUE,
    rarity: RarityTier.RARE,
    imageUrl: '/assets/venues/warehouse.png',
    metadata: { location: 'Bronx, NYC', type: 'Underground' },
    albumId: 'album-003',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-009',
    name: 'Sunset Strip',
    description: 'Famous West Coast performance location',
    category: CollectibleCategory.VENUE,
    rarity: RarityTier.RARE,
    imageUrl: '/assets/venues/sunset.png',
    metadata: { location: 'Los Angeles, CA', era: '1990s' },
    albumId: 'album-003',
    createdAt: new Date('2025-01-01')
  },

  // Common Cultural Icons
  {
    id: 'item-010',
    name: 'Breakdancing',
    description: 'Street dance style that is one of the four elements of hip-hop',
    category: CollectibleCategory.CULTURAL_ICON,
    rarity: RarityTier.COMMON,
    imageUrl: '/assets/icons/breakdancing.png',
    metadata: { element: 'Dance', origin: '1970s Bronx' },
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-011',
    name: 'Graffiti Art',
    description: 'Visual art expression fundamental to hip-hop culture',
    category: CollectibleCategory.CULTURAL_ICON,
    rarity: RarityTier.COMMON,
    imageUrl: '/assets/icons/graffiti.png',
    metadata: { element: 'Art', origin: '1970s NYC' },
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-012',
    name: 'Turntablism',
    description: 'The art of manipulating sounds using turntables and DJ mixer',
    category: CollectibleCategory.CULTURAL_ICON,
    rarity: RarityTier.COMMON,
    imageUrl: '/assets/icons/turntables.png',
    metadata: { element: 'DJ', pioneers: 'Grandmaster Flash, DJ Kool Herc' },
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-013',
    name: 'Boom Box',
    description: 'Portable music player, symbol of 1980s hip-hop culture',
    category: CollectibleCategory.CULTURAL_ICON,
    rarity: RarityTier.COMMON,
    imageUrl: '/assets/icons/boombox.png',
    metadata: { era: '1980s', significance: 'Street Music' },
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-014',
    name: 'Gold Chain',
    description: 'Iconic hip-hop fashion statement',
    category: CollectibleCategory.CULTURAL_ICON,
    rarity: RarityTier.COMMON,
    imageUrl: '/assets/icons/goldchain.png',
    metadata: { category: 'Fashion', era: '1980s-Present' },
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'item-015',
    name: 'Sneaker Culture',
    description: 'Athletic shoes as fashion statement and status symbol',
    category: CollectibleCategory.CULTURAL_ICON,
    rarity: RarityTier.COMMON,
    imageUrl: '/assets/icons/sneakers.png',
    metadata: { category: 'Fashion', brands: 'Adidas, Nike, Puma' },
    createdAt: new Date('2025-01-01')
  }
];

/**
 * Sample pack configurations
 */
export const samplePacks: Pack[] = [
  {
    id: 'pack-001',
    name: 'Standard Hip-Hop Pack',
    description: 'A basic pack containing 3 random collectibles from the hip-hop universe',
    cost: 100,
    currencyType: CurrencyType.SOFT,
    guaranteedItemCount: 3,
    possibleItems: sampleItems.map(item => item.id),
    dropRates: DEFAULT_DROP_RATES,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'pack-002',
    name: 'Premium Legends Pack',
    description: 'Premium pack with 5 items and better odds of rare collectibles',
    cost: 500,
    currencyType: CurrencyType.PREMIUM,
    guaranteedItemCount: 5,
    possibleItems: sampleItems.map(item => item.id),
    dropRates: PREMIUM_DROP_RATES,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'pack-003',
    name: 'Golden Era Pack',
    description: 'Focus on 1990s artists and albums, 4 items with boosted rare rates',
    cost: 250,
    currencyType: CurrencyType.SOFT,
    guaranteedItemCount: 4,
    possibleItems: sampleItems
      .filter(item => item.metadata.era?.includes('1990s'))
      .map(item => item.id),
    dropRates: PREMIUM_DROP_RATES,
    isActive: true,
    createdAt: new Date('2025-01-01')
  }
];

/**
 * Sample album/set configurations
 */
export const sampleAlbums: Album[] = [
  {
    id: 'album-001',
    name: 'Legends of the 90s',
    description: 'Collect the most iconic rappers from hip-hop\'s golden era',
    theme: '1990s Hip-Hop Legends',
    requiredItems: ['item-001', 'item-002', 'item-003'], // Tupac, Biggie, Jay-Z
    rewards: [
      { type: 'CURRENCY', amount: 1000 },
      { type: 'SKILL_POINTS', amount: 50 }
    ],
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'album-002',
    name: 'Classic Albums Collection',
    description: 'Own the albums that defined hip-hop',
    theme: 'Essential Hip-Hop Albums',
    requiredItems: ['item-004', 'item-005', 'item-006'], // The Chronic, Illmatic, Wu-Tang
    rewards: [
      { type: 'CURRENCY', amount: 2000 },
      { type: 'KNOWLEDGE_POINTS', amount: 100 },
      { type: 'COSMETIC', itemId: 'cosmetic-vinyl-frame' }
    ],
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'album-003',
    name: 'Historic Venues',
    description: 'Collect the stages where legends were made',
    theme: 'Legendary Performance Venues',
    requiredItems: ['item-007', 'item-008', 'item-009'], // Apollo, Warehouse, Sunset Strip
    rewards: [
      { type: 'CURRENCY', amount: 1500 },
      { type: 'ITEM', itemId: 'bonus-venue-poster' }
    ],
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'album-004',
    name: 'Hip-Hop Culture',
    description: 'Understand the four elements and culture of hip-hop',
    theme: 'Elements of Hip-Hop',
    requiredItems: ['item-010', 'item-011', 'item-012', 'item-013', 'item-014', 'item-015'],
    rewards: [
      { type: 'SKILL_POINTS', amount: 25 },
      { type: 'KNOWLEDGE_POINTS', amount: 50 }
    ],
    isActive: true,
    createdAt: new Date('2025-01-01')
  }
];

/**
 * Sample limited-time event
 */
export const sampleEvent: CollectionEvent = {
  id: 'event-001',
  name: 'Summer of Hip-Hop 2025',
  description: 'Celebrate the summer with exclusive limited-time collectibles',
  eventType: EventType.SEASONAL,
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-08-31'),
  exclusiveItems: [], // Would include special summer-themed items
  exclusivePacks: [], // Would include special summer packs
  exclusiveAlbums: [], // Would include summer album collections
  isActive: false, // Not active in current timeline
  createdAt: new Date('2025-01-01')
};
