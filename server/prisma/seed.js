import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();
const prisma = new PrismaClient();

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load accounts from JSON file
const accountsPath = join(__dirname, 'data', 'accounts.json');
const accountsData = JSON.parse(readFileSync(accountsPath, 'utf-8'));

async function main() {
  console.log('Starting seed process...\n');

  for (const account of accountsData) {
    const { email, password, birthdate, ...userData } = account;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          birthdate: birthdate ? new Date(birthdate) : null,
          ...userData,
        },
      });
      console.log(`✓ Created ${userData.role}: ${email} (${userData.first_name} ${userData.last_name})`);
    } else {
      console.log(`- Already exists: ${email}`);
    }
  }

  console.log('\n✓ Seed completed successfully!');
  console.log(`\nDeveloper Credentials:`);
  console.log(`  Admin: username="admin", password="123456"`);
  console.log(`  User:  username="user", password="123456"`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
