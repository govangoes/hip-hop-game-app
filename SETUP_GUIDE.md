# Setup and Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Security Checklist](#security-checklist)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before setting up the Hip-Hop Game App backend, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (v6.0 or higher)
- **Git** (for version control)

### Verify Installations

```bash
node --version
npm --version
mongo --version
```

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/govangoes/hip-hop-game-app.git
cd hip-hop-game-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- JWT (authentication)
- bcrypt (password hashing)
- TypeScript (type safety)

### 3. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and set the following variables:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/hip-hop-game

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OAuth (Optional for social logins)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Important Security Notes

- **JWT_SECRET:** Generate a strong random string (e.g., using `openssl rand -base64 32`)
- **ENCRYPTION_KEY:** Must be exactly 32 characters for AES-256 encryption
- **Never commit `.env` file to version control**

## Database Setup

### 1. Install MongoDB

#### On macOS (using Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
```

#### On Ubuntu/Debian

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### On Windows

Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 2. Start MongoDB

#### On macOS

```bash
brew services start mongodb-community@6.0
```

#### On Linux

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### On Windows

MongoDB should start automatically as a service.

### 3. Verify MongoDB Connection

```bash
mongosh
```

You should see a MongoDB shell prompt.

### 4. Create Database (Optional)

MongoDB will automatically create the database on first connection, but you can create it manually:

```javascript
use hip-hop-game
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

This uses `nodemon` and `ts-node` for automatic reloading on file changes.

### Production Mode

```bash
npm run build
npm start
```

### Verify Server is Running

Visit `http://localhost:3000/health` in your browser or use curl:

```bash
curl http://localhost:3000/health
```

You should see:

```json
{
  "status": "ok",
  "timestamp": "2025-10-26T12:00:00.000Z",
  "environment": "development"
}
```

## Testing

### Manual Testing with curl

#### Create a Guest Account

```bash
curl -X POST http://localhost:3000/api/auth/guest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-123",
    "deviceName": "Test Device"
  }'
```

#### Register with Email

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "TestPlayer",
    "deviceId": "test-device-123",
    "deviceName": "Test Device"
  }'
```

#### Save Game Data

```bash
curl -X POST http://localhost:3000/api/game-data/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "profile": {
      "level": 5,
      "experience": 1000
    }
  }'
```

### Testing with Postman

1. Import the API collection
2. Set up environment variables (BASE_URL, TOKEN)
3. Test all endpoints systematically

## Production Deployment

### Deployment Platforms

The application can be deployed to various platforms:

#### 1. AWS (Elastic Beanstalk or EC2)

##### Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create environment
eb create hip-hop-game-prod

# Deploy
eb deploy
```

##### MongoDB Atlas (Recommended for Production)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in production environment

#### 2. Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create hip-hop-game-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set MONGODB_URI=your-mongodb-atlas-uri

# Deploy
git push heroku main
```

#### 3. Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t hip-hop-game-api .
docker run -p 3000:3000 --env-file .env hip-hop-game-api
```

#### 4. Azure App Service

Use Azure CLI or Azure Portal to deploy the Node.js application.

