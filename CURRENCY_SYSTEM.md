# Hip-Hop Metaverse RPG - Currency System

## Overview

This is a comprehensive dual-currency economy system designed for the Hip-Hop Metaverse RPG. It supports both free and paid users with a robust monetization framework, payment integration, analytics, and fraud prevention.

## Features

### ✅ Core Currency Management
- **Soft Currency**: Earned through gameplay (missions, quizzes, battles, city-building)
- **Premium Currency**: Purchased with real money or earned through special events
- **Concurrency-safe transactions** with database-level locking
- **Complete transaction history** with metadata support
- **Atomic operations** ensuring data consistency

### ✅ Payment Integration
- **Multiple payment gateways**: Stripe, Apple IAP, Google Play
- **Receipt validation** for all purchases
- **Fraud detection** framework
- **Refund handling** capabilities
- **Webhook support** for async payment notifications

### ✅ Analytics & Monitoring
- **Daily currency flow tracking**
- **Revenue reporting** with package breakdown
- **Economy health metrics** (inflation rate, circulation, conversion rates)
- **User engagement analytics**
- **Real-time transaction monitoring**

### ✅ Security
- **SQL injection prevention** via parameterized queries
- **Transaction-level locking** to prevent race conditions
- **Balance validation** preventing negative balances
- **Idempotency support** for purchases
- **Audit trail** for all currency operations

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Currency System                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Currency   │  │  Analytics   │  │   Payment    │  │
│  │   Service    │  │   Service    │  │   Gateway    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                            │                              │
│                    ┌───────▼────────┐                    │
│                    │   PostgreSQL    │                    │
│                    │    Database     │                    │
│                    └────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables
- **users**: User accounts
- **user_balances**: Current currency balances per user
- **transactions**: Complete transaction history
- **currency_purchases**: Premium currency purchase records
- **currency_packages**: Available packages for purchase
- **currency_analytics**: Aggregated daily analytics

See [schema.sql](./schema.sql) for complete schema definition.

## Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- TypeScript 5+

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up database:**
```bash
psql -U postgres -f schema.sql
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. **Build the project:**
```bash
npm run build
```

5. **Run tests:**
```bash
npm test
```

## Usage

### Initialize the System

```typescript
import { CurrencySystem } from './src';

const system = new CurrencySystem({
  database: {
    connectionString: 'postgresql://localhost/hip_hop_game',
    ssl: false
  },
  payments: {
    stripe: {
      apiKey: 'sk_test_...'
    },
    apple: {
      sharedSecret: 'your_shared_secret',
      sandbox: true
    },
    google: {
      serviceAccountKey: 'service_account.json'
    }
  }
});
```

### Award Currency

```typescript
const transaction = await system.currencyService.earnCurrency({
  user_id: 'user-uuid',
  currency_type: CurrencyType.SOFT,
  transaction_type: TransactionType.EARN_MISSION,
  amount: 100,
  description: 'Completed tutorial mission',
  metadata: { mission_id: 'tutorial_001' }
});
```

### Spend Currency

```typescript
const transaction = await system.currencyService.spendCurrency({
  user_id: 'user-uuid',
  currency_type: CurrencyType.SOFT,
  transaction_type: TransactionType.SPEND_UPGRADE,
  amount: 500,
  description: 'Upgraded studio to level 2',
  metadata: { item_id: 'studio', level: 2 }
});
```

### Purchase Premium Currency

```typescript
// Initiate purchase
const purchase = await system.currencyService.purchaseCurrency({
  user_id: 'user-uuid',
  package_id: 'gold',
  payment_method: 'credit_card',
  payment_gateway: 'stripe',
  payment_transaction_id: 'pi_1234567890',
  receipt_data: 'encrypted_receipt'
});

