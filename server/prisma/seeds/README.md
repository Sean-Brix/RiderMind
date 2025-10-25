# 🌱 RiderMind Database Seeding System

A modular and animated database seeding system for RiderMind.

## 📁 Structure

```
prisma/
├── seed.js                      # Main seed orchestrator
└── seeds/
    ├── accounts.seed.js         # User accounts seeder
    └── modules.seed.js          # Learning modules seeder (11 modules)
```

## 🚀 Usage

Run all seeds with animations:

```bash
npm run fill
```

This will seed:
- ✅ **4 User Accounts** (Admin and test users)
- ✅ **11 Learning Modules** with objectives and slides

## 📚 Seeded Modules

1. **Introduction to Road Safety** - Fundamental principles and defensive driving
2. **Traffic Rules and Regulations** - Philippine traffic laws
3. **Vehicle Safety and Maintenance** - Pre-ride inspections and maintenance
4. **Motorcycle Safety Fundamentals** - Specialized motorcycle training
5. **Road Signs and Markings** - Complete guide to traffic signs
6. **Weather and Night Riding** - Adverse conditions handling
7. **Emergency Situations and Accident Response** - Emergency procedures
8. **Defensive Driving Advanced Techniques** - SIPDE and awareness
9. **Alcohol, Drugs, and Impaired Driving** - DUI dangers and consequences
10. **Sharing the Road** - Interaction with other road users
11. **Environmental and Eco-Friendly Riding** - Sustainable riding practices

Each module includes:
- 📝 4 learning objectives
- 📄 3 content slides
- 🔢 Proper positioning and ordering

## 👥 Default Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@ridermind.com | 123456 | ADMIN | Admin User |
| user@ridermind.com | 123456 | USER | Test User |
| john.doe@email.com | 123456 | USER | John Doe |
| jane.santos@email.com | 123456 | USER | Jane Santos |

## ✨ Features

- 🎨 **Colorful Terminal Output** - Using the `colors` package
- ⏳ **Animated Progress** - Spinner animations during seeding
- 📊 **Statistics** - Summary of created/skipped records
- 🔄 **Idempotent** - Safe to run multiple times (skips existing records)
- 🧩 **Modular** - Each seed type in separate file
- 🎯 **Type-Safe** - Uses Prisma Client for database operations

## 🛠️ Adding New Seeds

1. Create a new seed file in `prisma/seeds/`:

```javascript
import { PrismaClient } from '@prisma/client';
import colors from 'colors';

const prisma = new PrismaClient();

export async function seedYourData() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  🎯 SEEDING YOUR DATA'.bold.cyan);
  console.log('='.repeat(60).rainbow + '\n');

  // Your seeding logic here

  return { success: 0, skipped: 0 };
}

export default seedYourData;
```

2. Import and add to `seed.js`:

```javascript
import seedYourData from './seeds/yourdata.seed.js';

const seedFunctions = [
  { name: 'User Accounts', fn: seedAccounts, emoji: '👥' },
  { name: 'Learning Modules', fn: seedModules, emoji: '📚' },
  { name: 'Your Data', fn: seedYourData, emoji: '🎯' }  // Add here
];
```

3. Run: `npm run fill`

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

**Problem:** Seeds not running
- Ensure database connection is configured in `.env`
- Check `DATABASE_URL` is set correctly
- Run `npx prisma generate` first

**Problem:** Duplicate key errors
- Seeds are idempotent - they skip existing records
- Check unique constraints in schema

**Problem:** Import errors
- Ensure `"type": "module"` is in `package.json`
- Use `.js` extension in imports

## 📝 Notes

- All seeds check for existing records before creating
- Timestamps are automatically generated
- Positions are auto-assigned for ordering
- Password hashing uses bcrypt with 10 rounds
- Database connection auto-closes after completion

---

Made with 💙 for RiderMind
