# 🎯 RiderMind Seeding System - Complete Guide

## 📋 Overview

A fully automated database seeding system with support for:
- ✅ JSON-based module data
- ✅ Image processing (BLOB storage)
- ✅ Video file uploading
- ✅ Beautiful terminal animations
- ✅ Complete database reset functionality

## 🗂️ File Structure

```
server/
├── prisma/
│   ├── seed.js                           # Main orchestrator
│   ├── reset.js                          # Database reset script
│   ├── data/
│   │   └── modules/
│   │       ├── module.json               # 11 modules data
│   │       ├── images/                   # 1.jpg through 11.jpg/jpeg
│   │       └── videos/                   # 1.mp4 through 11.mp4
│   └── seeds/
│       ├── accounts.seed.js              # User accounts seeder
│       └── modules.seed.js               # Modules seeder with media
└── public/
    └── videos/                           # Uploaded videos directory
```

## 🚀 Commands

### Seed Database
```bash
npm run fill
```

Seeds:
- 4 user accounts
- 11 learning modules with:
  - 4 objectives each (44 total)
  - 3 slides each (33 total)
  - 1 image per module (stored as BLOB)
  - 1 video per module (uploaded to `/public/videos`)

### Reset Database
```bash
npm run reset
```

**⚠️ WARNING:** This will:
- Delete ALL database records
- Delete ALL uploaded videos
- Require confirmation (`DELETE EVERYTHING`)

## 📦 What Gets Seeded

### User Accounts (4)

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@ridermind.com | 123456 | ADMIN | Admin User |
| user@ridermind.com | 123456 | USER | Test User |
| john.doe@email.com | 123456 | USER | John Doe |
| jane.santos@email.com | 123456 | USER | Jane Santos |

### Learning Modules (11)

Each module from `module.json` is seeded with:

1. **Module 1-11**: Data from JSON file
   - ✅ Title, description, position
   - ✅ 4 learning objectives
   - ✅ 3 slides:
     - **Slide 1**: Image slide (uses `images/1.jpg` - `11.jpg`)
     - **Slide 2**: Video slide (uses `videos/1.mp4` - `11.mp4`)
     - **Slide 3**: Text slide (from JSON)

## 🎨 Media Handling

### Images (BLOB Storage)
- **Source**: `prisma/data/modules/images/1.jpg` through `11.jpg`
- **Storage**: Stored as BLOB in `module_slides.imageData`
- **MIME Type**: Auto-detected (image/jpeg or image/png)
- **Process**: Read → Convert to Buffer → Store in database

### Videos (File Upload)
- **Source**: `prisma/data/modules/videos/1.mp4` through `11.mp4`
- **Destination**: `server/public/videos/`
- **Naming**: `module-{index}-{timestamp}-{random}.mp4`
- **Storage**: Path stored in `module_slides.videoPath`
- **Process**: Copy file → Generate unique name → Store path in DB

Example uploaded video:
```
module-1-1761408304353-58704aefe065.mp4
```

## 📊 Seeding Process Flow

```
1. Load module.json
2. For each module (1-11):
   a. Check if exists (skip if yes)
   b. Process image file (1.jpg → Buffer)
   c. Upload video file (1.mp4 → /public/videos/)
   d. Create module with:
      - Objectives (4 per module)
      - Slides:
        * Slide 1: Image (BLOB data)
        * Slide 2: Video (file path)
        * Slide 3: Text (from JSON)
3. Display statistics
```

## ✨ Features

### Seeding Features
- 🎨 **Colorful animations** with progress indicators
- 📊 **Real-time statistics** (uploaded images/videos)
- 🔄 **Idempotent** - safe to run multiple times
- 🧩 **Modular** - separate seed files
- 📝 **JSON-driven** - easy to update data
- 🖼️ **Image processing** - automatic BLOB conversion
- 🎥 **Video handling** - file copying with unique names

### Reset Features
- ⚠️ **Safety confirmation** - requires exact phrase
- 🗑️ **Complete cleanup** - database + files
- 📊 **Detailed summary** - what was deleted
- 🎨 **Visual warnings** - clear danger indicators

