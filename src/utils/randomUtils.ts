import { RarityTier } from '../types/enums';
import { DropRateConfig, CollectibleItem } from '../types/interfaces';

/**
 * Select a rarity tier based on weighted probabilities
 */
export function selectRarityByWeight(dropRates: DropRateConfig[]): RarityTier {
  // Validate probabilities sum to approximately 1.0
  const sum = dropRates.reduce((acc, rate) => acc + rate.probability, 0);
  if (Math.abs(sum - 1.0) > 0.01) {
    throw new Error(`Drop rates must sum to 1.0, got ${sum}`);
  }

  const random = Math.random();
  let cumulativeProbability = 0;

  for (const rate of dropRates) {
    cumulativeProbability += rate.probability;
    if (random <= cumulativeProbability) {
      return rate.rarity;
    }
  }

  // Fallback to most common rarity if something goes wrong
  return RarityTier.COMMON;
}

/**
 * Select random items from a pool based on rarity
 */
export function selectRandomItems(
  availableItems: CollectibleItem[],
  count: number,
  dropRates: DropRateConfig[]
): CollectibleItem[] {
  if (availableItems.length === 0) {
    return [];
  }

  const selectedItems: CollectibleItem[] = [];

  for (let i = 0; i < count; i++) {
    const targetRarity = selectRarityByWeight(dropRates);
    const itemsOfRarity = availableItems.filter(item => item.rarity === targetRarity);

    if (itemsOfRarity.length === 0) {
      // If no items of target rarity, fall back to any available item
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      selectedItems.push(randomItem);
    } else {
      const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
      selectedItems.push(randomItem);
    }
  }

  return selectedItems;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if drop rates are valid
 */
export function validateDropRates(dropRates: DropRateConfig[]): boolean {
  const sum = dropRates.reduce((acc, rate) => acc + rate.probability, 0);
  return Math.abs(sum - 1.0) <= 0.01 && dropRates.every(rate => rate.probability >= 0 && rate.probability <= 1);
}
