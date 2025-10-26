import { 
  TradeOffer, 
  UserCollection,
  AnalyticsEvent 
} from '../types/interfaces';
import { TradeStatus } from '../types/enums';
import { generateId, addHours } from '../utils/dateUtils';
import { TIME_CONFIG, CURRENCY_CONFIG } from '../config/dropRates';

/**
 * Service for handling player-to-player trading
 */
export class TradingService {
  /**
   * Create a new trade offer
   */
  async createTradeOffer(
    fromUserId: string,
    toUserId: string,
    offeredItems: string[],
    requestedItems: string[],
    fromUserCollection: UserCollection,
    toUserCollection: UserCollection
  ): Promise<TradeOffer> {
    // Validate users are different
    if (fromUserId === toUserId) {
      throw new Error('Cannot trade with yourself');
    }

    // Validate offered items are in sender's collection
    this.validateUserHasItems(fromUserCollection, offeredItems);

    // Validate requested items are in recipient's collection
    this.validateUserHasItems(toUserCollection, requestedItems);

    // Create trade offer
    const tradeOffer: TradeOffer = {
      id: generateId(),
      fromUserId,
      toUserId,
      offeredItems,
      requestedItems,
      status: TradeStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: addHours(new Date(), TIME_CONFIG.TRADE_EXPIRATION_HOURS)
    };

    // Save trade offer (would persist to database)
    await this.saveTradeOffer(tradeOffer);

    return tradeOffer;
  }

  /**
   * Accept a trade offer
   */
  async acceptTradeOffer(
    tradeId: string,
    trade: TradeOffer,
    fromUserCollection: UserCollection,
    toUserCollection: UserCollection
  ): Promise<void> {
    // Validate trade is pending
    if (trade.status !== TradeStatus.PENDING) {
      throw new Error('Trade is not in pending status');
    }

    // Validate trade has not expired
    if (new Date() > trade.expiresAt) {
      await this.updateTradeStatus(tradeId, TradeStatus.CANCELLED);
      throw new Error('Trade has expired');
    }

    // Re-validate both users still have the items
    this.validateUserHasItems(fromUserCollection, trade.offeredItems);
    this.validateUserHasItems(toUserCollection, trade.requestedItems);

    // Execute the trade
    await this.executeTradeTransfer(
      trade.fromUserId,
      trade.toUserId,
      trade.offeredItems,
      trade.requestedItems
    );

    // Update trade status
    await this.updateTradeStatus(tradeId, TradeStatus.ACCEPTED);

    // Deduct trade fee
    await this.deductTradeFee(trade.fromUserId);
    await this.deductTradeFee(trade.toUserId);

    // Record analytics
    const analyticsEvent: AnalyticsEvent = {
      eventType: 'TRADE_COMPLETED',
      userId: trade.fromUserId,
      metadata: {
        tradeId,
        toUserId: trade.toUserId,
        offeredItems: trade.offeredItems,
        requestedItems: trade.requestedItems
      },
      timestamp: new Date()
    };
    await this.recordAnalytics(analyticsEvent);
  }

  /**
   * Reject a trade offer
   */
  async rejectTradeOffer(tradeId: string, trade: TradeOffer): Promise<void> {
    if (trade.status !== TradeStatus.PENDING) {
      throw new Error('Trade is not in pending status');
    }

    await this.updateTradeStatus(tradeId, TradeStatus.REJECTED);
  }

  /**
   * Cancel a trade offer
   */
  async cancelTradeOffer(
    tradeId: string,
    trade: TradeOffer,
    userId: string
  ): Promise<void> {
    // Only the creator can cancel
    if (trade.fromUserId !== userId) {
      throw new Error('Only the trade creator can cancel');
    }

    if (trade.status !== TradeStatus.PENDING) {
      throw new Error('Trade is not in pending status');
    }

    await this.updateTradeStatus(tradeId, TradeStatus.CANCELLED);
  }

  /**
   * Get active trade offers for a user
   */
  async getUserTradeOffers(_userId: string): Promise<TradeOffer[]> {
    // Implementation would query database
    return [];
  }

  /**
   * Validate user has all specified items
   */
  private validateUserHasItems(
    userCollection: UserCollection,
    itemIds: string[]
  ): void {
    const userItemIds = new Set(
      userCollection.items.map(item => item.collectibleId)
    );

    for (const itemId of itemIds) {
      if (!userItemIds.has(itemId)) {
        throw new Error(`User does not have item: ${itemId}`);
      }
    }
  }

  /**
   * Execute the actual item transfer
   */
  private async executeTradeTransfer(
    fromUserId: string,
    toUserId: string,
    _offeredItems: string[],
    _requestedItems: string[]
  ): Promise<void> {
    // Implementation would update both users' collections
    console.log(`Transferring items from ${fromUserId} to ${toUserId}`);
  }

  /**
   * Save trade offer to database
   */
  private async saveTradeOffer(trade: TradeOffer): Promise<void> {
    // Implementation would persist to database
    console.log('Saving trade offer:', trade.id);
  }

  /**
   * Update trade status
   */
  private async updateTradeStatus(
    tradeId: string,
    status: TradeStatus
  ): Promise<void> {
    // Implementation would update database
    console.log(`Updating trade ${tradeId} status to ${status}`);
  }

  /**
   * Deduct trade fee from user
   */
  private async deductTradeFee(userId: string): Promise<void> {
    // Implementation would deduct soft currency
    console.log(`Deducting ${CURRENCY_CONFIG.TRADE_FEE} from user ${userId}`);
  }

  /**
   * Record analytics event
   */
  private async recordAnalytics(event: AnalyticsEvent): Promise<void> {
    console.log('Analytics event:', event);
  }
}
