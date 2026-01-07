# 🌱 RiderMind Comprehensive Seed System

## Overview

This comprehensive seed system creates a complete, realistic database for the RiderMind application with:

- **24 User Accounts** (1 Admin + 23 Students)
- **8 Learning Modules** with animations from Firebase
- **2 Categories** (Motorcycle & Car Training)
- **8 Quizzes** (10 questions each)
- **22 FAQs** (across 4 categories)
- **Student Enrollments** with realistic quiz attempts
- **Module Feedback** from users

## Files

- `comprehensive-seed.js` - Part 1: Clear DB, Accounts, Modules
- `comprehensive-seed-part2.js` - Part 2: Categories, Quizzes
- `comprehensive-seed-runner.js` - Part 3: FAQs, Student Modules, Feedback & Main Runner

## Prerequisites

### Firebase Storage Setup

Your Firebase Storage should have the following structure:

```
animation-seed/
├── module/
│   ├── Module 1.mp4
│   ├── Module 2.mp4
│   ├── Module 3.mp4
│   ├── Module 4.mp4
│   ├── Module 5.mp4
│   ├── Module 6.mp4
│   ├── Module 7.mp4
│   └── Module 8.mp4
└── quiz/
    ├── quiz-1.mp4
    ├── quiz-2.mp4
    ├── ... (at least 20 quiz animations)
    └── quiz-20.mp4
```

### Update Firebase URLs

In `comprehensive-seed.js` and `comprehensive-seed-part2.js`, update the Firebase project ID:

```javascript
// Replace "ridermind-projekt" with your actual Firebase project ID
https://firebasestorage.googleapis.com/v0/b/YOUR-PROJECT-ID.firebasestorage.app/o/...
```

## Usage

### Run the Comprehensive Seed

```bash
cd server
node prisma/comprehensive-seed-runner.js
```

This will:
1. ✅ Clear all existing data
2. ✅ Seed 24 user accounts
3. ✅ Create 8 modules with slides
4. ✅ Create 2 categories
5. ✅ Generate quizzes with questions
6. ✅ Add FAQs
7. ✅ Create student enrollments
8. ✅ Generate feedback

### Test Accounts

**Admin Account:**
- Email: `admin@ridermind.com`
- Password: `123456`

**User Accounts:**
- Email: `juan.santos1@email.com` through `sofia.martinez23@email.com`
- Password: `123456` (all users)

## Module Structure

Each of the 8 modules follows this structure:

1. **Introduction Slide** (Text) - Welcome and overview
2. **Animation Slide** (Video) - Module-specific animation from Firebase
3. **Content Slides (8)** - Educational content

**Total: 10 slides per module**

### Module 1 Content

Module 1 contains specific content about:
- Road Markings (Broken/Solid White Lines, Yellow Lines, etc.)
- Traffic Lights (Red, Yellow, Green)
- Stop Lines and Crossings

### Modules 2-8

- Module 2: Road Courtesy and Discipline
- Module 3: Traffic Rules and Signs
- Module 4: Driver Responsibilities
- Module 5: Vehicle Familiarization
- Module 6: Driving Fundamentals
- Module 7: Defensive Driving
- Module 8: Emergencies and Accidents

## Quiz Questions

Each module has exactly **10 questions**:
- Multiple Choice questions
- True/False questions
- Identification questions

All questions use random animations from the `animation-seed/quiz/` folder.

**Passing Score:** 75%

## Student Module Enrollments

The seed creates **5 sample student enrollments** with:
- Realistic quiz attempts (1-3 attempts per module)
- Varied scores (65-98%)
- Different passing rates for analytics
- Completion dates over the past 1-45 days

This provides data for:
- Leaderboard rankings
- Progress analytics
- Performance tracking

## FAQ Categories

FAQs are distributed across 4 categories:

- **General** (5 FAQs) - About RiderMind, getting started
- **System** (5 FAQs) - Account, passwords, profile
- **Module** (6 FAQs) - Learning modules, progress
- **Quiz** (6 FAQs) - Quiz system, scoring, retakes

## Feedback System

Each module receives **2-3 feedback entries** with:
- Ratings (1-5 stars)
- Comments (80% positive, 20% constructive)
- Likes/dislikes

## Customization

### Adjust Number of Users

In `comprehensive-seed.js`, change:

```javascript
// Generate 23 more users (total 24 including admin)
for (let i = 0; i < 23; i++) {
  // Change 23 to desired number
}
```

### Modify Feedback Count

In `comprehensive-seed-runner.js`:

```javascript
const feedbackCount = randomInt(2, 3); // Change range
```

### Change Passing Score

In `comprehensive-seed-part2.js`:

```javascript
passingScore: 75, // Change to desired percentage
```

## Troubleshooting

### "No modules found" Error

Make sure modules are seeded before categories and quizzes.

### Firebase URL Errors

1. Verify your Firebase project ID is correct
2. Ensure files are uploaded to the correct paths
3. Check that files have public read permissions

### Import Errors

Ensure you're using Node.js with ES modules support:

```json
// package.json
{
  "type": "module"
}
```

## Database Schema

The seed populates these tables:
- User
- Module
- ModuleSlide
- ModuleObjective
- ModuleCategory
- ModuleCategoryModule
- Quiz
- QuizQuestion
- QuizQuestionOption
- QuizAttempt
- QuizAnswer
- StudentModule
- FAQ
- ModuleFeedback

## Notes

- All passwords are hashed with bcrypt
- Dates are randomized for realism
- Quiz attempts have realistic time spent
- Progress tracking is complete (100%)
- All data is interconnected and relational

## Next Steps

After seeding:

1. Start your server: `npm run dev`
2. Test login with admin account
3. Check dashboard for modules
4. Test quiz functionality
5. Review leaderboard with sample data

---

Created for RiderMind Driver Education Platform
Last Updated: January 2026
