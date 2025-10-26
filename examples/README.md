# Examples

This directory contains example code and demonstrations of the Card/Sticker Collection System.

## Running the Demo

To run the interactive demo:

```bash
npm run demo
```

This will:
1. Build the TypeScript code
2. Run a comprehensive demonstration showing:
   - Pack opening mechanics
   - Collection building
   - Album progress tracking
   - Trading between users
   - Event creation and management

## Files

### `sampleData.ts`

Contains sample data for testing and demonstration:
- **15 Collectible Items**: Artists, albums, venues, and cultural icons
- **3 Pack Configurations**: Standard, Premium, and Golden Era packs
- **4 Albums**: Themed collections with rewards
- **1 Sample Event**: Limited-time seasonal event

### `demo.ts`

Interactive demonstration script that shows:

1. **Pack Opening**: Opens standard and premium packs, showing drop rate mechanics
2. **Collection Management**: Tracks acquired items and calculates collection value
3. **Album Progress**: Shows completion status and missing items for each album
4. **Trading System**: Creates trade offers between two users
5. **Event System**: Creates and manages limited-time events

## Sample Output

The demo produces output like:

```
🎵 Hip-Hop Metaverse RPG - Card Collection System Demo 🎵

📦 DEMO 1: Opening a Standard Hip-Hop Pack
------------------------------------------------------------

Pack: Standard Hip-Hop Pack
Cost: 100 SOFT currency
Guaranteed Items: 3

Drop Rates:
  COMMON: 70%
  RARE: 20%
  EPIC: 8%
  LEGENDARY: 2%

✨ Items Received:
  1. Breakdancing (COMMON)
     Category: CULTURAL_ICON
     Street dance style that is one of the four elements of hip-hop
  ...
```

## Using Sample Data in Your Code

You can import and use the sample data in your own code:

```typescript
import { sampleItems, samplePacks, sampleAlbums } from './examples/sampleData';
import { PackOpeningService } from './src/services/PackOpeningService';

const packService = new PackOpeningService();
const result = await packService.openPack(
  samplePacks[0], // Standard pack
  'user-123',
  sampleItems,
  userCollection
);
```

## Customizing the Demo

To customize the demo with your own data:

1. Edit `sampleData.ts` to add/modify items, packs, or albums
2. Adjust drop rates in `src/config/dropRates.ts`
3. Modify the demo flow in `demo.ts`

## Integration Examples

### REST API Integration

```typescript
// Example Express endpoint
app.post('/api/packs/:packId/open', async (req, res) => {
  const packService = new PackOpeningService();
  const pack = samplePacks.find(p => p.id === req.params.packId);
  
  const result = await packService.openPack(
    pack,
    req.user.id,
    sampleItems,
    req.user.collection
  );
  
  res.json(result);
});
```

### Game Client Integration

```typescript
// Example Unity/Unreal integration
class CollectionManager {
  async openPack(packId: string) {
    const response = await fetch(`/api/packs/${packId}/open`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    this.updateUI(result.itemsReceived);
  }
}
```

## Next Steps

1. **Database Integration**: Replace in-memory collections with database queries
2. **Real-time Updates**: Add WebSocket support for live trading notifications
3. **UI Components**: Build React/Vue components for collection display
4. **Analytics**: Integrate with analytics platforms (Mixpanel, Amplitude)
5. **Monetization**: Connect to payment processors for premium currency

## Support

For more information, see:
- [API Documentation](../API_DOCUMENTATION.md)
- [Database Schema](../DATABASE_SCHEMA.md)
- [Main README](../README.md)
