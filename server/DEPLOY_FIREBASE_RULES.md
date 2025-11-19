# Deploy Firebase Storage Rules

## Option 1: Via Firebase Console (Recommended for Quick Fix)

1. Go to https://console.firebase.google.com
2. Select your project: **ridermind**
3. Click **Storage** in the left sidebar
4. Click the **Rules** tab
5. Copy the rules from `server/firebase.storage.rules`
6. Paste into the console editor
7. Click **Publish**

## Option 2: Via Firebase CLI

If you have Firebase CLI installed:

```bash
# Navigate to server directory
cd server

# Deploy storage rules
firebase deploy --only storage
```

### Install Firebase CLI (if not installed):
```bash
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init storage
```

## Important: Set Admin Custom Claims

The storage rules require admin custom claims. Set this for your admin user:

### Via Firebase Console:
1. Go to **Authentication** → **Users**
2. Click on your admin user
3. Scroll to **Custom Claims**
4. Add: `{"admin": true}`

### Via Firebase Admin SDK (Node.js):
```javascript
import { getAuth } from 'firebase-admin/auth';

// Set admin claim for a user
await getAuth().setCustomUserClaims(adminUserId, { admin: true });
```

## Current Rules Overview

- ✅ **test-uploads/**: Admin write, authenticated read
- ✅ **modules/**: Admin write, authenticated read  
- ✅ **quizzes/**: Admin write, authenticated read
- ✅ **sample-media/**: Should add this path if using sample media
- ❌ Default: Deny all other access

## Test After Deployment

Once deployed, test the upload again. The error should be resolved if:
1. Rules are published
2. Your user has admin custom claim set
3. Authentication token is valid
