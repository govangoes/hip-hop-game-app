# Security Best Practices Guide

## Overview

This document outlines security best practices for the Hip-Hop Game App backend system. Following these guidelines is essential for protecting user data and maintaining system integrity.

## Authentication Security

### Password Requirements

**Implemented:**
- Minimum 6 characters (configurable in validation)
- Hashed using bcrypt with salt rounds = 10
- Never stored in plain text
- Password field excluded from default queries

**Recommendations for Enhancement:**
- Increase minimum length to 8+ characters
- Require mix of uppercase, lowercase, numbers, and special characters
- Implement password strength meter on client
- Prevent common passwords (dictionary check)
- Implement password history (prevent reuse)

### JWT Token Security

**Current Implementation:**
- HS256 signing algorithm
- 7-day expiration (configurable)
- Secret key from environment variable
- Token verification on protected routes

**Best Practices:**
- Use strong, random JWT secret (32+ characters)
- Consider shorter expiration for sensitive operations
- Implement token refresh mechanism
- Rotate secrets periodically
- Store tokens securely on client (not localStorage for web apps)
- Use HTTPS to prevent token interception
- Consider using RS256 (asymmetric) for better security

### Guest Account Security

**Implemented:**
- Unique username generation
- Device tracking
- Upgrade path to full account

**Considerations:**
- Guest accounts have same security as full accounts
- Data persists when upgrading
- Consider time limits or feature restrictions for guests
- Monitor for abuse (multiple guest accounts from same device)

## Data Protection

### Encryption at Rest

**Provided Utilities:**
- AES-256-CBC encryption
- Random IV generation
- Configurable encryption key

**Usage:**
```typescript
import { encrypt, decrypt } from './utils/encryption';

// Encrypt sensitive data before storage
const encryptedData = encrypt(sensitiveString);

// Decrypt when needed
const decryptedData = decrypt(encryptedData);
```

**Recommendations:**
- Encrypt personally identifiable information (PII)
- Encrypt payment information
- Use MongoDB's native encryption features for additional security
- Consider field-level encryption for maximum security

### Encryption in Transit

**Requirements:**
- Always use HTTPS in production
- Use TLS 1.2 or higher
- Configure proper SSL/TLS certificates
- Implement HSTS headers
- Disable insecure protocols

**Example nginx configuration:**
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

## Input Validation and Sanitization

### Current Implementation

Using `express-validator` for:
- Email format validation
- Password length requirements
- Required field validation
- Type checking

### Additional Recommendations

1. **Sanitize All Inputs**
```typescript
import { body, sanitizeBody } from 'express-validator';

body('username').trim().escape().isLength({ min: 3, max: 20 })
```

2. **Validate Data Types**
```typescript
body('level').isInt({ min: 1, max: 100 })
body('coordinates.x').isFloat()
```

3. **Prevent NoSQL Injection**
```typescript
// Bad - vulnerable to injection
User.findOne({ email: req.body.email })

// Good - mongoose sanitizes by default, but be careful with $where
User.findOne({ email: String(req.body.email) })
```

4. **Rate Limiting per Endpoint**
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, loginWithEmail);
```

## Database Security

### MongoDB Security Checklist

- [ ] Enable authentication
- [ ] Use strong passwords for database users
- [ ] Create separate users with minimal privileges
- [ ] Enable access control
- [ ] Use IP whitelisting
- [ ] Enable audit logging
- [ ] Encrypt data at rest (MongoDB Enterprise)
- [ ] Regular backups with encryption
- [ ] Keep MongoDB updated

### MongoDB Authentication Setup

```javascript
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "strongPassword",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

// Create application user with limited permissions
use hip-hop-game
db.createUser({
  user: "gameapp",
  pwd: "strongAppPassword",
  roles: [ { role: "readWrite", db: "hip-hop-game" } ]
})
```

### Connection String Security

```env
# Development
MONGODB_URI=mongodb://localhost:27017/hip-hop-game

# Production with authentication
MONGODB_URI=mongodb://gameapp:password@host:27017/hip-hop-game?authSource=hip-hop-game

# Production with MongoDB Atlas (recommended)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hip-hop-game?retryWrites=true&w=majority
```

### Query Security

1. **Prevent Injection**
```typescript
// Never use $where with user input
// Bad
const result = await Model.find({ $where: userInput });

// Good
const result = await Model.find({ field: userInput });
```

2. **Limit Query Results**
```typescript
// Prevent resource exhaustion
const results = await Model.find(query).limit(100);
```

3. **Use Projections**
```typescript
// Don't return sensitive fields
const user = await User.findById(id).select('-password -socialLogins');
```

## API Security

### CORS Configuration

**Current Implementation:**
```typescript
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
```

**Production Settings:**
```env
# Never use wildcard in production
ALLOWED_ORIGINS=https://yourgame.com,https://api.yourgame.com
```

### Security Headers (Helmet)

**Implemented:**
```typescript
app.use(helmet());
```

**Helmet includes:**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

**Custom CSP Configuration:**
```typescript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));
```

### Rate Limiting

**Recommended Implementation:**

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

## OAuth Security

### Social Login Implementation

When implementing OAuth providers (Google, Facebook, Apple):

1. **Verify Tokens Server-Side**
```typescript
// Never trust client-provided tokens without verification
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(config.oauth.google.clientId);

