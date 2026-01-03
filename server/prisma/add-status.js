import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addStatusColumn() {
  try {
    // Run raw SQL to add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE student_modules ADD COLUMN status ENUM('ONGOING', 'COMPLETED') NOT NULL DEFAULT 'ONGOING'
    `);
    console.log('✓ Added status column');
    
    // Create index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX student_modules_status_idx ON student_modules(status)
    `);
    console.log('✓ Created index on status column');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✓ Status column already exists');
    } else if (error.message.includes('Duplicate key name')) {
      console.log('✓ Index already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addStatusColumn();
