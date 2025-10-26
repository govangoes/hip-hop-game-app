import { PackOpeningService } from '../PackOpeningService';
import { Pack, CollectibleItem, UserCollection } from '../../types/interfaces';
import { RarityTier, CollectibleCategory, CurrencyType } from '../../types/enums';
import { DEFAULT_DROP_RATES } from '../../config/dropRates';

describe('PackOpeningService', () => {
  let service: PackOpeningService;

  beforeEach(() => {
    service = new PackOpeningService();
  });

  describe('openPack', () => {
    const mockPack: Pack = {
      id: 'pack1',
      name: 'Standard Pack',
      description: 'A standard pack',
      cost: 100,
      currencyType: CurrencyType.SOFT,
      guaranteedItemCount: 3,
      possibleItems: ['item1', 'item2', 'item3', 'item4', 'item5'],
      dropRates: DEFAULT_DROP_RATES,
      isActive: true,
      createdAt: new Date()
    };

    const mockItems: CollectibleItem[] = [
      {
        id: 'item1',
        name: 'Common Artist',
        description: 'A common artist card',
        category: CollectibleCategory.ARTIST,
        rarity: RarityTier.COMMON,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: 'item2',
        name: 'Common Album',
        description: 'A common album card',
        category: CollectibleCategory.ALBUM,
        rarity: RarityTier.COMMON,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: 'item3',
        name: 'Rare Venue',
        description: 'A rare venue card',
        category: CollectibleCategory.VENUE,
        rarity: RarityTier.RARE,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: 'item4',
        name: 'Epic Icon',
        description: 'An epic cultural icon',
        category: CollectibleCategory.CULTURAL_ICON,
        rarity: RarityTier.EPIC,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: 'item5',
        name: 'Legendary Artist',
        description: 'A legendary artist card',
        category: CollectibleCategory.ARTIST,
        rarity: RarityTier.LEGENDARY,
        metadata: {},
        createdAt: new Date()
      }
    ];

    const mockUserCollection: UserCollection = {
      userId: 'user1',
      items: [],
      completedSets: [],
      totalValue: 0,
      lastUpdated: new Date()
    };

    it('should open pack and return items', async () => {
      const result = await service.openPack(mockPack, 'user1', mockItems, mockUserCollection);

      expect(result.packId).toBe('pack1');
      expect(result.userId).toBe('user1');
      expect(result.itemsReceived).toHaveLength(3);
      expect(result.openedAt).toBeInstanceOf(Date);
    });

    it('should throw error for inactive pack', async () => {
      const inactivePack = { ...mockPack, isActive: false };

      await expect(
        service.openPack(inactivePack, 'user1', mockItems, mockUserCollection)
      ).rejects.toThrow('Pack is not currently available');
    });

    it('should throw error when pack has no items', async () => {
      const emptyPack = { ...mockPack, possibleItems: [] };

      await expect(
        service.openPack(emptyPack, 'user1', mockItems, mockUserCollection)
      ).rejects.toThrow('No items available in this pack');
    });

    it('should return items that are in the pack', async () => {
      const result = await service.openPack(mockPack, 'user1', mockItems, mockUserCollection);

      result.itemsReceived.forEach(item => {
        expect(mockPack.possibleItems).toContain(item.id);
      });
    });
  });
});
