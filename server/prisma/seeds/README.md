# 🌱 RiderMind Database Seeding System

A modular and animated database seeding system for RiderMind with **complete quiz coverage for all 11 modules**.

## 📁 Structure

```
prisma/
├── seed.js                          # Main seed orchestrator
├── SEED_DOCUMENTATION.md            # Comprehensive documentation
└── Seeds/
    ├── README.md                    # This file
    ├── accounts.seed.js             # User accounts seeder
    ├── modules.seed.js              # Learning modules seeder (11 modules)
    ├── categories.seed.js           # Module categories seeder
    ├── quizzes-complete.seed.js     # ⭐ Complete quiz set (ALL 11 modules)
    ├── quizzes.seed.js              # Deprecated (only 3 modules)
    └── faqs.seed.js                 # FAQ seeder
```

## 🚀 Usage

Run all seeds with animations:

```bash
npm run seed
```

This will seed:
- ✅ **User Accounts** (Admin and test users)
- ✅ **11 Learning Modules** with objectives, slides, images, and videos
- ✅ **6 Module Categories** assigned to different student types
- ✅ **11 Complete Quizzes** with 56 questions total
- ✅ **14 FAQs** organized by category

## 📚 Seeded Modules

All 11 modules with complete quiz coverage:

1. **Introduction to Road Safety** - Fundamental principles and defensive driving ✅ Quiz
2. **Traffic Rules and Regulations** - Philippine traffic laws ✅ Quiz
3. **Vehicle Safety and Maintenance** - Pre-ride inspections and maintenance ✅ Quiz
4. **Weather and Road Conditions** - Driving in various conditions ✅ Quiz
5. **Night Driving Safety** - Techniques for nighttime driving ✅ Quiz
6. **Motorcycle Riding Techniques** - Proper riding and safety gear ✅ Quiz
7. **Emergency Situations** - Handling emergencies on the road ✅ Quiz
8. **Pedestrian and Cyclist Safety** - Sharing the road safely ✅ Quiz
9. **Impaired and Distracted Driving** - Understanding the dangers ✅ Quiz
10. **Environmental Awareness** - Eco-friendly driving practices ✅ Quiz
11. **Legal Responsibilities and Ethics** - Driver responsibilities ✅ Quiz

Each module includes:
- 📝 4 learning objectives
- 📄 3 content slides (1 image, 1 video, 1 text)
- 📝 Comprehensive quiz with 5-6 questions
- 🔢 Proper positioning and ordering

## 📝 Quiz System

### Complete Coverage
- **11 quizzes** (one for each module)
- **56 total questions** across all quizzes
- **110 total points** available

### Question Types
1. **MULTIPLE_CHOICE** - Single correct answer
2. **TRUE_FALSE** - Boolean questions
3. **IDENTIFICATION** - Text input (case-insensitive)
4. **MULTIPLE_ANSWER** - Multiple correct options

### Scoring System
- **Points-based**: Questions worth 1-3 points
- **70% passing score** required
- **Time limits**: 15-20 minutes per quiz
- **Randomization**: Questions and options shuffled

### Quiz Details

| Module | Quiz | Questions | Points | Time |
|--------|------|-----------|--------|------|
| 1 | Introduction to Road Safety | 5 | 10 | 15 min |
| 2 | Traffic Rules and Regulations | 5 | 9 | 20 min |
| 3 | Vehicle Safety and Maintenance | 5 | 10 | 15 min |
| 4 | Weather and Road Conditions | 5 | 10 | 15 min |
| 5 | Night Driving Safety | 5 | 10 | 15 min |
| 6 | Motorcycle Riding Techniques | 5 | 10 | 15 min |
| 7 | Emergency Situations | 5 | 10 | 15 min |
| 8 | Pedestrian and Cyclist Safety | 5 | 10 | 15 min |
| 9 | Impaired and Distracted Driving | 5 | 10 | 15 min |
| 10 | Environmental Awareness | 5 | 10 | 15 min |
| 11 | Legal Responsibilities and Ethics | 6 | 11 | 20 min |

## 🏷️ Module Categories

Categories assigned to student types:

| Category | Student Type | Modules |
|----------|--------------|---------|
| Motorcycle (Basic) | A | 1-8 |
| Motorcycle (Advanced) | A1 | 1-8 |
| Car & SUV | B | 1-11 |
| Light Trucks | B1 | 1-11 |
| Heavy Trucks | B2 | 1-11 |
| Professional Driver | C | 1-11 |

