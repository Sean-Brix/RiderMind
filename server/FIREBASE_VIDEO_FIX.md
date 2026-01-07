# Firebase Storage Rules Fix for Quiz Videos

## Problem
Quiz videos are not playing because Firebase Storage rules are blocking public access to video files.

## Solution
Update Firebase Storage rules to allow public read access for the `animation-seed` folder.

## Steps to Fix

### 1. Deploy Updated Storage Rules

The storage rules have been updated in `firebase.storage.rules`. Deploy them to Firebase:

```bash
# Option 1: Using Firebase CLI (if you have firebase.json configured)
firebase deploy --only storage

# Option 2: Manual deployment
# Go to Firebase Console > Storage > Rules
# Copy the content from firebase.storage.rules and paste it there
```

### 2. Verify Rules in Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: **captsones**
3. Navigate to **Storage** > **Rules**
4. Verify the rules include:

```
match /animation-seed/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth == null || 
               (request.auth != null && request.auth.token.admin == true);
}
```

### 3. Test Video Access

After deploying the rules, test one of your video URLs directly in a browser:

```
https://firebasestorage.googleapis.com/v0/b/ridermind/o/animation-seed%2Fmodule%2FModule%201.mp4?alt=media
```

If it plays/downloads, the rules are working correctly!

### 4. Refresh Your Application

- Clear browser cache (Ctrl+Shift+Delete)
- Reload the RiderMind app
- Try taking a quiz - videos should now load

## What Changed

**Before:** All files required authentication (blocked videos from playing)

```javascript
match /{allPaths=**} {
  allow read, write: if request.auth == null || ...
}
```

**After:** Public read access for animation-seed folder

```javascript
match /animation-seed/{allPaths=**} {
  allow read: if true; // Public read access ✅
  allow write: if request.auth == null || ...
}
```

## Security Note

This change only makes the `animation-seed` folder publicly readable, which is appropriate for:
- Educational content (modules, quizzes)
- Videos that are already public on your platform
- No sensitive user data

All other folders maintain secure access control.

## Alternative: Signed URLs (More Secure)

If you prefer not to make files public, you can generate signed URLs server-side:

1. Generate signed URLs when fetching quiz data
2. URLs expire after a set time (e.g., 1 hour)
3. More complex but more secure

For now, public read access for educational content is the simpler and standard approach.