// Complete after payment verification
await system.currencyService.completePurchase(purchase.purchase_id);
```

### Get User Balance

```typescript
const balance = await system.currencyService.getBalance('user-uuid');
console.log(`Soft: ${balance.soft_currency}, Premium: ${balance.premium_currency}`);
```

### Analytics

```typescript
// Get daily report
const reports = await system.analyticsService.getDailyReport(
  new Date(),
  CurrencyType.SOFT
);

// Get revenue report
const revenue = await system.analyticsService.getRevenueReport(
  new Date('2025-10-01'),
  new Date('2025-10-31')
);

// Get economy health
const health = await system.analyticsService.getEconomyHealth();
console.log(`Inflation Rate: ${health.soft_currency.inflation_rate}%`);
```

## API Documentation

See [API.md](./API.md) for complete REST API documentation.

## Transaction Types

### Earning
- `earn_mission` - Mission completion rewards
- `earn_quiz` - Quiz correct answers
- `earn_battle` - Freestyle battle wins
- `earn_city_building` - City building activities
- `earn_achievement` - Achievement unlocks
- `earn_event` - Special event rewards

### Spending
- `spend_upgrade` - Building/item upgrades
- `spend_unlock` - Content unlocks
- `spend_cosmetic` - Cosmetic purchases
- `spend_beat_pack` - Beat pack purchases
- `spend_story_chapter` - Story chapter unlocks
- `spend_avatar` - Avatar customization
- `spend_event` - Event participation

## Premium Currency Packages

Default packages (configurable in database):

| Package | Amount | Price | Bonus |
|---------|--------|-------|-------|
| Starter | 500 | $4.99 | 0% |
| Bronze | 1,200 | $9.99 | 20% |
| Silver | 2,600 | $19.99 | 30% |
| Gold | 5,500 | $39.99 | 38% |
| Platinum | 14,000 | $99.99 | 40% |

## Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

### Integration Tests
Tests require a test database:
```bash
createdb hip_hop_game_test
psql -U postgres -d hip_hop_game_test -f schema.sql
npm test
```

## Security Considerations

1. **Database Security**
   - All queries use parameterized statements
   - Row-level locking for concurrent operations
   - Balance constraints prevent negative values

2. **Payment Security**
   - Receipt validation for all purchases
   - Fraud detection on transactions
   - Idempotent purchase operations

3. **API Security**
   - Authentication required for all endpoints
   - Rate limiting to prevent abuse
   - HTTPS only in production

4. **Audit Trail**
   - All transactions logged with metadata
   - Immutable transaction history
   - Analytics for anomaly detection

## Performance Optimization

- **Database indexes** on frequently queried columns
- **Connection pooling** for database connections
- **Batch operations** for analytics aggregation
- **Prepared statements** for repeated queries

## Monitoring

### Key Metrics to Track
- Daily active users earning/spending currency
- Average balance per user
- Conversion rate (free to paid)
- Revenue per user
- Transaction success/failure rates
- Payment gateway performance

### Alerts
- Unusual transaction patterns
- Failed payment attempts
- Balance inconsistencies
- High fraud risk scores

## Deployment

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/database
STRIPE_API_KEY=sk_live_...
APPLE_SHARED_SECRET=...
GOOGLE_SERVICE_ACCOUNT_KEY=...
```

### Database Migrations
All schema changes should be version-controlled and applied via migrations. Current schema is in `schema.sql`.

### Scaling Considerations
- Use read replicas for analytics queries
- Consider sharding for user balances at scale
- Cache frequently accessed data (packages, balances)
- Queue payment webhooks for async processing

## Future Enhancements

- [ ] Real-time currency updates via WebSocket
- [ ] Multi-currency support (international pricing)
- [ ] Gifting system (send currency to friends)
- [ ] Currency exchange/trading marketplace
- [ ] Advanced fraud ML models
- [ ] A/B testing for pricing optimization
- [ ] Subscription management
- [ ] Season pass implementation

## Support

For issues or questions:
- Create an issue in the repository
- Check API documentation
- Review test cases for usage examples

## License

MIT License - see LICENSE file for details
