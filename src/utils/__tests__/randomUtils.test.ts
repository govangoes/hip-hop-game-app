import { selectRarityByWeight, selectRandomItems, validateDropRates } from '../randomUtils';
import { RarityTier } from '../../types/enums';
import { DropRateConfig, CollectibleItem } from '../../types/interfaces';

describe('randomUtils', () => {
  describe('validateDropRates', () => {
    it('should validate correct drop rates', () => {
      const dropRates: DropRateConfig[] = [
        { rarity: RarityTier.COMMON, probability: 0.70 },
        { rarity: RarityTier.RARE, probability: 0.20 },
        { rarity: RarityTier.EPIC, probability: 0.08 },
        { rarity: RarityTier.LEGENDARY, probability: 0.02 }
      ];
      expect(validateDropRates(dropRates)).toBe(true);
    });

    it('should reject drop rates that do not sum to 1.0', () => {
      const dropRates: DropRateConfig[] = [
        { rarity: RarityTier.COMMON, probability: 0.50 },
        { rarity: RarityTier.RARE, probability: 0.30 }
      ];
      expect(validateDropRates(dropRates)).toBe(false);
    });

    it('should reject negative probabilities', () => {
      const dropRates: DropRateConfig[] = [
        { rarity: RarityTier.COMMON, probability: -0.10 },
        { rarity: RarityTier.RARE, probability: 1.10 }
      ];
      expect(validateDropRates(dropRates)).toBe(false);
    });
  });

  describe('selectRarityByWeight', () => {
    const dropRates: DropRateConfig[] = [
      { rarity: RarityTier.COMMON, probability: 0.70 },
      { rarity: RarityTier.RARE, probability: 0.20 },
      { rarity: RarityTier.EPIC, probability: 0.08 },
      { rarity: RarityTier.LEGENDARY, probability: 0.02 }
    ];

    it('should select a rarity tier', () => {
      const rarity = selectRarityByWeight(dropRates);
      expect(Object.values(RarityTier)).toContain(rarity);
    });

    it('should throw error for invalid drop rates', () => {
      const invalidRates: DropRateConfig[] = [
        { rarity: RarityTier.COMMON, probability: 0.50 }
      ];
      expect(() => selectRarityByWeight(invalidRates)).toThrow();
    });

    it('should distribute rarities according to probabilities', () => {
      const iterations = 10000;
      const counts: Record<RarityTier, number> = {
        [RarityTier.COMMON]: 0,
        [RarityTier.RARE]: 0,
        [RarityTier.EPIC]: 0,
        [RarityTier.LEGENDARY]: 0
      };

      for (let i = 0; i < iterations; i++) {
        const rarity = selectRarityByWeight(dropRates);
        counts[rarity]++;
      }

      // Check that distributions are approximately correct (within 10% margin)
      expect(counts[RarityTier.COMMON] / iterations).toBeCloseTo(0.70, 1);
      expect(counts[RarityTier.RARE] / iterations).toBeCloseTo(0.20, 1);
      expect(counts[RarityTier.EPIC] / iterations).toBeCloseTo(0.08, 1);
      expect(counts[RarityTier.LEGENDARY] / iterations).toBeCloseTo(0.02, 1);
    });
  });

  describe('selectRandomItems', () => {
    const mockItems: CollectibleItem[] = [
      {
        id: '1',
        name: 'Common Item 1',
        description: 'A common item',
        category: 'ARTIST' as any,
        rarity: RarityTier.COMMON,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Common Item 2',
        description: 'Another common item',
        category: 'ARTIST' as any,
        rarity: RarityTier.COMMON,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: '3',
        name: 'Rare Item',
        description: 'A rare item',
        category: 'ALBUM' as any,
        rarity: RarityTier.RARE,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: '4',
        name: 'Epic Item',
        description: 'An epic item',
        category: 'VENUE' as any,
        rarity: RarityTier.EPIC,
        metadata: {},
        createdAt: new Date()
      },
      {
        id: '5',
        name: 'Legendary Item',
        description: 'A legendary item',
        category: 'CULTURAL_ICON' as any,
        rarity: RarityTier.LEGENDARY,
        metadata: {},
        createdAt: new Date()
      }
    ];

    const dropRates: DropRateConfig[] = [
      { rarity: RarityTier.COMMON, probability: 0.70 },
      { rarity: RarityTier.RARE, probability: 0.20 },
      { rarity: RarityTier.EPIC, probability: 0.08 },
      { rarity: RarityTier.LEGENDARY, probability: 0.02 }
    ];

    it('should select the correct number of items', () => {
      const count = 5;
      const selected = selectRandomItems(mockItems, count, dropRates);
      expect(selected).toHaveLength(count);
    });

    it('should select items from available pool', () => {
      const selected = selectRandomItems(mockItems, 3, dropRates);
      selected.forEach(item => {
        expect(mockItems).toContainEqual(item);
      });
    });

    it('should handle empty item pool gracefully', () => {
      const selected = selectRandomItems([], 5, dropRates);
      expect(selected).toHaveLength(0);
    });
  });
});