async function verifyGoogleToken(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.oauth.google.clientId,
  });
  return ticket.getPayload();
}
```

2. **Use State Parameter**
- Prevent CSRF attacks
- Generate random state for each OAuth request
- Verify state on callback

3. **Store Minimal Data**
- Only store necessary OAuth data
- Don't store access tokens unless required
- Store refresh tokens securely

4. **Handle Token Expiration**
- Implement token refresh
- Handle expired tokens gracefully

## Device Security

### Device Tracking

**Implemented:**
- Device ID and name tracking
- Last login timestamp
- Multiple device support

**Enhancements:**
1. **Device Verification**
```typescript
// Send verification email when new device is added
async function notifyNewDevice(user, device) {
  await sendEmail(user.email, {
    subject: 'New device logged in',
    body: `A new device (${device.deviceName}) logged into your account.`
  });
}
```

2. **Device Management**
- Allow users to view all devices
- Implement device revocation
- Suspicious device detection
- Two-factor authentication for new devices

3. **Device Fingerprinting**
```typescript
interface DeviceFingerprint {
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  location?: string;
}
```

## Session Management

### Best Practices

1. **Session Expiration**
```typescript
// Short-lived access tokens
const accessToken = generateToken(userId, '15m');

// Long-lived refresh tokens
const refreshToken = generateRefreshToken(userId, '30d');
```

2. **Token Refresh Mechanism**
```typescript
async function refreshAccessToken(refreshToken: string) {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.userId);
  
  if (!user) throw new Error('User not found');
  
  return generateToken(user._id.toString());
}
```

3. **Logout and Token Invalidation**
```typescript
// Implement token blacklist for logout
const tokenBlacklist = new Set();

function logout(token: string) {
  tokenBlacklist.add(token);
}

function isTokenBlacklisted(token: string) {
  return tokenBlacklist.has(token);
}
```

## Privacy and Compliance

### GDPR Compliance

**Required Features:**

1. **Data Access Request**
```typescript
async function exportUserData(userId: string) {
  const [user, profile, cityState, collection, achievements] = await Promise.all([
    User.findById(userId),
    PlayerProfile.findOne({ userId }),
    CityState.findOne({ userId }),
    Collection.findOne({ userId }),
    Achievement.findOne({ userId }),
  ]);
  
  return {
    personalData: user,
    gameData: { profile, cityState, collection, achievements },
  };
}
```

2. **Data Deletion**
```typescript
async function deleteUserData(userId: string) {
  await Promise.all([
    User.findByIdAndDelete(userId),
    PlayerProfile.deleteOne({ userId }),
    CityState.deleteOne({ userId }),
    Collection.deleteOne({ userId }),
    Achievement.deleteOne({ userId }),
  ]);
}
```

3. **Consent Management**
- Track user consent
- Allow consent withdrawal
- Document data processing purposes

### CCPA Compliance

- Provide "Do Not Sell My Personal Information" option
- Allow data deletion requests
- Disclose data collection practices
- Provide opt-out mechanism

## Logging and Monitoring

### Security Logging

**What to Log:**
- Failed login attempts
- Account creation
- Password changes
- Permission changes
- Sensitive data access
- API errors
- Unusual patterns

**Example Implementation:**
```typescript
function logSecurityEvent(event: string, details: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    details,
    level: 'security'
  }));
}

// Usage
logSecurityEvent('failed_login', {
  email: req.body.email,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

### Monitoring Alerts

Set up alerts for:
- Multiple failed login attempts
- Unusual API usage patterns
- Database connection issues
- High error rates
- Slow response times

## Incident Response

### Security Incident Plan

1. **Detect**
   - Monitor logs and alerts
   - User reports
   - Automated scanning

2. **Contain**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs

3. **Investigate**
   - Analyze logs
   - Identify attack vector
   - Assess damage

4. **Remediate**
   - Patch vulnerabilities
   - Reset compromised accounts
   - Update security measures

5. **Document**
   - Record incident details
   - Document response actions
   - Update procedures

### Breach Notification

If user data is compromised:
- Notify affected users within 72 hours (GDPR)
- Notify relevant authorities
- Provide guidance to users
- Implement additional security measures

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Automated Scanning

Use tools like:
- GitHub Dependabot
- Snyk
- npm audit
- OWASP Dependency Check

## Code Security

### Secure Coding Practices

1. **Avoid Eval and Dynamic Code**
```typescript
// Never use eval with user input
// Bad
eval(userInput);

// Good
// Use JSON.parse for data, avoid code execution
JSON.parse(userInput);
```

2. **Parameterized Queries**
```typescript
// Mongoose handles this automatically
// But be aware when using native MongoDB driver
const result = await collection.find({ email: userEmail });
```

3. **Error Handling**
```typescript
// Don't expose sensitive information in errors
try {
  // operation
} catch (error) {
  console.error('Full error:', error); // Log full error
  res.status(500).json({ 
    error: 'Internal server error' // Send generic message
  });
}
```

## Regular Security Audits

### Checklist

- [ ] Review authentication mechanisms
- [ ] Check for exposed secrets
- [ ] Verify input validation
- [ ] Test authorization logic
- [ ] Review database queries
- [ ] Check dependency versions
- [ ] Test error handling
- [ ] Review logging practices
- [ ] Verify encryption usage
- [ ] Test backup and recovery

### Penetration Testing

Consider regular penetration testing:
- Automated scanning tools
- Professional security audits
- Bug bounty programs

## Conclusion

Security is an ongoing process. Stay informed about:
- OWASP Top 10
- CVE databases
- Security advisories for dependencies
- Industry best practices

Regularly review and update security measures to protect user data and maintain system integrity.
