import { PackOpeningService } from '../src/services/PackOpeningService';
import { CollectionService } from '../src/services/CollectionService';
import { TradingService } from '../src/services/TradingService';
import { EventService } from '../src/services/EventService';
import { UserCollection } from '../src/types/interfaces';
import { sampleItems, samplePacks, sampleAlbums } from './sampleData';

/**
 * Demo: Complete workflow of the card/sticker collection system
 * 
 * This example demonstrates:
 * 1. Opening packs and receiving items
 * 2. Building a collection
 * 3. Completing albums for rewards
 * 4. Trading items with other players
 */

async function runDemo() {
  console.log('🎵 Hip-Hop Metaverse RPG - Card Collection System Demo 🎵\n');
  console.log('=' .repeat(60));
  
  // Initialize services
  const packService = new PackOpeningService();
  const collectionService = new CollectionService();
  const tradingService = new TradingService();
  const eventService = new EventService();

  // Create mock user collections
  const user1Collection: UserCollection = {
    userId: 'user-001',
    items: [],
    completedSets: [],
    totalValue: 0,
    lastUpdated: new Date()
  };

  const user2Collection: UserCollection = {
    userId: 'user-002',
    items: [],
    completedSets: [],
    totalValue: 0,
    lastUpdated: new Date()
  };

  // ========================================================================
  // DEMO 1: Open a Standard Pack
  // ========================================================================
  console.log('\n📦 DEMO 1: Opening a Standard Hip-Hop Pack');
  console.log('-'.repeat(60));
  
  const standardPack = samplePacks[0];
  console.log(`\nPack: ${standardPack.name}`);
  console.log(`Cost: ${standardPack.cost} ${standardPack.currencyType} currency`);
  console.log(`Guaranteed Items: ${standardPack.guaranteedItemCount}`);
  console.log('\nDrop Rates:');
  standardPack.dropRates.forEach(rate => {
    console.log(`  ${rate.rarity}: ${(rate.probability * 100).toFixed(0)}%`);
  });

  const packResult1 = await packService.openPack(
    standardPack,
    user1Collection.userId,
    sampleItems,
    user1Collection
  );

  console.log('\n✨ Items Received:');
  packResult1.itemsReceived.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} (${item.rarity})`);
    console.log(`     Category: ${item.category}`);
    console.log(`     ${item.description}`);
    
    // Update collection
    const existing = user1Collection.items.find(i => i.collectibleId === item.id);
    if (existing) {
      existing.count++;
    } else {
      user1Collection.items.push({
        collectibleId: item.id,
        acquiredAt: new Date(),
        count: 1,
        isNew: true
      });
    }
  });

  // ========================================================================
  // DEMO 2: Open Multiple Premium Packs
  // ========================================================================
  console.log('\n\n💎 DEMO 2: Opening Premium Legends Pack (Better Odds!)');
  console.log('-'.repeat(60));

  const premiumPack = samplePacks[1];
  console.log(`\nPack: ${premiumPack.name}`);
  console.log(`Cost: ${premiumPack.cost} ${premiumPack.currencyType} currency`);
  console.log(`Guaranteed Items: ${premiumPack.guaranteedItemCount}`);
  console.log('\nEnhanced Drop Rates:');
  premiumPack.dropRates.forEach(rate => {
    console.log(`  ${rate.rarity}: ${(rate.probability * 100).toFixed(0)}%`);
  });

  // Open 3 premium packs
  for (let i = 0; i < 3; i++) {
    const packResult = await packService.openPack(
      premiumPack,
      user1Collection.userId,
      sampleItems,
      user1Collection
    );

    console.log(`\n✨ Pack ${i + 1} - Items Received:`);
    packResult.itemsReceived.forEach(item => {
      console.log(`  • ${item.name} (${item.rarity})`);
      
      // Update collection
      const existing = user1Collection.items.find(i => i.collectibleId === item.id);
      if (existing) {
        existing.count++;
      } else {
        user1Collection.items.push({
          collectibleId: item.id,
          acquiredAt: new Date(),
          count: 1,
          isNew: true
        });
      }
    });
  }

  // ========================================================================
  // DEMO 3: View Collection and Check Album Progress
  // ========================================================================
  console.log('\n\n📚 DEMO 3: Collection Summary and Album Progress');
  console.log('-'.repeat(60));

  const collectionValue = collectionService.calculateCollectionValue(
    user1Collection,
    sampleItems
  );

  console.log(`\n📊 User Collection Stats:`);
  console.log(`  Total Unique Items: ${user1Collection.items.length}`);
  console.log(`  Total Items (including duplicates): ${user1Collection.items.reduce((sum, i) => sum + i.count, 0)}`);
  console.log(`  Collection Value: ${collectionValue} points`);

  // Show rarity breakdown
  const rarityBreakdown = {
    LEGENDARY: 0,
    EPIC: 0,
    RARE: 0,
    COMMON: 0
  };

  user1Collection.items.forEach(userItem => {
    const item = sampleItems.find(i => i.id === userItem.collectibleId);
    if (item) {
      rarityBreakdown[item.rarity]++;
    }
  });

  console.log('\n  Rarity Breakdown:');
  Object.entries(rarityBreakdown).forEach(([rarity, count]) => {
    if (count > 0) {
      console.log(`    ${rarity}: ${count} unique`);
    }
  });

  // Check duplicates
  const duplicates = collectionService.getDuplicateItems(user1Collection);
  if (duplicates.length > 0) {
    console.log('\n  📋 Duplicate Items (Available for Trading):');
    duplicates.forEach(dup => {
      const item = sampleItems.find(i => i.id === dup.collectibleId);
      if (item) {
        console.log(`    ${item.name}: ${dup.count} copies`);
      }
    });
  }

  // Check album progress
  console.log('\n\n🎯 Album Completion Progress:');
  sampleAlbums.forEach(album => {
    const progress = collectionService.getAlbumProgress(album, user1Collection);
    const isComplete = collectionService.isAlbumComplete(album, user1Collection);
    
    console.log(`\n  📖 ${album.name}`);
    console.log(`     Theme: ${album.theme}`);
    console.log(`     Progress: ${progress.collected}/${progress.total} (${progress.percentage.toFixed(0)}%)`);
    
    if (isComplete) {
      console.log('     ✅ COMPLETE! Ready to claim rewards!');
    } else {
      console.log(`     Missing Items:`);
      progress.missingItems.forEach(itemId => {
        const item = sampleItems.find(i => i.id === itemId);
        if (item) {
          console.log(`       - ${item.name} (${item.rarity})`);
        }
      });
    }
  });

  // ========================================================================
  // DEMO 4: Simulate Second User Opening Packs
  // ========================================================================
  console.log('\n\n👤 DEMO 4: Second User Opens Packs');
  console.log('-'.repeat(60));

  console.log('\nUser 2 opens 2 Standard Packs...');
  
  for (let i = 0; i < 2; i++) {
    const packResult = await packService.openPack(
      standardPack,
      user2Collection.userId,
      sampleItems,
      user2Collection
    );

    packResult.itemsReceived.forEach(item => {
      const existing = user2Collection.items.find(i => i.collectibleId === item.id);
      if (existing) {
        existing.count++;
      } else {
        user2Collection.items.push({
          collectibleId: item.id,
          acquiredAt: new Date(),
          count: 1,
          isNew: true
        });
      }
    });
  }

  console.log(`\nUser 2 now has ${user2Collection.items.length} unique items`);

  // ========================================================================
  // DEMO 5: Trading Between Users
  // ========================================================================
  console.log('\n\n🤝 DEMO 5: Trading Between Users');
  console.log('-'.repeat(60));

  // Find items each user can trade
  const user1Duplicates = collectionService.getDuplicateItems(user1Collection);
  const user2Items = user2Collection.items;

  if (user1Duplicates.length > 0 && user2Items.length > 0) {
    const offeredItem = user1Duplicates[0];
    const requestedItem = user2Items[0];

    const offeredItemDetails = sampleItems.find(i => i.id === offeredItem.collectibleId);
    const requestedItemDetails = sampleItems.find(i => i.id === requestedItem.collectibleId);

    console.log('\n💱 Trade Proposal:');
    console.log(`  User 1 offers: ${offeredItemDetails?.name}`);
    console.log(`  User 1 requests: ${requestedItemDetails?.name}`);

    try {
      const trade = await tradingService.createTradeOffer(
        user1Collection.userId,
        user2Collection.userId,
        [offeredItem.collectibleId],
        [requestedItem.collectibleId],
        user1Collection,
        user2Collection
      );

      console.log(`\n  ✅ Trade offer created successfully!`);
      console.log(`  Trade ID: ${trade.id}`);
      console.log(`  Status: ${trade.status}`);
      console.log(`  Expires: ${trade.expiresAt.toLocaleString()}`);

      console.log(`\n  Note: In production, User 2 would receive a notification`);
      console.log(`  and could accept/reject the trade through the UI.`);
    } catch (error) {
      console.log(`  ⚠️  ${(error as Error).message}`);
    }
  }

  // ========================================================================
  // DEMO 6: Event System
  // ========================================================================
  console.log('\n\n🎪 DEMO 6: Limited-Time Events');
  console.log('-'.repeat(60));

  console.log('\nCreating a limited-time event...');
  
  const newEvent = await eventService.createEvent(
    'Hip-Hop Hall of Fame Week',
    'Exclusive legendary artists available for one week only!',
    'LIMITED_TIME' as any,
    new Date(),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    ['item-001', 'item-002', 'item-003'], // Exclusive legendary artists
    ['pack-special-legends'],
    ['album-hall-of-fame']
  );

  console.log(`\n  🎉 Event Created!`);
  console.log(`  Name: ${newEvent.name}`);
  console.log(`  Type: ${newEvent.eventType}`);
  console.log(`  Start: ${newEvent.startDate.toLocaleString()}`);
  console.log(`  End: ${newEvent.endDate.toLocaleString()}`);
  console.log(`  Exclusive Items: ${newEvent.exclusiveItems.length}`);
  console.log(`  Active: ${eventService.isEventActive(newEvent) ? 'Yes ✅' : 'No ❌'}`);

  // ========================================================================
  // Summary
  // ========================================================================
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 DEMO COMPLETE - System Summary');
  console.log('='.repeat(60));

  console.log(`\n✨ Features Demonstrated:`);
  console.log(`  ✅ Pack opening with configurable drop rates`);
  console.log(`  ✅ Collection management and progress tracking`);
  console.log(`  ✅ Album/set completion mechanics`);
  console.log(`  ✅ Trading system between users`);
  console.log(`  ✅ Limited-time events and seasons`);
  console.log(`  ✅ Rarity-based value system`);

  console.log(`\n📈 Statistics:`);
  console.log(`  Total Items in System: ${sampleItems.length}`);
  console.log(`  Available Packs: ${samplePacks.length}`);
  console.log(`  Completable Albums: ${sampleAlbums.length}`);
  console.log(`  User 1 Collection: ${user1Collection.items.length} unique items`);
  console.log(`  User 2 Collection: ${user2Collection.items.length} unique items`);

  console.log(`\n🎮 Next Steps:`);
  console.log(`  • Integrate with game client UI`);
  console.log(`  • Connect to database for persistence`);
  console.log(`  • Implement currency/payment system`);
  console.log(`  • Add real-time multiplayer trading`);
  console.log(`  • Create seasonal content calendar`);
  console.log(`  • Build analytics dashboard`);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎵 Thank you for trying the Hip-Hop Card Collection System! 🎵');
  console.log('='.repeat(60) + '\n');
}

// Run the demo
runDemo().catch(console.error);
