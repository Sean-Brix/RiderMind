# Quick Start: Running Seeds

## Prerequisites

1. **Database configured** in `.env` file:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/ridermind"
   ```

2. **Required files** in place:
   - Module images: `prisma/data/modules/images/` (1.jpg - 11.jpg)
   - Module videos: `prisma/data/modules/videos/` (1.mp4 - 11.mp4)
   - Account data: `prisma/data/accounts.json`
   - Module data: `prisma/data/modules/module.json`

3. **Database schema** up to date:
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

## Run All Seeds

```bash
cd server
npm run seed
```

This will seed in order:
1. ✅ User Accounts (4 accounts)
2. ✅ Learning Modules (11 modules with images/videos)
3. ✅ Module Categories (6 categories)
4. ✅ Complete Quizzes (11 quizzes, 56 questions)
5. ✅ FAQs (14 FAQs)

**Total time**: ~30-40 seconds

## Run Individual Seeds

```bash
# User accounts
node prisma/Seeds/accounts.seed.js

# Learning modules
node prisma/Seeds/modules.seed.js

# Module categories
node prisma/Seeds/categories.seed.js

# Complete quiz set (all 11 modules)
node prisma/Seeds/quizzes-complete.seed.js

# FAQs
node prisma/Seeds/faqs.seed.js
```

## What You Get

### 👥 User Accounts (4)
- 1 Admin account
- 3 Student accounts with different profiles

### 📚 Learning Modules (11)
Each with:
- Title, description, objectives
- 3 slides (1 image, 1 video, 1 text)
- Position ordering

### 🏷️ Module Categories (6)
- Motorcycle (Basic) - Type A
- Motorcycle (Advanced) - Type A1
- Car & SUV - Type B
- Light Trucks - Type B1
- Heavy Trucks - Type B2
- Professional Driver - Type C

### 📝 Quizzes (11)
- One quiz per module
- 56 total questions
- 110 total points
- Multiple question types
- 70% passing score

### ❓ FAQs (14)
- General (3)
- System (3)
- Module (3)
- Quiz (5)

## Verify Seeding Success

Check the terminal output for:
- ✓ Green checkmarks for created items
- ⏭️ Yellow indicators for skipped items
- Final statistics summary

## Reset and Reseed

To completely reset and reseed the database:

```bash
cd server
npx prisma migrate reset
npm run seed
```

⚠️ **Warning**: This will delete ALL data!

## Troubleshooting

### Module images/videos not found
```
Error: Image file not found for module X
```
**Solution**: Ensure files exist:
- `prisma/data/modules/images/1.jpg` through `11.jpg`
- `prisma/data/modules/videos/1.mp4` through `11.mp4`

### Module not found (for categories/quizzes)
```
⚠️ Module X not found. Skipping...
```
**Solution**: Run module seed first:
```bash
node prisma/Seeds/modules.seed.js
```

### Database connection error
```
Can't reach database server
```
**Solution**: 
1. Check MySQL is running
2. Verify DATABASE_URL in `.env`
3. Test connection: `npx prisma db pull`

## Next Steps

After seeding:

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Login with**:
   - Email: `admin@ridermind.com`
   - Password: `123456`

3. **Test the system**:
   - Browse modules
   - Take quizzes
   - Check progress tracking

## Documentation

- **Full documentation**: `SEED_DOCUMENTATION.md`
- **Seed README**: `Seeds/README.md`
- **Schema reference**: `schema.prisma`

---

**Need help?** Check the documentation files or review console output for specific errors.
