# Enhanced Seed System Documentation

## Overview
This enhanced seed system creates a comprehensive database with realistic test data for the RiderMind application.

## What Gets Seeded

### 1. **User Accounts** (20 accounts)
- **Admin Account**: `admin@ridermind.com` / `123456`
- **Test User**: `user@ridermind.com` / `123456`
- **18 Random Users**: Various Filipino names with realistic profile data
  - Complete profile information (names, contact details, addresses)
  - Physical attributes (weight, height, blood type, eye color)
  - Random student types (A, A1, B, B1, B2, C, D)
  - Mixed nationalities and civil statuses

### 2. **FAQs** (21 total, 3-6 per category)
- **General** (4 FAQs): What is RiderMind, getting started, student types, mobile access
- **System** (5 FAQs): Password reset, profile updates, security, access issues
- **Module** (6 FAQs): Module structure, progress tracking, skill levels, feedback, completion time
- **Quiz** (6 FAQs): Quiz mechanics, passing scores, retakes, randomization, results, time limits

### 3. **Learning Modules** (20 modules)
Each module includes:
- **15 Slides Total**:
  - 10 Beginner slides (mix of text, images, videos)
  - 2 Intermediate slides (text and images)
  - 3 Expert slides (text and videos)
- **4 Learning Objectives** per module
- **Complete Descriptions** and metadata

**Module Topics**:
1. Basic Traffic Rules and Regulations
2. Road Signs and Markings
3. Vehicle Pre-Operation Inspection
4. Defensive Driving Techniques
5. Motorcycle Balance and Control
6. Turning and Cornering Techniques
7. Night Driving Safety
8. Weather Conditions and Hazards
9. Emergency Braking Procedures
10. Parking Procedures and Techniques
11. Highway Driving and Merging
12. Intersections and Right-of-Way
13. Vehicle Maintenance Basics
14. Accident Prevention and Response
15. Passenger and Cargo Safety
16. Urban Traffic Navigation
17. Rural and Mountain Road Driving
18. Motorcycle Group Riding
19. Advanced Riding Techniques
20. Environmental Awareness and Eco-Driving

### 4. **Module Categories** (2 categories)
- **Motorcycle Training** (MOTORCYCLE) - Default category
- **Car Training** (CAR)
- All 20 modules assigned to both categories
- **Randomized order** for each category

### 5. **Quizzes** (20 quizzes, one per module)
Each quiz includes:
- **20-25 Questions** (randomized count)
- **Question Types**:
  - Multiple Choice (4 options for text questions)
  - True/False (2 options, used for media questions)
- **Media Questions**: Some questions include images or videos
  - Questions with media only have 2 answer options
- **Time Limits**: Varies from 120 seconds to unlimited (null)
- **Quiz Settings**:
  - 70% passing score
  - Randomized question order option
  - Show results enabled

### 6. **Quiz Attempts** (10-15 per quiz)
Each quiz has 10-15 user attempts with:
- Random users from the user pool
- Scores ranging from 50-100%
- Pass/fail status (70% passing threshold)
- Time spent: 5-30 minutes
- Timestamps within the last week

### 7. **Feedback System**

#### Module Feedback (Comments)
- **5-15 feedback entries per module**
- **Rating Distribution**:
  - 70% positive (4-5 stars)
  - 20% neutral (3 stars)
  - 10% constructive (1-2 stars)
- **Realistic Comments**: Varied feedback messages
- **Like/Dislike**: Based on rating

#### Quiz Question Reactions
- **8-20 reactions per question**
- **Reaction Distribution**:
  - 80% likes (majority as requested)
  - 20% dislikes
- Random users from the user pool

### 8. **Student Modules**
**Not seeded** - Tracking data will be created as users interact with the system

## Running the Seed

### Prerequisites
```bash
# Install dependencies
npm install

# Ensure .env file has DATABASE_URL configured
```

### Commands
```bash
# Run the complete seed
npm run seed

# Or use node directly
node prisma/seed.js
```

### Reset and Reseed
```bash
# Reset database (CAUTION: Deletes all data!)
npm run reset

# Then seed again
npm run seed
```

## Seed Order
The seed runs in this order to maintain referential integrity:

1. **Accounts** - Creates users first
2. **FAQs** - Independent data, can run anytime
3. **Modules** - Creates modules with slides and objectives
4. **Categories** - Creates categories and assigns modules
5. **Quizzes** - Creates quizzes with questions (requires modules)
6. **Feedback** - Creates feedback and reactions (requires modules, users, and quizzes)

## Media Files Used
The seed system uses media files from `prisma/data/modules/`:

### Images (11 files)
- 1.jpg, 2.jpeg, 3.jpg, 4.jpeg, 5.jpeg
- 6.jpeg, 7.jpeg, 8.jpeg, 9.jpg, 10.jpeg, 11.jpeg

### Videos (11 files)
- 1.mp4 through 11.mp4

These files are randomly assigned to:
- Module slides (images and videos)
- Quiz questions (images and videos for some questions)

## Development Notes

### Customization
To modify the seed data:
- **Accounts**: Edit `Seeds/accounts.seed.js`
- **FAQs**: Edit `Seeds/faqs.seed.js`
- **Modules**: Edit `Seeds/modules-enhanced.seed.js`
- **Categories**: Edit `Seeds/categories.seed.js`
- **Quizzes**: Edit `Seeds/quizzes-enhanced.seed.js`
- **Feedback**: Edit `Seeds/feedback.seed.js`

### Adding More Data
To increase the number of items:
1. Adjust the loop counters in respective seed files
2. Add more templates/data sources as needed
3. Ensure sufficient user accounts for realistic distribution

### Performance
- The complete seed takes approximately 2-5 minutes
- Progress indicators show real-time status
- Skip logic prevents duplicate entries on re-run

## Troubleshooting

### Database Connection Error
```bash
# Check your DATABASE_URL in .env
# Ensure MySQL is running
```

### Duplicate Entry Errors
```bash
# The seed is designed to skip existing entries
# To start fresh, run: npm run reset
```

### Media File Warnings
```bash
# If images/videos are missing, the seed continues
# Slides/questions are created without media
# Check: prisma/data/modules/ folder
```

## Production Considerations

⚠️ **IMPORTANT**: This seed is for development/testing only!

Before deploying to production:
1. Remove or limit the number of test accounts
2. Keep only admin and necessary test users
3. Remove or anonymize realistic-looking test data
4. Use production-appropriate media files
5. Consider seeding only structural data (categories, base modules)
6. Let real users generate feedback and quiz attempts

## Summary Statistics (After Full Seed)

- **20** User Accounts (1 admin, 1 test user, 18 random)
- **21** FAQ Entries (distributed across 4 categories)
- **20** Learning Modules
- **300** Module Slides (20 modules × 15 slides)
- **80** Module Objectives (20 modules × 4 objectives)
- **2** Module Categories
- **40** Category-Module Assignments (2 categories × 20 modules)
- **20** Quizzes (1 per module)
- **~450** Quiz Questions (20-25 per quiz)
- **~900** Quiz Question Options (2-4 per question)
- **200-300** Quiz Attempts (10-15 per quiz)
- **100-300** Module Feedback Comments (5-15 per module)
- **3,600-9,000** Quiz Question Reactions (8-20 per question)

**Total Records**: ~5,500-10,500 database records

---

Created: November 2025
Last Updated: November 2025
Version: 2.0 (Enhanced)
