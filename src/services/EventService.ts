import { 
  CollectionEvent,
  CollectibleItem,
  Pack,
  Album 
} from '../types/interfaces';
import { EventType } from '../types/enums';
import { isWithinDateRange } from '../utils/dateUtils';

/**
 * Service for managing limited-time events and seasonal content
 */
export class EventService {
  /**
   * Get all active events
   */
  async getActiveEvents(): Promise<CollectionEvent[]> {
    // Implementation would query database for events
    // Filter by current date and active status
    return [];
  }

  /**
   * Check if an event is currently active
   */
  isEventActive(event: CollectionEvent): boolean {
    return event.isActive && isWithinDateRange(event.startDate, event.endDate);
  }

  /**
   * Get items exclusive to an event
   */
  async getEventItems(eventId: string, allItems: CollectibleItem[]): Promise<CollectibleItem[]> {
    return allItems.filter(item => item.eventId === eventId);
  }

  /**
   * Get packs exclusive to an event
   */
  async getEventPacks(eventId: string, allPacks: Pack[]): Promise<Pack[]> {
    return allPacks.filter(pack => pack.eventId === eventId);
  }

  /**
   * Get albums exclusive to an event
   */
  async getEventAlbums(eventId: string, allAlbums: Album[]): Promise<Album[]> {
    return allAlbums.filter(album => album.eventId === eventId);
  }

  /**
   * Create a new event
   */
  async createEvent(
    name: string,
    description: string,
    eventType: EventType,
    startDate: Date,
    endDate: Date,
    exclusiveItems: string[],
    exclusivePacks: string[],
    exclusiveAlbums: string[]
  ): Promise<CollectionEvent> {
    // Validate dates
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const event: CollectionEvent = {
      id: this.generateEventId(),
      name,
      description,
      eventType,
      startDate,
      endDate,
      exclusiveItems,
      exclusivePacks,
      exclusiveAlbums,
      isActive: true,
      createdAt: new Date()
    };

    // Save event (would persist to database)
    await this.saveEvent(event);

    return event;
  }

  /**
   * End an event early
   */
  async endEvent(eventId: string): Promise<void> {
    // Implementation would update event status
    console.log(`Ending event: ${eventId}`);
  }

  /**
   * Get events by type
   */
  async getEventsByType(_eventType: EventType): Promise<CollectionEvent[]> {
    // Implementation would query database
    return [];
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(): Promise<CollectionEvent[]> {
    // Implementation would query database for events starting soon
    return [];
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Save event to database
   */
  private async saveEvent(event: CollectionEvent): Promise<void> {
    // Implementation would persist to database
    console.log('Saving event:', event.id);
  }
}
