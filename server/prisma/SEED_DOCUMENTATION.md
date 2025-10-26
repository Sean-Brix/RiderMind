# RiderMind Database Seeding System

## Overview

This seeding system provides a comprehensive way to populate the RiderMind database with sample data for all schemas, including 11 complete learning modules with quizzes.

## What Gets Seeded

### 1. User Accounts (`accounts.seed.js`)
- Admin accounts
- Student accounts with different student types (A, A1, B, B1, B2, C, D, BE, CE)
- Complete profile information including personal details, addresses, and emergency contacts

### 2. Learning Modules (`modules.seed.js`)
All 11 modules with complete content:

1. **Introduction to Road Safety** - Fundamental principles and defensive driving
2. **Traffic Rules and Regulations** - Philippine traffic laws
3. **Vehicle Safety and Maintenance** - Pre-ride inspections and maintenance
4. **Weather and Road Conditions** - Driving in various conditions
5. **Night Driving Safety** - Techniques for nighttime driving
6. **Motorcycle Riding Techniques** - Proper riding positions and safety gear
7. **Emergency Situations** - Handling emergencies on the road
8. **Pedestrian and Cyclist Safety** - Sharing the road safely
9. **Impaired and Distracted Driving** - Understanding the dangers
10. **Environmental Awareness** - Eco-friendly driving practices
11. **Legal Responsibilities and Ethics** - Driver responsibilities and ethics

Each module includes:
- Title, description, and objectives
- 3 slides (1 image, 1 video, 1 text)
- Position ordering
- Active status

### 3. Module Categories (`categories.seed.js`)
- **Motorcycle (Basic)** - Student Type A (Modules 1-8)
- **Motorcycle (Advanced)** - Student Type A1 (Modules 1-8)
- **Car & SUV** - Student Type B (All 11 modules)
- **Light Trucks** - Student Type B1 (All 11 modules)
- **Heavy Trucks** - Student Type B2 (All 11 modules)
- **Professional Driver** - Student Type C (All 11 modules)

Each category links to appropriate modules for that student type.

### 4. Complete Quizzes (`quizzes-complete.seed.js`)
**All 11 modules have comprehensive quizzes** with:

- **5-6 questions per quiz** covering module content
- **Multiple question types**:
  - MULTIPLE_CHOICE (single correct answer)
  - TRUE_FALSE (boolean questions)
  - IDENTIFICATION (text input)
  - MULTIPLE_ANSWER (multiple correct options)
  
- **Point-based scoring** (questions worth 1-3 points each)
- **70% passing score** requirement
- **Time limits** (15-20 minutes per quiz)
- **Question shuffling** enabled for fair testing
- **Detailed feedback** and correct answer display

#### Quiz Details:

| Module | Quiz Title | Questions | Total Points | Time Limit |
|--------|-----------|-----------|--------------|------------|
| 1 | Introduction to Road Safety Quiz | 5 | 10 pts | 15 min |
| 2 | Traffic Rules and Regulations Quiz | 5 | 9 pts | 20 min |
| 3 | Vehicle Safety and Maintenance Quiz | 5 | 10 pts | 15 min |
| 4 | Weather and Road Conditions Quiz | 5 | 10 pts | 15 min |
| 5 | Night Driving Safety Quiz | 5 | 10 pts | 15 min |
| 6 | Motorcycle Riding Techniques Quiz | 5 | 10 pts | 15 min |
| 7 | Emergency Situations Quiz | 5 | 10 pts | 15 min |
| 8 | Pedestrian and Cyclist Safety Quiz | 5 | 10 pts | 15 min |
| 9 | Impaired and Distracted Driving Quiz | 5 | 10 pts | 15 min |
| 10 | Environmental Awareness Quiz | 5 | 10 pts | 15 min |
| 11 | Legal Responsibilities and Ethics Quiz | 6 | 11 pts | 20 min |

**Total**: 56 questions, 110 points across all quizzes

### 5. FAQs (`faqs.seed.js`)
- **General** category - About RiderMind, getting started, student types
- **System** category - Password reset, profile changes, data security
- **Module** category - Module structure, progress tracking, order
- **Quiz** category - How quizzes work, passing scores, retakes

Total: 14 comprehensive FAQs

## File Structure

```
server/prisma/
├── seed.js                              # Main seed orchestrator
├── Seeds/
│   ├── accounts.seed.js                 # User accounts seed
│   ├── modules.seed.js                  # Learning modules seed
│   ├── categories.seed.js               # Module categories seed
│   ├── quizzes-complete.seed.js         # ⭐ Complete quiz set for all 11 modules
│   ├── quizzes.seed.js                  # Old partial quiz seed (3 modules)
│   ├── faqs.seed.js                     # FAQ seed
│   └── README.md                        # Seed system documentation
├── data/
│   ├── accounts.json                    # Account data
│   └── modules/
│       ├── module.json                  # All 11 module definitions
│       ├── images/                      # Module images (1.jpg - 11.jpg)
│       └── videos/                      # Module videos (1.mp4 - 11.mp4)
└── SEED_DOCUMENTATION.md                # This file
```

## How to Run

### Prerequisites
1. Database configured in `.env` file
2. Images in `prisma/data/modules/images/` (1.jpg through 11.jpg)
3. Videos in `prisma/data/modules/videos/` (1.mp4 through 11.mp4)

### Run All Seeds
```bash
cd server
npm run seed
```

