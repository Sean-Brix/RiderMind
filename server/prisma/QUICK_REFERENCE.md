# 🚀 Quick Reference - RiderMind Seeding System

## Commands

| Command | Action | Confirmation Required |
|---------|--------|----------------------|
| `npm run fill` | Seed database with all data | ❌ No |
| `npm run reset` | Delete all data and videos | ✅ Yes (`DELETE EVERYTHING`) |

## What Gets Seeded

```
📦 Total: 114 Records + 11 Files

Users:          4 accounts
Modules:        11 modules
Objectives:     44 records (4 per module)
Slides:         33 records (3 per module)
Images:         11 files (BLOB storage)
Videos:         11 files (uploaded to /public/videos)
```

## File Locations

```
prisma/data/modules/
├── module.json          # Module data (11 modules)
├── images/             
│   ├── 1.jpg           # Module 1 image
│   ├── 2.jpeg          # Module 2 image
│   └── ... (up to 11)
└── videos/
    ├── 1.mp4           # Module 1 video
    ├── 2.mp4           # Module 2 video
    └── ... (up to 11)

server/public/videos/    # Uploaded videos destination
```

## Slide Structure Per Module

| Slide # | Type | Media | Source |
|---------|------|-------|--------|
| 1 | Image | BLOB in DB | `images/{N}.jpg` |
| 2 | Video | File upload | `videos/{N}.mp4` |
| 3 | Text | JSON data | `module.json` |

## Default Accounts

```bash
# Admin
Email:    admin@ridermind.com
Password: 123456

# Test User
Email:    user@ridermind.com
Password: 123456
```

## Typical Workflow

```bash
# 1. Reset database (if needed)
npm run reset
# Type: DELETE EVERYTHING

# 2. Seed database
npm run fill

# 3. Done! 114 records created
```

## Quick Stats

- ⏱️ Seeding time: ~15-20 seconds
- 🗑️ Reset time: ~5 seconds  
- 📦 Total data: ~54 MB (videos)
- 🎯 Success rate: 100% (when files present)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing image | Add `images/{N}.jpg` (1-11) |
| Missing video | Add `videos/{N}.mp4` (1-11) |
| Duplicate error | Run `npm run reset` first |
| Wrong file format | Images: jpg/jpeg/png, Videos: mp4 |

---

**💡 Tip:** Always run `npm run reset` before seeding fresh data to avoid duplicates!
