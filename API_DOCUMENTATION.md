# Player Accounts & Save/Load System - API Documentation

## Overview

This API provides comprehensive player account management, authentication, and save/load functionality for the Hip-Hop Metaverse RPG game. It supports guest accounts, email/password authentication, social login integration framework, and cloud-based data synchronization.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication Endpoints

#### 1. Create Guest Account

Create a new guest account for quick play without registration.

**Endpoint:** `POST /auth/guest`

**Request Body:**
```json
{
  "deviceId": "unique-device-identifier",
  "deviceName": "Device Name (e.g., iPhone 13)"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "username": "guest_xyz123_abc456",
    "isGuest": true
  }
}
```

**Status Codes:**
- `201`: Account created successfully
- `500`: Server error

---

#### 2. Register with Email

Register a new account with email and password.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "securepassword123",
  "username": "PlayerName",
  "deviceId": "unique-device-identifier",
  "deviceName": "Device Name"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "email": "player@example.com",
    "username": "PlayerName",
    "isGuest": false
  }
}
```

**Status Codes:**
- `201`: Account created successfully
- `400`: Email already registered or validation error
- `500`: Server error

---

#### 3. Login with Email

Login to an existing account.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "securepassword123",
  "deviceId": "unique-device-identifier",
  "deviceName": "Device Name"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "email": "player@example.com",
    "username": "PlayerName",
    "isGuest": false
  }
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials
- `500`: Server error

---

#### 4. Upgrade Guest Account

Convert a guest account to a full account with email and password.

**Endpoint:** `POST /auth/upgrade`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Account upgraded successfully",
  "user": {
    "id": "user-id",
    "email": "player@example.com",
    "username": "PlayerName",
    "isGuest": false
  }
}
```

**Status Codes:**
- `200`: Account upgraded successfully
- `400`: Email already registered or not a guest account
- `401`: Authentication required
- `500`: Server error

---

#### 5. Link Device

Link a new device to an existing account.

**Endpoint:** `POST /auth/link-device`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deviceId": "unique-device-identifier",
  "deviceName": "Device Name"
}
```

**Response:**
```json
{
  "message": "Device linked successfully",
  "devices": [
    {
      "deviceId": "device-1",
      "deviceName": "iPhone 13",
      "lastLogin": "2025-10-26T12:00:00.000Z"
    },
    {
      "deviceId": "device-2",
      "deviceName": "iPad Pro",
      "lastLogin": "2025-10-26T15:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200`: Device linked successfully
- `401`: Authentication required
- `500`: Server error

---

#### 6. Get User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "player@example.com",
    "username": "PlayerName",
    "isGuest": false,
    "devices": [...],
    "lastLogin": "2025-10-26T12:00:00.000Z",
    "createdAt": "2025-10-20T10:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Profile retrieved successfully
- `401`: Authentication required
- `404`: User not found
- `500`: Server error

---

### Game Data Endpoints

All game data endpoints require authentication.

#### 7. Save All Player Data

Save all player data (profile, city, collection, achievements) in a single request.

**Endpoint:** `POST /game-data/save`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "profile": {
    "displayName": "PlayerName",
    "level": 15,
    "experience": 5000,
    "softCurrency": 10000,
    "premiumCurrency": 500
  },
  "cityState": {
    "cityName": "Hip-Hop City",
    "cityLevel": 12,
    "buildings": [
      {
        "buildingId": "building-1",
        "buildingType": "studio",
        "position": { "x": 10, "y": 20 },
        "level": 3,
        "isUpgrading": false
      }
    ],
    "neighborhoods": [
      {
        "neighborhoodId": "hood-1",
        "name": "Old School District",
        "era": "1980s",
        "unlocked": true
      }
    ]
  },
  "collection": {
    "cards": [...],
    "stickers": [...],
    "albums": [...]
  },
  "achievements": {
    "achievements": [...]
  }
}
```

**Response:**
```json
{
  "message": "Player data saved successfully",
  "savedAt": "2025-10-26T12:00:00.000Z"
}
```

**Status Codes:**
- `200`: Data saved successfully
- `401`: Authentication required
- `500`: Server error

---

#### 8. Load All Player Data

Load all player data.

**Endpoint:** `GET /game-data/load`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "profile": { ... },
  "cityState": { ... },
  "collection": { ... },
  "achievements": { ... },
  "loadedAt": "2025-10-26T12:00:00.000Z"
}
```

**Status Codes:**
- `200`: Data loaded successfully
- `401`: Authentication required
- `500`: Server error

---

#### 9. Get Player Profile

Get player profile data only.

**Endpoint:** `GET /game-data/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "profile": {
    "userId": "user-id",
    "displayName": "PlayerName",
    "level": 15,
    "experience": 5000,
    "softCurrency": 10000,
    "premiumCurrency": 500,
    "createdAt": "2025-10-20T10:00:00.000Z",
    "updatedAt": "2025-10-26T12:00:00.000Z"
  }
}
```

---

#### 10. Update Player Profile

Update player profile data.

**Endpoint:** `PUT /game-data/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "NewPlayerName",
  "level": 16,
  "experience": 6000,
  "softCurrency": 11000,
  "premiumCurrency": 500
}
```

**Response:**
```json
{
  "message": "Player profile updated successfully",
  "profile": { ... }
}
```

---

#### 11. Get City State

Get city state data.

**Endpoint:** `GET /game-data/city`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "cityState": {
    "userId": "user-id",
    "cityName": "Hip-Hop City",
    "cityLevel": 12,
    "buildings": [...],
    "neighborhoods": [...],
    "lastSaved": "2025-10-26T12:00:00.000Z",
    "createdAt": "2025-10-20T10:00:00.000Z",
    "updatedAt": "2025-10-26T12:00:00.000Z"
  }
}
```

---

#### 12. Update City State

Update city state data.

**Endpoint:** `PUT /game-data/city`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "cityName": "Updated City Name",
  "cityLevel": 13,
  "buildings": [...],
  "neighborhoods": [...]
}
```

**Response:**
```json
{
  "message": "City state updated successfully",
  "cityState": { ... }
}
```

---

#### 13. Get Collection

Get collection data (cards, stickers, albums).

**Endpoint:** `GET /game-data/collection`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "collection": {
    "userId": "user-id",
    "cards": [...],
    "stickers": [...],
    "albums": [...],
    "createdAt": "2025-10-20T10:00:00.000Z",
    "updatedAt": "2025-10-26T12:00:00.000Z"
  }
}
```

---

#### 14. Update Collection

Update collection data.

**Endpoint:** `PUT /game-data/collection`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "cards": [...],
  "stickers": [...],
  "albums": [...]
}
```

