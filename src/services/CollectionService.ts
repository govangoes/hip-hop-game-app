import { 
  Album, 
  UserCollection, 
  CollectibleItem,
  Reward,
  AnalyticsEvent 
} from '../types/interfaces';

/**
 * Service for managing collections and albums
 */
export class CollectionService {
  /**
   * Get user's collection
   */
  async getUserCollection(userId: string): Promise<UserCollection> {
    // Implementation would query database
    // Placeholder return
    return {
      userId,
      items: [],
      completedSets: [],
      totalValue: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Check if user has completed a specific album/set
   */
  isAlbumComplete(album: Album, userCollection: UserCollection): boolean {
    const userItemIds = new Set(userCollection.items.map(item => item.collectibleId));
    
    return album.requiredItems.every(requiredId => 
      userItemIds.has(requiredId)
    );
  }

  /**
   * Get all completed albums for a user
   */
  getCompletedAlbums(albums: Album[], userCollection: UserCollection): Album[] {
    return albums.filter(album => this.isAlbumComplete(album, userCollection));
  }

  /**
   * Get album completion progress
   */
  getAlbumProgress(album: Album, userCollection: UserCollection): {
    collected: number;
    total: number;
    percentage: number;
    missingItems: string[];
  } {
    const userItemIds = new Set(userCollection.items.map(item => item.collectibleId));
    const collected = album.requiredItems.filter(id => userItemIds.has(id)).length;
    const total = album.requiredItems.length;
    const missingItems = album.requiredItems.filter(id => !userItemIds.has(id));

    return {
      collected,
      total,
      percentage: (collected / total) * 100,
      missingItems
    };
  }

  /**
   * Claim rewards for completed album
   */
  async claimAlbumRewards(
    userId: string,
    albumId: string,
    album: Album,
    userCollection: UserCollection
  ): Promise<Reward[]> {
    // Verify album is complete
    if (!this.isAlbumComplete(album, userCollection)) {
      throw new Error('Album is not complete');
    }

    // Check if already claimed
    if (userCollection.completedSets.includes(albumId)) {
      throw new Error('Rewards already claimed for this album');
    }

    // Award rewards
    await this.awardRewards(userId, album.rewards);

    // Mark album as completed
    await this.markAlbumCompleted(userId, albumId);

    // Record analytics
    const analyticsEvent: AnalyticsEvent = {
      eventType: 'SET_COMPLETED',
      userId,
      metadata: {
        albumId,
        albumName: album.name,
        rewards: album.rewards
      },
      timestamp: new Date()
    };
    await this.recordAnalytics(analyticsEvent);

    return album.rewards;
  }

  /**
   * Get duplicate items (count > 1)
   */
  getDuplicateItems(userCollection: UserCollection): UserCollection['items'] {
    return userCollection.items.filter(item => item.count > 1);
  }

  /**
   * Calculate total collection value
   */
  calculateCollectionValue(
    userCollection: UserCollection,
    allItems: CollectibleItem[]
  ): number {
    let totalValue = 0;
    const itemMap = new Map(allItems.map(item => [item.id, item]));

    for (const userItem of userCollection.items) {
      const item = itemMap.get(userItem.collectibleId);
      if (item) {
        // Simple value calculation based on rarity
        const rarityValue = this.getRarityValue(item.rarity);
        totalValue += rarityValue * userItem.count;
      }
    }

    return totalValue;
  }

  /**
   * Get value multiplier based on rarity
   */
  private getRarityValue(rarity: string): number {
    const values: Record<string, number> = {
      COMMON: 10,
      RARE: 50,
      EPIC: 200,
      LEGENDARY: 1000
    };
    return values[rarity] || 10;
  }

  /**
   * Award rewards to user
   */
  private async awardRewards(userId: string, rewards: Reward[]): Promise<void> {
    // Implementation would update user's inventory/currency
    for (const reward of rewards) {
      console.log(`Awarding ${reward.type} to user ${userId}:`, reward);
    }
  }

  /**
   * Mark album as completed in user's collection
   */
  private async markAlbumCompleted(userId: string, albumId: string): Promise<void> {
    // Implementation would update database
    console.log(`Marking album ${albumId} as completed for user ${userId}`);
  }

  /**
   * Record analytics event
   */
  private async recordAnalytics(event: AnalyticsEvent): Promise<void> {
    console.log('Analytics event:', event);
  }
}
