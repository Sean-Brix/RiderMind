import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function removeUniqueConstraint() {
  try {
    // Drop the unique constraint
    await prisma.$executeRawUnsafe(`
      ALTER TABLE student_modules DROP INDEX student_modules_userId_categoryId_moduleId_key
    `);
    console.log('✓ Removed unique constraint on (userId, categoryId, moduleId)');
    
    // Create composite index for better query performance
    await prisma.$executeRawUnsafe(`
      CREATE INDEX student_modules_userId_status_idx ON student_modules(userId, status)
    `);
    console.log('✓ Created index on (userId, status)');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    if (error.message.includes("check that it exists")) {
      console.log('✓ Unique constraint already removed');
    } else if (error.message.includes('Duplicate key name')) {
      console.log('✓ Index already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

removeUniqueConstraint();
