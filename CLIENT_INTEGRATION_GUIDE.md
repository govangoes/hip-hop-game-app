# Client Integration Guide

## Overview

This guide provides examples and best practices for integrating the Hip-Hop Game App backend API into your client application (Unity, Unreal, or web).

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Flow](#authentication-flow)
3. [Save/Load System](#saveload-system)
4. [Error Handling](#error-handling)
5. [Offline Support](#offline-support)
6. [Best Practices](#best-practices)

## Getting Started

### Base Configuration

```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';

// Store the authentication token
let authToken = null;
let deviceId = getDeviceId(); // Platform-specific device identifier
let deviceName = getDeviceName(); // e.g., "iPhone 13"
```

### Making API Requests

```javascript
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Add auth token if available
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Add body for POST/PUT requests
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

## Authentication Flow

### 1. Guest Account Creation

Perfect for players who want to start playing immediately without registration.

```javascript
async function createGuestAccount() {
  try {
    const response = await apiRequest('/auth/guest', 'POST', {
      deviceId: deviceId,
      deviceName: deviceName,
    });
    
    // Store the token
    authToken = response.token;
    saveTokenToStorage(authToken);
    
    console.log('Guest account created:', response.user);
    return response.user;
  } catch (error) {
    console.error('Failed to create guest account:', error);
    throw error;
  }
}
```

### 2. Email Registration

```javascript
async function registerWithEmail(email, password, username) {
  try {
    const response = await apiRequest('/auth/register', 'POST', {
      email,
      password,
      username,
      deviceId: deviceId,
      deviceName: deviceName,
    });
    
    authToken = response.token;
    saveTokenToStorage(authToken);
    
    console.log('Account created:', response.user);
    return response.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

### 3. Email Login

```javascript
async function loginWithEmail(email, password) {
  try {
    const response = await apiRequest('/auth/login', 'POST', {
      email,
      password,
      deviceId: deviceId,
      deviceName: deviceName,
    });
    
    authToken = response.token;
    saveTokenToStorage(authToken);
    
    console.log('Logged in:', response.user);
    return response.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### 4. Upgrade Guest to Full Account

```javascript
async function upgradeGuestAccount(email, password) {
  try {
    const response = await apiRequest('/auth/upgrade', 'POST', {
      email,
      password,
    });
    
    console.log('Account upgraded:', response.user);
    return response.user;
  } catch (error) {
    console.error('Account upgrade failed:', error);
    throw error;
  }
}
```

### Complete Authentication Example

```javascript
async function authenticate() {
  // Try to load existing token
  authToken = loadTokenFromStorage();
  
  if (authToken) {
    try {
      // Verify token is still valid by fetching profile
      const profile = await apiRequest('/auth/profile');
      console.log('Authenticated as:', profile.user);
      return profile.user;
    } catch (error) {
      // Token is invalid, clear it
      authToken = null;
      clearTokenFromStorage();
    }
  }
  
  // No valid token, create guest account
  return await createGuestAccount();
}
```

## Save/Load System

### Auto-Save Strategy

Implement periodic auto-save to prevent data loss:

```javascript
class GameDataManager {
  constructor() {
    this.saveInterval = 5 * 60 * 1000; // 5 minutes
    this.lastSaveTime = Date.now();
    this.isDirty = false;
    this.localData = this.loadLocalData();
    
    // Start auto-save timer
    this.startAutoSave();
  }
  
  startAutoSave() {
    setInterval(() => {
      if (this.isDirty) {
        this.save();
      }
    }, this.saveInterval);
  }
  
  markDirty() {
    this.isDirty = true;
  }
  
  async save() {
    try {
      const gameData = this.collectGameData();
      
      // Save to cloud
      await apiRequest('/game-data/save', 'POST', gameData);
      
      // Save locally as backup
      this.saveLocalData(gameData);
      
      this.isDirty = false;
      this.lastSaveTime = Date.now();
      
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      // Save locally even if cloud save fails
      this.saveLocalData(this.collectGameData());
    }
  }
  
  async load() {
    try {
      // Try to load from cloud
      const response = await apiRequest('/game-data/load');
      
      // Merge with local data (cloud takes precedence)
      const mergedData = this.mergeGameData(this.localData, response);
      
      this.applyGameData(mergedData);
      
      console.log('Game loaded successfully');
      return mergedData;
    } catch (error) {
      console.error('Load failed, using local data:', error);
      // Fall back to local data
      this.applyGameData(this.localData);
      return this.localData;
    }
  }
  
  collectGameData() {
    return {
      profile: {
        displayName: this.playerName,
        level: this.playerLevel,
        experience: this.playerExperience,
        softCurrency: this.softCurrency,
        premiumCurrency: this.premiumCurrency,
      },
      cityState: {
        cityName: this.cityName,
        cityLevel: this.cityLevel,
        buildings: this.buildings,
        neighborhoods: this.neighborhoods,
      },
      collection: {
        cards: this.cards,
        stickers: this.stickers,
        albums: this.albums,
      },
      achievements: {
        achievements: this.achievementsList,
      },
    };
  }
  
  mergeGameData(local, cloud) {
    // Simple strategy: use cloud data if available, otherwise use local
    return {
      profile: cloud.profile || local.profile,
      cityState: cloud.cityState || local.cityState,
      collection: cloud.collection || local.collection,
      achievements: cloud.achievements || local.achievements,
    };
  }
  
  applyGameData(data) {
    // Apply loaded data to game state
    if (data.profile) {
      this.playerName = data.profile.displayName;
      this.playerLevel = data.profile.level;
      this.playerExperience = data.profile.experience;
      this.softCurrency = data.profile.softCurrency;
      this.premiumCurrency = data.profile.premiumCurrency;
    }
    
    if (data.cityState) {
      this.cityName = data.cityState.cityName;
      this.cityLevel = data.cityState.cityLevel;
      this.buildings = data.cityState.buildings;
      this.neighborhoods = data.cityState.neighborhoods;
    }
    
    if (data.collection) {
      this.cards = data.collection.cards;
      this.stickers = data.collection.stickers;
      this.albums = data.collection.albums;
    }
    
    if (data.achievements) {
      this.achievementsList = data.achievements.achievements;
    }
  }
  
  saveLocalData(data) {
    // Platform-specific local storage
    localStorage.setItem('gameData', JSON.stringify(data));
  }
  
  loadLocalData() {
    try {
      const data = localStorage.getItem('gameData');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load local data:', error);
      return {};
    }
  }
}
```

### Individual Resource Updates

For more granular control, update specific resources:

```javascript
// Update player profile only
async function updatePlayerProfile(profileData) {
  try {
    const response = await apiRequest('/game-data/profile', 'PUT', profileData);
    console.log('Profile updated:', response.profile);
    return response.profile;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
}

// Update city state only
async function updateCityState(cityData) {
  try {
    const response = await apiRequest('/game-data/city', 'PUT', cityData);
    console.log('City state updated:', response.cityState);
    return response.cityState;
  } catch (error) {
    console.error('City state update failed:', error);
    throw error;
  }
}

// Get collection
async function getCollection() {
  try {
    const response = await apiRequest('/game-data/collection');
    return response.collection;
  } catch (error) {
    console.error('Failed to get collection:', error);
    throw error;
  }
}
```

## Error Handling

### Retry Logic

```javascript
async function apiRequestWithRetry(endpoint, method, body, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiRequest(endpoint, method, body);
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

### Token Expiration Handling

```javascript
async function apiRequestWithTokenRefresh(endpoint, method, body) {
  try {
    return await apiRequest(endpoint, method, body);
  } catch (error) {
    if (error.status === 401) {
      // Token expired, try to re-authenticate
      console.log('Token expired, re-authenticating...');
      
      // Clear old token
      authToken = null;
      clearTokenFromStorage();
      
      // Show login screen to user
      showLoginScreen();
    }
    throw error;
  }
}
```

## Offline Support

### Queue System for Offline Actions

```javascript
class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue();
  }
  
  addAction(action) {
    this.queue.push({
      id: Date.now(),
      action,
      timestamp: new Date(),
    });
    this.saveQueue();
  }
  
  async processQueue() {
    if (!navigator.onLine) {
      console.log('Offline, skipping queue processing');
      return;
    }
    
    const processed = [];
    
    for (const item of this.queue) {
      try {
        await this.executeAction(item.action);
        processed.push(item.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
        // Stop processing on first error
        break;
      }
    }
    
    // Remove processed items
    this.queue = this.queue.filter(item => !processed.includes(item.id));
    this.saveQueue();
  }
  
  async executeAction(action) {
    return await apiRequest(action.endpoint, action.method, action.body);
  }
  
  saveQueue() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  }
  
  loadQueue() {
    try {
      const data = localStorage.getItem('offlineQueue');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }
}

// Usage
const offlineQueue = new OfflineQueue();

// When online status changes
window.addEventListener('online', () => {
  console.log('Online, processing queue...');
  offlineQueue.processQueue();
});

// When saving while offline
function saveWithOfflineSupport(gameData) {
  if (navigator.onLine) {
    return apiRequest('/game-data/save', 'POST', gameData);
  } else {
    offlineQueue.addAction({
      endpoint: '/game-data/save',
      method: 'POST',
      body: gameData,
    });
    console.log('Offline, save queued');
  }
}
```

## Best Practices

### 1. Token Management

```javascript
// Store token securely
function saveTokenToStorage(token) {
  // For web: Use secure, httpOnly cookies (server-side)
  // For mobile: Use platform's secure storage (Keychain/Keystore)
  // For Unity: Use PlayerPrefs with encryption
  localStorage.setItem('authToken', token);
}

function loadTokenFromStorage() {
  return localStorage.getItem('authToken');
}

function clearTokenFromStorage() {
  localStorage.removeItem('authToken');
}
```

### 2. Progressive Enhancement

```javascript
async function initializeGame() {
  // Start with guest account for immediate play
  await authenticate();
  
  // Load game data
  await gameDataManager.load();
  
  // Show game
  showMainMenu();
  
  // Suggest account upgrade after player is engaged
  setTimeout(() => {
    if (isGuestAccount()) {
      showUpgradePrompt();
    }
  }, 10 * 60 * 1000); // After 10 minutes of play
}
```

### 3. Save on Important Events

```javascript
// Save when player completes important actions
async function completeLevel() {
  // Update game state
  playerLevel++;
  
  // Mark data as dirty
  gameDataManager.markDirty();
  
  // Immediate save for important milestones
  await gameDataManager.save();
}

// Also save on app pause/quit
window.addEventListener('beforeunload', () => {
  if (gameDataManager.isDirty) {
    // Synchronous save before closing
    gameDataManager.save();
  }
});
```

### 4. UI Feedback

```javascript
async function saveGameWithFeedback() {
  showSavingIndicator();
  
  try {
    await gameDataManager.save();
    showSaveSuccessMessage();
  } catch (error) {
    showSaveErrorMessage(error);
  } finally {
    hideSavingIndicator();
  }
}
```

### 5. Rate Limit Awareness

```javascript
class RateLimitedAPI {
  constructor() {
    this.saveQueue = [];
    this.isSaving = false;
    this.lastSaveTime = 0;
    this.minSaveInterval = 2000; // 2 seconds minimum between saves
  }
  
  async save(data) {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;
    
    if (timeSinceLastSave < this.minSaveInterval) {
      // Queue the save for later
      this.saveQueue = [data]; // Keep only latest
      
      if (!this.isSaving) {
        setTimeout(() => this.processSaveQueue(), this.minSaveInterval - timeSinceLastSave);
      }
      return;
    }
    
    await this.doSave(data);
  }
  
  async processSaveQueue() {
    if (this.saveQueue.length === 0) {
      this.isSaving = false;
      return;
    }
    
    this.isSaving = true;
    const data = this.saveQueue.pop();
    await this.doSave(data);
    
    setTimeout(() => this.processSaveQueue(), this.minSaveInterval);
  }
  
  async doSave(data) {
    try {
      await apiRequest('/game-data/save', 'POST', data);
      this.lastSaveTime = Date.now();
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  }
}
```

## Platform-Specific Examples

### Unity (C#)

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Text;

public class GameAPI : MonoBehaviour
{
    private const string API_BASE_URL = "https://your-api-domain.com/api";
    private string authToken;
    
    public IEnumerator CreateGuestAccount(System.Action<User> onSuccess, System.Action<string> onError)
    {
        var data = new {
            deviceId = SystemInfo.deviceUniqueIdentifier,
            deviceName = SystemInfo.deviceModel
        };
        
        string json = JsonUtility.ToJson(data);
        
        using (UnityWebRequest request = new UnityWebRequest(API_BASE_URL + "/auth/guest", "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                var response = JsonUtility.FromJson<AuthResponse>(request.downloadHandler.text);
                authToken = response.token;
                PlayerPrefs.SetString("authToken", authToken);
                onSuccess?.Invoke(response.user);
            }
            else
            {
                onError?.Invoke(request.error);
            }
        }
    }
    
    public IEnumerator SaveGameData(GameData data, System.Action onSuccess, System.Action<string> onError)
    {
        string json = JsonUtility.ToJson(data);
        
        using (UnityWebRequest request = new UnityWebRequest(API_BASE_URL + "/game-data/save", "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", "Bearer " + authToken);
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                onSuccess?.Invoke();
            }
            else
            {
                onError?.Invoke(request.error);
            }
        }
    }
}
```

## Conclusion

This integration guide provides a foundation for connecting your client application to the Hip-Hop Game App backend. Adapt these examples to your specific platform and requirements, always keeping security, user experience, and data integrity in mind.

For more details, see:
- [API Documentation](./API_DOCUMENTATION.md)
- [Security Guide](./SECURITY_GUIDE.md)
- [Setup Guide](./SETUP_GUIDE.md)