This will execute all seeds in order:
1. User Accounts
2. Learning Modules (with images and videos)
3. Module Categories
4. Complete Quizzes (all 11 modules)
5. FAQs

### Run Individual Seeds

```bash
# Accounts only
node prisma/Seeds/accounts.seed.js

# Modules only
node prisma/Seeds/modules.seed.js

# Categories only
node prisma/Seeds/categories.seed.js

# Complete quizzes only
node prisma/Seeds/quizzes-complete.seed.js

# FAQs only
node prisma/Seeds/faqs.seed.js
```

## Seed Behavior

### Skip Existing Data
All seed files check for existing data and skip duplicates:
- Accounts: Checks by email
- Modules: Checks by title
- Categories: Checks by name
- Quizzes: Checks by moduleId + title
- FAQs: Clears and recreates all

### Progress Tracking
Each seed displays:
- ✓ Created items (green)
- ⏭️  Skipped items (yellow)
- ❌ Errors (red)
- Summary statistics

### Animations
Beautiful terminal animations with:
- Spinner animations
- Progress bars
- Color-coded output
- ASCII art banners

## Database Relationships

```
User
├── QuizAttempt (many)
└── StudentModule (many)

Module
├── ModuleObjective (many)
├── ModuleSlide (many)
├── ModuleCategoryModule (many)
├── StudentModule (many)
└── Quiz (many)

ModuleCategory
├── ModuleCategoryModule (many)
└── StudentModule (many)

Quiz
├── QuizQuestion (many)
└── QuizAttempt (many)

QuizQuestion
├── QuizQuestionOption (many)
└── QuizAnswer (many)

QuizAttempt
└── QuizAnswer (many)
```

## Important Notes

### Images and Videos
- Module images must be in JPG/PNG format
- Module videos must be in MP4 format
- Videos are copied to `server/public/videos/` with unique filenames
- Images are stored as binary data in the database

### Points-Based Scoring
Quizzes use a points-based scoring system:
- Different questions can have different point values (1-3 points)
- Score = (Points Earned / Total Points) × 100%
- Passing score is 70% by default
- Example: 7 points earned out of 10 total = 70% (PASS)

### Question Types
1. **MULTIPLE_CHOICE** - One correct answer
2. **TRUE_FALSE** - Boolean question
3. **IDENTIFICATION** - Text input (case-insensitive matching)
4. **MULTIPLE_ANSWER** - Multiple correct options must all be selected

### Student Types and Module Access
- **Type A, A1**: Motorcycle basics (Modules 1-8)
- **Type B, B1, B2, C**: All modules (1-11)
- Categories automatically assign appropriate modules

## Data Integrity

### Foreign Key Relationships
- All relationships use proper foreign keys
- Cascade deletion configured where appropriate
- Module deletion cascades to slides, objectives, and quizzes

### Data Validation
- Email uniqueness enforced
- Enum values validated (Role, StudentType, QuestionType, etc.)
- Required fields enforced by schema

## Troubleshooting

### "Module not found" Error
- Ensure modules are seeded before categories and quizzes
- Run seeds in order: accounts → modules → categories → quizzes

### "Image/Video not found" Error
- Check that files exist in `data/modules/images/` and `data/modules/videos/`
- Verify file naming (1.jpg, 2.jpg, etc.)

### Database Connection Error
- Verify DATABASE_URL in `.env` file
- Ensure MySQL server is running
- Check database credentials

### Duplicate Key Error
- Seeds skip existing data, so this shouldn't occur
- If it does, check unique constraints in schema
- Clear database and re-run: `npm run db:reset`

## Maintenance

### Adding New Modules
1. Add module data to `data/modules/module.json`
2. Add corresponding image to `data/modules/images/`
3. Add corresponding video to `data/modules/videos/`
4. Create quiz data in `quizzes-complete.seed.js`
5. Run seed: `npm run seed`

### Updating Quiz Questions
1. Edit questions in `Seeds/quizzes-complete.seed.js`
2. Delete existing quizzes from database (or they'll be skipped)
3. Re-run: `node prisma/Seeds/quizzes-complete.seed.js`

### Resetting Database
```bash
# Complete reset and reseed
npm run db:reset
npm run seed
```

## Performance

### Seed Time (Approximate)
- User Accounts: ~2 seconds
- Learning Modules: ~15-20 seconds (image/video processing)
- Categories: ~3 seconds
- Complete Quizzes: ~8-10 seconds
- FAQs: ~1 second

**Total**: ~30-40 seconds for complete seed

### Database Size (Approximate)
- User Accounts: ~10 KB
- Modules + Slides: ~50-100 MB (with images/videos)
- Categories: ~1 KB
- Quizzes + Questions + Options: ~20 KB
- FAQs: ~5 KB

**Total**: ~50-100 MB (mostly media files)

## Future Enhancements

### Planned Features
- [ ] Student progress seeding (StudentModule with progress)
- [ ] Quiz attempt history seeding
- [ ] More diverse question types (MATCHING, FILL_BLANK)
- [ ] Multi-language FAQ support
- [ ] Advanced quiz randomization options
- [ ] Question difficulty levels

### Optional Seeds
- Sample quiz attempts with scores
- Student module progress tracking
- Media gallery for additional resources
- Achievement/badge system data

## Support

For issues or questions:
1. Check this documentation
2. Review seed file comments
3. Check console output for specific errors
4. Verify database schema matches Prisma schema

---

**Last Updated**: October 27, 2025
**Version**: 2.0
**Modules**: 11 complete modules with quizzes
**Total Questions**: 56 across all modules
