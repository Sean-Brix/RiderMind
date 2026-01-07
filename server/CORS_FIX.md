# Fix CORS for Firebase Storage Videos

## Problem
Videos blocked by CORS policy: `No 'Access-Control-Allow-Origin' header is present`

## Solution
Apply CORS configuration to your Firebase Storage bucket.

### Step 1: Install Google Cloud SDK
Download from: https://cloud.google.com/sdk/docs/install

Or use Firebase CLI if already installed.

### Step 2: Deploy CORS Configuration

Using Google Cloud CLI:
```bash
gsutil cors set cors.json gs://ridermind
```

Or using Firebase CLI:
```bash
firebase deploy --only storage
```

### Step 3: Verify CORS
```bash
gsutil cors get gs://ridermind
```

## Alternative: Use gsutil via PowerShell

```powershell
# If you have gcloud installed
gcloud auth login
gsutil cors set server/cors.json gs://ridermind
```

## What the cors.json does:
- Allows GET and HEAD requests from any origin (*)
- Required for video playback in browsers
- Sets cache duration to 1 hour

After applying, refresh your app and videos should load without CORS errors.
