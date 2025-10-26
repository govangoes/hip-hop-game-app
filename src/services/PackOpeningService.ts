import { 
  Pack, 
  PackOpeningResult, 
  CollectibleItem, 
  UserCollection,
  UserCollectibleItem,
  AnalyticsEvent 
} from '../types/interfaces';
import { CurrencyType } from '../types/enums';
import { selectRandomItems } from '../utils/randomUtils';

/**
 * Service for handling pack opening mechanics
 */
export class PackOpeningService {
  /**
   * Open a pack for a user
   */
  async openPack(
    pack: Pack,
    userId: string,
    availableItems: CollectibleItem[],
    userCollection: UserCollection
  ): Promise<PackOpeningResult> {
    // Validate pack is active
    if (!pack.isActive) {
      throw new Error('Pack is not currently available');
    }

    // Filter available items to only those in the pack
    const packItems = availableItems.filter(item => 
      pack.possibleItems.includes(item.id)
    );

    if (packItems.length === 0) {
      throw new Error('No items available in this pack');
    }

    // Select random items based on drop rates
    const itemsReceived = selectRandomItems(
      packItems,
      pack.guaranteedItemCount,
      pack.dropRates
    );

    // Update user collection
    const updatedCollection = this.updateUserCollection(
      userCollection,
      itemsReceived
    );

    // Check for newly completed sets
    const newCompletedSets = this.checkCompletedSets(updatedCollection);

    // Create analytics event
    const analyticsEvent: AnalyticsEvent = {
      eventType: 'PACK_OPENED',
      userId,
      metadata: {
        packId: pack.id,
        itemsReceived: itemsReceived.map(i => i.id),
        rarities: itemsReceived.map(i => i.rarity)
      },
      timestamp: new Date()
    };

    // Record analytics (implementation would send to analytics service)
    await this.recordAnalytics(analyticsEvent);

    return {
      packId: pack.id,
      userId,
      itemsReceived,
      newCompletedSets,
      rewardsEarned: [], // Would be populated based on completed sets
      openedAt: new Date()
    };
  }

  /**
   * Update user collection with new items
   */
  private updateUserCollection(
    collection: UserCollection,
    newItems: CollectibleItem[]
  ): UserCollection {
    const updatedItems = [...collection.items];

    for (const newItem of newItems) {
      const existingIndex = updatedItems.findIndex(
        item => item.collectibleId === newItem.id
      );

      if (existingIndex >= 0) {
        // Increment count for existing item
        updatedItems[existingIndex].count += 1;
        updatedItems[existingIndex].isNew = false;
      } else {
        // Add new item to collection
        const userItem: UserCollectibleItem = {
          collectibleId: newItem.id,
          acquiredAt: new Date(),
          count: 1,
          isNew: true
        };
        updatedItems.push(userItem);
      }
    }

    return {
      ...collection,
      items: updatedItems,
      lastUpdated: new Date()
    };
  }

  /**
   * Check which sets are newly completed
   */
  private checkCompletedSets(_collection: UserCollection): string[] {
    // This would check against album definitions to see if user now has all required items
    // Implementation would query album service
    return [];
  }

  /**
   * Validate user has enough currency
   */
  async validateCurrency(
    _userId: string,
    _amount: number,
    _currencyType: CurrencyType
  ): Promise<boolean> {
    // Implementation would check user's currency balance
    // For now, return true as placeholder
    return true;
  }

  /**
   * Deduct currency from user
   */
  async deductCurrency(
    _userId: string,
    _amount: number,
    _currencyType: CurrencyType
  ): Promise<void> {
    // Implementation would deduct from user's currency balance
  }

  /**
   * Record analytics event
   */
  private async recordAnalytics(event: AnalyticsEvent): Promise<void> {
    // Implementation would send to analytics service
    console.log('Analytics event:', event);
  }
}