## 👥 Default Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@ridermind.com | 123456 | ADMIN | Admin User |
| user@ridermind.com | 123456 | USER | Test User |
| john.doe@email.com | 123456 | USER | John Doe |
| jane.santos@email.com | 123456 | USER | Jane Santos |

## ❓ Seeded FAQs

14 FAQs organized by category:
- **General** (3) - About RiderMind, getting started, student types
- **System** (3) - Password reset, profile changes, security
- **Module** (3) - Module structure, progress, ordering
- **Quiz** (5) - How quizzes work, passing scores, retakes

## ✨ Features

- 🎨 **Colorful Terminal Output** - Using the `colors` package
- ⏳ **Animated Progress** - Spinner animations during seeding
- 📊 **Statistics** - Summary of created/skipped records
- 🔄 **Idempotent** - Safe to run multiple times (skips existing records)
- 🧩 **Modular** - Each seed type in separate file
- 🎯 **Type-Safe** - Uses Prisma Client for database operations
- � **Media Processing** - Handles images and videos
- ⚡ **Fast** - Completes in ~30-40 seconds

## 🛠️ Running Individual Seeds

```bash
# Accounts only
node prisma/Seeds/accounts.seed.js

# Modules only
node prisma/Seeds/modules.seed.js

# Categories only
node prisma/Seeds/categories.seed.js

# Complete quizzes (all 11 modules)
node prisma/Seeds/quizzes-complete.seed.js

# FAQs only
node prisma/Seeds/faqs.seed.js
```

## 📂 Data Sources

### Module Data
- **JSON**: `prisma/data/modules/module.json` (all 11 modules)
- **Images**: `prisma/data/modules/images/` (1.jpg - 11.jpg)
- **Videos**: `prisma/data/modules/videos/` (1.mp4 - 11.mp4)

### Account Data
- **JSON**: `prisma/data/accounts.json`

### Quiz Data
- **Hardcoded**: In `Seeds/quizzes-complete.seed.js`
- Self-contained, no external files needed

### FAQ Data
- **Hardcoded**: In `Seeds/faqs.seed.js`
- Self-contained, no external files needed

## 🎭 Animation System

The seeding system includes built-in animations:

```javascript
// Spinner animation
const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Progress animation
await animateProgress('Creating record...', 800);

// Progress bar
await showProgress(current, total, 'Processing...');
```

## 🔧 Troubleshooting

**Problem:** "Module not found" error
- Ensure modules are seeded before categories/quizzes
- Run: `node prisma/Seeds/modules.seed.js` first

**Problem:** "Image/Video not found" error
- Check files exist in `data/modules/images/` and `data/modules/videos/`
- Verify naming: 1.jpg, 2.jpg, ..., 11.jpg

**Problem:** Seeds not running
- Ensure database connection is configured in `.env`
- Check `DATABASE_URL` is set correctly
- Run `npx prisma generate` first

**Problem:** Duplicate key errors
- Seeds are idempotent - they skip existing records
- Safe to re-run without data loss

## 📊 Performance

Approximate execution times:
- **Accounts**: ~2 seconds
- **Modules**: ~15-20 seconds (image/video processing)
- **Categories**: ~3 seconds
- **Quizzes (complete)**: ~8-10 seconds
- **FAQs**: ~1 second

**Total**: ~30-40 seconds for complete seed

## 🔄 Seed Execution Order

**Important**: Seeds run in this order due to foreign key relationships:

1. **accounts.seed.js** - Independent
2. **modules.seed.js** - Independent
3. **categories.seed.js** - Depends on modules
4. **quizzes-complete.seed.js** - Depends on modules
5. **faqs.seed.js** - Independent

## 📝 Notes

- All seeds check for existing records before creating
- Timestamps are automatically generated
- Positions are auto-assigned for ordering
- Password hashing uses bcrypt with 10 rounds
- Database connection auto-closes after completion
- Videos are copied to `public/videos/` directory
- Images are stored as binary data in database
- Point-based quiz scoring system
- Case-insensitive answer matching for IDENTIFICATION questions

## 📖 Documentation

For comprehensive documentation, see:
- **[SEED_DOCUMENTATION.md](../SEED_DOCUMENTATION.md)** - Complete seed system guide

---

**Last Updated**: October 27, 2025
**Version**: 2.0
**Modules**: 11 complete modules with quizzes
**Total Questions**: 56 across all modules

Made with 💙 for RiderMind