## 🔧 Technical Details

### Image Processing
```javascript
// Reads image file
const imageBuffer = readFileSync(imagePath);

// Stores in database as BLOB
imageData: imageBuffer,
imageMime: 'image/jpeg'
```

### Video Upload
```javascript
// Generates unique filename
const destFileName = `module-${moduleIndex}-${timestamp}-${random}.mp4`;

// Copies to public directory
copyFileSync(sourcePath, destPath);

// Stores path in database
videoPath: `/videos/${destFileName}`
```

### Slide Structure
```javascript
// Slide 1: Image
{
  type: 'image',
  title: '...',
  content: '...',
  imageData: <Buffer>,
  imageMime: 'image/jpeg',
  position: 1
}

// Slide 2: Video
{
  type: 'video',
  title: '...',
  content: '...',
  videoPath: '/videos/module-1-123456-abc123.mp4',
  position: 2
}

// Slide 3: Text
{
  type: 'text',
  title: '...',
  content: '...',
  position: 3
}
```

## 📈 Database Records Created

| Entity | Count | Details |
|--------|-------|---------|
| Users | 4 | Admin + 3 test users |
| Modules | 11 | From module.json |
| Objectives | 44 | 4 per module |
| Slides | 33 | 3 per module (image, video, text) |
| Images | 11 | Stored as BLOB |
| Videos | 11 | Uploaded to /public/videos |
| **TOTAL** | **114** | Records + files |

## 🎯 Example Output

### Seeding Output
```
╔════════════════════════════════════════════════════════════╗
║     🏍️  RIDERMIND DATABASE SEEDING SYSTEM 🏍️              ║
╚════════════════════════════════════════════════════════════╝

🚀 Starting seed process...

📚 [2/2] Processing: Learning Modules
────────────────────────────────────────────────────────────

✓ [1/11] Creating: Introduction to Road Safety
   📸 Processing image 1...
   🎥 Uploading video 1...
   📚 4 objectives
   📄 3 slides (1 image, 1 video, 1 text)

📊 Results:
   ✓ Created: 11 modules
   📸 Uploaded: 11 images
   🎥 Uploaded: 11 videos
```

### Reset Output
```
╔════════════════════════════════════════════════════════════╗
║     ⚠️  DATABASE RESET WARNING ⚠️                          ║
╚════════════════════════════════════════════════════════════╝

Type "DELETE EVERYTHING" to confirm: DELETE EVERYTHING

🗑️  Deleting uploaded videos...
   ✓ Deleted: module-1-1761408304353-58704aefe065.mp4

📊 Summary:
   📦 Total records deleted: 104
   🎥 Total videos deleted: 11
```

## 🛠️ Customization

### Adding More Modules

1. Add data to `prisma/data/modules/module.json`
2. Add corresponding image: `images/12.jpg`
3. Add corresponding video: `videos/12.mp4`
4. Run: `npm run fill`

### Changing Media Files

1. Replace files in `images/` or `videos/` directories
2. Keep same numbering (1-11)
3. Run reset then fill:
   ```bash
   npm run reset
   npm run fill
   ```

## ⚡ Performance

- **Seeding Time**: ~15-20 seconds (11 modules with media)
- **Reset Time**: ~5 seconds
- **Total Files Processed**: 22 (11 images + 11 videos)
- **Total Upload Size**: ~54 MB (videos)

## 🔒 Safety

- ✅ Confirmation required for reset
- ✅ Foreign key constraints handled
- ✅ Unique filenames prevent conflicts
- ✅ Error handling for missing files
- ✅ Transaction-safe operations

## 📝 Notes

- Image files can be `.jpg`, `.jpeg`, or `.png`
- Video files must be `.mp4` format
- Numbering must match: `1.jpg` ↔ `1.mp4`
- Uploaded videos have unique timestamped names
- BLOB storage used for images (no file upload)
- Video paths are relative: `/videos/filename.mp4`

---

**Status:** ✅ FULLY FUNCTIONAL
**Last Updated:** October 25, 2025
**Version:** 2.0
