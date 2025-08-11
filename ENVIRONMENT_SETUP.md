# Environment Setup & Configuration Guide

## 🔧 **Environment Variables Required**

### Firebase Client Configuration (Public)
```bash
# Required for client-side Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBQZsvMlcu3H8G5K7x6TMgMj-F2fEUVKWo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=househelp-42493.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=househelp-42493
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=househelp-42493.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=251592966595
NEXT_PUBLIC_FIREBASE_APP_ID=1:251592966595:web:e6dbd8bf39d25808d1bd76
```

### Firebase Admin Configuration (Private)
```bash
# Method 1: Individual environment variables (Recommended for production)
FIREBASE_ADMIN_PROJECT_ID=househelp-42493
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@househelp-42493.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_PRIVATE_KEY_ID=ad129f5ed0003ef2306d8163e73ce84cc1560f69

# Method 2: Complete JSON (Alternative)
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'
```

### Application Configuration
```bash
# Admin User Setup
ADMIN_EMAIL=admin@househelp.rw
ADMIN_PASSWORD=@dM1Nd

# Payment Integration
PAYPACK_APP_ID=663b4e0e-6f1e-11f0-ae48-dead131a2dd9
PAYPACK_APP_SECRET=0a3f1c0bdf3dd16f80756715efb89d7cda39a3ee5e6b4b0d3255bfef95601890afd80709

# AI Integration
GOOGLE_GENAI_API_KEY=AIzaSyBQZsvMlcu3H8G5K7x6TMgMj-F2fEUVKWo

# External Services
ISANGE_EMAIL=info1@kicukiro.gov.rw
COMPANY_EMAIL=support@househelp.appspot

# Environment
NODE_ENV=development
```

## 🏗️ **Firebase Admin SDK Configuration**

### Priority Order:
1. **Environment Variables** (Production) - Uses individual env vars
2. **Service Account JSON** (Development) - Uses local JSON file
3. **Fallback Configuration** - Default values

### Files Using Firebase Admin:
- `lib/firebase-admin-unified.ts` - **Primary unified config**
- `lib/firebase-admin.ts` - Legacy individual config
- `lib/firebase-admin-api.ts` - API route specific config  
- `config/firebaseAdmin.js` - JavaScript config (updated)

## 🎯 **Fixed Issues**

### ✅ **Resolved Mismatches:**
1. **Multiple Firebase Admin Configurations** - Unified to consistent pattern
2. **Duplicate Environment Variables** - Removed conflicting entries
3. **Service Account File Duplication** - Cleaned up extra files
4. **Firebase Hosting Config** - Fixed for Next.js static export
5. **Package.json Scripts** - Organized and commented
6. **Firebase Client Config** - Added environment variable fallbacks

### 🚀 **Recommended Usage:**

For **new code**, use the unified configuration:
```typescript
import { adminDb, adminAuth, adminHelpers } from '@/lib/firebase-admin-unified';
```

For **existing code**, continue using current imports (they still work):
```typescript
import { adminDb, adminAuth } from '@/lib/firebase-admin';
```

## 🔄 **Migration Path**

1. **Immediate**: All existing code continues to work
2. **Gradual**: New features should use `firebase-admin-unified.ts`
3. **Future**: Eventually migrate all imports to unified config

## 🧪 **Testing the Setup**

```bash
# Test individual seeding scripts
npm run seed:admin
npm run seed:households
npm run seed:workers

# Test complete system
npm run seed:all

# Test build process
npm run build

# Test type checking
npm run typecheck
```

## 🚨 **Security Notes**

- Never commit `.env.local` or service account JSON files to git
- Use environment variables in production deployments
- Rotate service account keys regularly
- Limit Firebase Admin SDK permissions to minimum required