**Response:**
```json
{
  "message": "Collection updated successfully",
  "collection": { ... }
}
```

---

#### 15. Get Achievements

Get achievement data.

**Endpoint:** `GET /game-data/achievements`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "achievements": {
    "userId": "user-id",
    "achievements": [
      {
        "achievementId": "first-win",
        "name": "First Victory",
        "description": "Win your first rap battle",
        "category": "battles",
        "progress": 1,
        "maxProgress": 1,
        "unlocked": true,
        "unlockedAt": "2025-10-21T14:00:00.000Z",
        "rewards": {
          "softCurrency": 100,
          "premiumCurrency": 10
        }
      }
    ],
    "createdAt": "2025-10-20T10:00:00.000Z",
    "updatedAt": "2025-10-26T12:00:00.000Z"
  }
}
```

---

#### 16. Update Achievements

Update achievement data.

**Endpoint:** `PUT /game-data/achievements`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "achievements": [...]
}
```

**Response:**
```json
{
  "message": "Achievements updated successfully",
  "achievements": { ... }
}
```

---

## Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description"
}
```

In development mode, stack traces are included for debugging.

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Window:** 15 minutes (900,000ms)
- **Max Requests:** 100 requests per window

## Security Features

1. **Password Hashing:** All passwords are hashed using bcrypt before storage
2. **JWT Tokens:** Secure token-based authentication with 7-day expiration
3. **HTTPS/TLS:** All communication should use HTTPS in production
4. **Helmet:** Security headers are automatically applied
5. **CORS:** Controlled cross-origin access
6. **Input Validation:** All inputs are validated and sanitized
7. **Data Encryption:** Sensitive data can be encrypted at rest

## Social Login Integration

The system includes a framework for social login integration. To implement:

1. **Google OAuth:**
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in environment
   - Implement OAuth flow in client
   - Call backend with OAuth token for verification

2. **Facebook Login:**
   - Set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` in environment
   - Implement Facebook SDK in client
   - Call backend with access token for verification

3. **Apple Sign In:**
   - Similar pattern to Google and Facebook
   - Requires Apple Developer account setup

## Cloud Sync Strategy

The save/load system supports cloud synchronization:

1. **Auto-save:** Client should auto-save periodically (e.g., every 5 minutes)
2. **Manual save:** Player can trigger manual save
3. **Load on login:** Automatically load latest data on authentication
4. **Conflict resolution:** Latest timestamp wins (last-write-wins strategy)
5. **Offline support:** Client should cache data locally and sync when online

## Best Practices

1. **Authentication Flow:**
   - Guest accounts for quick start
   - Prompt users to upgrade for cloud sync
   - Support social login for convenience

2. **Save Strategy:**
   - Save frequently to prevent data loss
   - Use batch save endpoint (`POST /game-data/save`) for efficiency
   - Implement retry logic for failed saves

3. **Device Management:**
   - Track all devices for security
   - Allow users to view and revoke device access
   - Notify on new device login

4. **Data Privacy:**
   - Implement GDPR/CCPA compliance
   - Allow users to export their data
   - Provide account deletion option

## Example Usage

### Complete Authentication Flow

```javascript
// 1. Create guest account
const guestResponse = await fetch('http://localhost:3000/api/auth/guest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'device-123',
    deviceName: 'iPhone 13'
  })
});
const { token } = await guestResponse.json();

// 2. Play the game...

// 3. Upgrade to full account
const upgradeResponse = await fetch('http://localhost:3000/api/auth/upgrade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    email: 'player@example.com',
    password: 'securepassword123'
  })
});

// 4. Save game data
const saveResponse = await fetch('http://localhost:3000/api/game-data/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    profile: { level: 5, experience: 1000 },
    cityState: { cityName: 'My City', cityLevel: 3 }
  })
});
```

## Health Check

Monitor API health:

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T12:00:00.000Z",
  "environment": "development"
}
```

## Support

For issues or questions, please contact the development team.
