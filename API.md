# Currency System API Documentation

## Overview
RESTful API for the Hip-Hop Metaverse RPG currency system, supporting dual-currency economy with soft and premium currencies.

## Base URL
```
https://api.hiphopgame.com/v1
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <user_token>
```

## Endpoints

### Get User Balance
Get current currency balances for authenticated user.

**Endpoint:** `GET /currency/balance`

**Response:**
```json
{
  "user_id": "uuid",
  "soft_currency": 1000,
  "premium_currency": 250
}
```

---

### Earn Currency
Award currency to user for in-game actions.

**Endpoint:** `POST /currency/earn`

**Request Body:**
```json
{
  "currency_type": "soft",
  "transaction_type": "earn_mission",
  "amount": 100,
  "description": "Completed mission: 'First Steps'",
  "metadata": {
    "mission_id": "mission_001",
    "difficulty": "easy"
  }
}
```

**Response:**
```json
{
  "transaction_id": "uuid",
  "user_id": "uuid",
  "currency_type": "soft",
  "transaction_type": "earn_mission",
  "amount": 100,
  "balance_before": 900,
  "balance_after": 1000,
  "description": "Completed mission: 'First Steps'",
  "created_at": "2025-10-26T23:12:56.514Z"
}
```

---

### Spend Currency
Deduct currency for purchases or upgrades.

**Endpoint:** `POST /currency/spend`

**Request Body:**
```json
{
  "currency_type": "soft",
  "transaction_type": "spend_upgrade",
  "amount": 500,
  "description": "Upgraded studio to level 2",
  "metadata": {
    "item_id": "studio_upgrade",
    "level": 2
  }
}
```

**Response:**
```json
{
  "transaction_id": "uuid",
  "user_id": "uuid",
  "currency_type": "soft",
  "transaction_type": "spend_upgrade",
  "amount": -500,
  "balance_before": 1000,
  "balance_after": 500,
  "description": "Upgraded studio to level 2",
  "created_at": "2025-10-26T23:12:56.514Z"
}
```

**Error Response (Insufficient Balance):**
```json
{
  "error": "insufficient_balance",
  "message": "Insufficient balance",
  "required": 500,
  "available": 200
}
```

---

### Get Available Packages
List all premium currency packages available for purchase.

**Endpoint:** `GET /currency/packages`

**Response:**
```json
{
  "packages": [
    {
      "package_id": "starter",
      "name": "Starter Pack",
      "description": "500 Premium Currency",
      "currency_amount": 500,
      "price_usd": 4.99,
      "bonus_percentage": 0,
      "is_active": true
    },
    {
      "package_id": "gold",
      "name": "Gold Pack",
      "description": "5500 Premium Currency",
      "currency_amount": 5500,
      "price_usd": 39.99,
      "bonus_percentage": 38,
      "is_active": true
    }
  ]
}
```

---

### Purchase Premium Currency
Initiate premium currency purchase.

**Endpoint:** `POST /currency/purchase`

**Request Body:**
```json
{
  "package_id": "gold",
  "payment_method": "credit_card",
  "payment_gateway": "stripe",
  "payment_transaction_id": "pi_1234567890",
  "receipt_data": "encrypted_receipt_data"
}
```

**Response:**
```json
{
  "purchase_id": "uuid",
  "user_id": "uuid",
  "package_id": "gold",
  "amount": 5500,
  "price_usd": 39.99,
  "status": "pending",
  "created_at": "2025-10-26T23:12:56.514Z"
}
```

---

### Complete Purchase
Complete a pending purchase after payment verification (webhook/callback).

**Endpoint:** `POST /currency/purchase/:purchase_id/complete`

**Response:**
```json
{
  "success": true,
  "purchase_id": "uuid",
  "transaction_id": "uuid",
  "amount_credited": 5500,
  "new_balance": 6000
}
```

---

### Get Transaction History
Retrieve user's transaction history with pagination.

**Endpoint:** `GET /currency/transactions?page=1&page_size=20`

**Query Parameters:**
- `page` (optional): Page number, default 1
- `page_size` (optional): Items per page, default 20, max 100

**Response:**
```json
{
  "transactions": [
    {
      "transaction_id": "uuid",
      "user_id": "uuid",
      "currency_type": "soft",
      "transaction_type": "earn_mission",
      "amount": 100,
      "balance_before": 900,
      "balance_after": 1000,
      "description": "Completed mission",
      "created_at": "2025-10-26T23:12:56.514Z"
    }
  ],
  "total_count": 150,
  "page": 1,
  "page_size": 20
}
```

---

## Currency Types

### Soft Currency
- **ID:** `soft`
- **Earned through:** Missions, quizzes, freestyle battles, city-building
- **Used for:** Routine upgrades, unlocks, standard content

### Premium Currency
- **ID:** `premium`
- **Acquired via:** Real money purchases, special events, achievements
- **Used for:** Premium story chapters, cosmetics, beat packs, avatar upgrades, limited events

---

## Transaction Types

### Earning Types
- `earn_mission` - Completing missions
- `earn_quiz` - Answering quizzes correctly
- `earn_battle` - Winning freestyle battles
- `earn_city_building` - City building actions
- `earn_achievement` - Unlocking achievements
- `earn_event` - Special events rewards

### Spending Types
- `spend_upgrade` - Upgrading buildings/items
- `spend_unlock` - Unlocking content
- `spend_cosmetic` - Purchasing cosmetic items
- `spend_beat_pack` - Buying beat packs
- `spend_story_chapter` - Unlocking story chapters
- `spend_avatar` - Avatar customization
- `spend_event` - Event-specific purchases

### Special Types
- `purchase_currency` - Premium currency purchase
- `refund` - Refunded transaction
- `admin_adjustment` - Manual admin adjustment

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid request | Request parameters invalid |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not found | Resource not found |
| 409 | Insufficient balance | Not enough currency |
| 422 | Validation error | Request validation failed |
| 500 | Internal error | Server error |

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Burst limit: 20 requests per second

---

## Webhooks

### Payment Completed
Sent when a payment is successfully processed.

**Payload:**
```json
{
  "event": "payment.completed",
  "purchase_id": "uuid",
  "user_id": "uuid",
  "amount": 5500,
  "timestamp": "2025-10-26T23:12:56.514Z"
}
```

### Payment Failed
Sent when a payment fails.

**Payload:**
```json
{
  "event": "payment.failed",
  "purchase_id": "uuid",
  "user_id": "uuid",
  "reason": "card_declined",
  "timestamp": "2025-10-26T23:12:56.514Z"
}
```

---

## Security Considerations

1. **All endpoints require authentication**
2. **HTTPS only in production**
3. **Receipt validation for all purchases**
4. **Fraud detection on transactions**
5. **Rate limiting to prevent abuse**
6. **Transaction idempotency for purchases**
7. **Audit logging for all currency operations**
