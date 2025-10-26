import { CollectionService } from '../CollectionService';
import { Album, UserCollection, CollectibleItem } from '../../types/interfaces';
import { RarityTier, CollectibleCategory } from '../../types/enums';

describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(() => {
    service = new CollectionService();
  });

  describe('isAlbumComplete', () => {
    it('should return true when all required items are in collection', () => {
      const album: Album = {
        id: 'album1',
        name: 'Test Album',
        description: 'Test description',
        theme: '1990s',
        requiredItems: ['item1', 'item2', 'item3'],
        rewards: [],
        isActive: true,
        createdAt: new Date()
      };

      const userCollection: UserCollection = {
        userId: 'user1',
        items: [
          { collectibleId: 'item1', acquiredAt: new Date(), count: 1, isNew: false },
          { collectibleId: 'item2', acquiredAt: new Date(), count: 1, isNew: false },
          { collectibleId: 'item3', acquiredAt: new Date(), count: 1, isNew: false }
        ],
        completedSets: [],
        totalValue: 0,
        lastUpdated: new Date()
      };

      expect(service.isAlbumComplete(album, userCollection)).toBe(true);
    });

    it('should return false when some items are missing', () => {
      const album: Album = {
        id: 'album1',
        name: 'Test Album',
        description: 'Test description',
        theme: '1990s',
        requiredItems: ['item1', 'item2', 'item3'],
        rewards: [],
        isActive: true,
        createdAt: new Date()
      };

      const userCollection: UserCollection = {
        userId: 'user1',
        items: [
          { collectibleId: 'item1', acquiredAt: new Date(), count: 1, isNew: false },
          { collectibleId: 'item2', acquiredAt: new Date(), count: 1, isNew: false }
        ],
        completedSets: [],
        totalValue: 0,
        lastUpdated: new Date()
      };

      expect(service.isAlbumComplete(album, userCollection)).toBe(false);
    });
  });

  describe('getAlbumProgress', () => {
    it('should calculate progress correctly', () => {
      const album: Album = {
        id: 'album1',
        name: 'Test Album',
        description: 'Test description',
        theme: '1990s',
        requiredItems: ['item1', 'item2', 'item3', 'item4'],
        rewards: [],
        isActive: true,
        createdAt: new Date()
      };

      const userCollection: UserCollection = {
        userId: 'user1',
        items: [
          { collectibleId: 'item1', acquiredAt: new Date(), count: 1, isNew: false },
          { collectibleId: 'item2', acquiredAt: new Date(), count: 1, isNew: false }
        ],
        completedSets: [],
        totalValue: 0,
        lastUpdated: new Date()
      };

      const progress = service.getAlbumProgress(album, userCollection);

      expect(progress.collected).toBe(2);
      expect(progress.total).toBe(4);
      expect(progress.percentage).toBe(50);
      expect(progress.missingItems).toEqual(['item3', 'item4']);
    });
  });

  describe('getDuplicateItems', () => {
    it('should return only items with count > 1', () => {
      const userCollection: UserCollection = {
        userId: 'user1',
        items: [
          { collectibleId: 'item1', acquiredAt: new Date(), count: 1, isNew: false },
          { collectibleId: 'item2', acquiredAt: new Date(), count: 3, isNew: false },
          { collectibleId: 'item3', acquiredAt: new Date(), count: 2, isNew: false },
          { collectibleId: 'item4', acquiredAt: new Date(), count: 1, isNew: false }
        ],
        completedSets: [],
        totalValue: 0,
        lastUpdated: new Date()
      };

      const duplicates = service.getDuplicateItems(userCollection);

      expect(duplicates).toHaveLength(2);
      expect(duplicates.map(d => d.collectibleId)).toEqual(['item2', 'item3']);
    });
  });

  describe('calculateCollectionValue', () => {
    it('should calculate total value based on rarity', () => {
      const allItems: CollectibleItem[] = [
        {
          id: 'item1',
          name: 'Common Item',
          description: 'desc',
          category: CollectibleCategory.ARTIST,
          rarity: RarityTier.COMMON,
          metadata: {},
          createdAt: new Date()
        },
        {
          id: 'item2',
          name: 'Rare Item',
          description: 'desc',
          category: CollectibleCategory.ALBUM,
          rarity: RarityTier.RARE,
          metadata: {},
          createdAt: new Date()
        },
        {
          id: 'item3',
          name: 'Legendary Item',
          description: 'desc',
          category: CollectibleCategory.VENUE,
          rarity: RarityTier.LEGENDARY,
          metadata: {},
          createdAt: new Date()
        }
      ];

      const userCollection: UserCollection = {
        userId: 'user1',
        items: [
          { collectibleId: 'item1', acquiredAt: new Date(), count: 2, isNew: false }, // 2 * 10 = 20
          { collectibleId: 'item2', acquiredAt: new Date(), count: 1, isNew: false }, // 1 * 50 = 50
          { collectibleId: 'item3', acquiredAt: new Date(), count: 1, isNew: false }  // 1 * 1000 = 1000
        ],
        completedSets: [],
        totalValue: 0,
        lastUpdated: new Date()
      };

      const value = service.calculateCollectionValue(userCollection, allItems);
      expect(value).toBe(1070); // 20 + 50 + 1000
    });
  });
});