### Production Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hip-hop-game
JWT_SECRET=super-secure-production-secret
ENCRYPTION_KEY=your-32-char-production-key
ALLOWED_ORIGINS=https://yourgame.com,https://www.yourgame.com
```

### Post-Deployment Steps

1. **Verify Health Endpoint**
   ```bash
   curl https://your-domain.com/health
   ```

2. **Test Authentication Flow**
   - Create guest account
   - Register with email
   - Login

3. **Monitor Logs**
   - Check application logs for errors
   - Set up log aggregation (CloudWatch, Loggly, etc.)

4. **Set Up SSL/TLS**
   - Use Let's Encrypt for free SSL certificates
   - Configure HTTPS in production

## Security Checklist

### Before Going to Production

- [ ] Change all default secrets and keys
- [ ] Enable HTTPS/TLS for all connections
- [ ] Use strong, unique JWT secret (32+ characters)
- [ ] Set proper CORS origins (no wildcards in production)
- [ ] Enable rate limiting
- [ ] Use MongoDB Atlas with IP whitelisting
- [ ] Enable MongoDB authentication
- [ ] Implement input validation on all endpoints
- [ ] Set up security headers with Helmet
- [ ] Enable audit logging
- [ ] Implement password complexity requirements
- [ ] Set up DDoS protection (CloudFlare, AWS Shield)
- [ ] Regular security audits and dependency updates
- [ ] Implement session management and token rotation
- [ ] Set up monitoring and alerts

### Password Security

Passwords are hashed using bcrypt with automatic salt generation (10 rounds). Never store plain-text passwords.

### Data Encryption

Sensitive data can be encrypted using the encryption utilities:

```typescript
import { encrypt, decrypt } from './utils/encryption';

const encrypted = encrypt('sensitive data');
const decrypted = decrypt(encrypted);
```

### JWT Token Security

- Tokens expire after 7 days (configurable)
- Use HTTPS to prevent token interception
- Store tokens securely on client (not in localStorage for web)
- Implement token refresh mechanism for better security

## Monitoring and Maintenance

### Application Monitoring

#### 1. Health Checks

Set up periodic health checks:

```bash
*/5 * * * * curl https://your-domain.com/health
```

#### 2. Error Tracking

Integrate error tracking services:
- Sentry
- Rollbar
- New Relic

#### 3. Performance Monitoring

Monitor:
- Response times
- Database query performance
- Memory usage
- CPU usage

### Database Maintenance

#### Backup Strategy

```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/hip-hop-game" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/hip-hop-game" /backup/20251026
```

#### Indexing

Ensure proper indexes are created (automatically done by Mongoose):

```javascript
// User indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ "socialLogins.providerId": 1 })
db.users.createIndex({ "devices.deviceId": 1 })

// Game data indexes
db.playerprofiles.createIndex({ userId: 1 })
db.citystates.createIndex({ userId: 1 })
db.collections.createIndex({ userId: 1 })
db.achievements.createIndex({ userId: 1 })
```

### Scaling Considerations

#### Horizontal Scaling

- Use load balancer (AWS ALB, nginx)
- Deploy multiple instances
- Ensure session/state is in database (stateless API)

#### Database Scaling

- Use MongoDB Atlas auto-scaling
- Implement read replicas
- Consider sharding for very large datasets

### Logs

#### Development

Logs are output to console.

#### Production

Use log aggregation:
- CloudWatch (AWS)
- Stackdriver (GCP)
- Azure Monitor
- ELK Stack (Elasticsearch, Logstash, Kibana)

### Update Strategy

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations if any
# npm run migrate

# Rebuild
npm run build

# Restart service
pm2 restart hip-hop-game-api
```

### Automated Deployments

Set up CI/CD pipeline:

1. **GitHub Actions**
   - Automatic tests on push
   - Deploy on merge to main

2. **Jenkins**
   - Build and test pipeline
   - Automated deployment

3. **GitLab CI/CD**
   - Complete DevOps pipeline

## Troubleshooting

### Common Issues

#### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running:
```bash
brew services start mongodb-community@6.0  # macOS
sudo systemctl start mongod                # Linux
```

#### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** Kill process on port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

#### JWT Verification Failed

```
Error: Invalid or expired token
```

**Solution:** 
- Check token expiration
- Verify JWT_SECRET matches
- Ensure token format is correct

#### Module Not Found

```
Error: Cannot find module 'express'
```

**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support and Contact

For issues, questions, or contributions:

- GitHub Issues: [https://github.com/govangoes/hip-hop-game-app/issues](https://github.com/govangoes/hip-hop-game-app/issues)
- Documentation: See API_DOCUMENTATION.md
- Security Issues: Report privately to security@example.com

## License

[Insert license information]
