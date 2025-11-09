import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import colors from 'colors';

const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 800) {
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r${spinner[spinnerIndex]} ${message}`.cyan);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
    await sleep(100);
  }
  process.stdout.write(`\r✓ ${message}`.green + '\n');
}

const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Isabel', 'Miguel', 'Elena', 'Luis', 'Carmen', 'Ramon', 'Teresa', 'Francisco', 'Luz', 'Antonio', 'Josefa', 'Manuel', 'Sofia'];
const lastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Lopez', 'Gonzales', 'Ramos', 'Rivera', 'Flores', 'Torres', 'Dela Cruz', 'Villanueva', 'Castillo', 'Aquino', 'Soriano', 'Diaz'];
const middleNames = ['Dela', 'San', 'Tan', 'Lee', 'Go', 'Lim', 'Sy', 'Ong', 'Chua', 'Wong', 'Cruz', 'Santos', 'Reyes'];
const nationalities = ['Filipino', 'Filipino', 'Filipino', 'Filipino', 'American', 'Chinese', 'Japanese', 'Korean'];
const civilStatuses = ['Single', 'Married', 'Single', 'Single'];
const studentTypes = ['A', 'A1', 'B', 'B1', 'B2', 'C', 'D'];
const sexes = ['Male', 'Female'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber() {
  return `09${randomInt(10, 99)}${randomInt(1000000, 9999999)}`;
}

function generateEmail(firstName, lastName, index) {
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
  return `${cleanFirst}.${cleanLast}${index}@email.com`;
}

const accountsData = [
  {
    email: 'admin@ridermind.com',
    password: '123456',
    role: 'ADMIN',
    first_name: 'Admin',
    last_name: 'User',
    middle_name: 'System',
    sex: 'Male',
    nationality: 'Filipino',
    civil_status: 'Single',
    birthdate: '1990-01-01',
    telephone_number: '123-4567',
    cellphone_number: '09171234567',
    email_address: 'admin@ridermind.com',
    weight: 70.5,
    height: 175.0,
    blood_type: 'O+',
    eye_color: 'Brown'
  },
  {
    email: 'user@ridermind.com',
    password: '123456',
    role: 'USER',
    first_name: 'Test',
    last_name: 'User',
    middle_name: 'Demo',
    sex: 'Male',
    nationality: 'Filipino',
    civil_status: 'Single',
    birthdate: '1995-05-15',
    cellphone_number: '09187654321',
    email_address: 'user@ridermind.com',
    student_type: 'B',
    weight: 68.0,
    height: 170.0,
    blood_type: 'A+',
    eye_color: 'Brown'
  }
];

// Generate 18 more random users
for (let i = 0; i < 18; i++) {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const sex = randomElement(sexes);
  const year = randomInt(1985, 2000);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  
  accountsData.push({
    email: generateEmail(firstName, lastName, i + 1),
    password: '123456',
    role: 'USER',
    first_name: firstName,
    last_name: lastName,
    middle_name: randomElement(middleNames),
    sex: sex,
    nationality: randomElement(nationalities),
    civil_status: randomElement(civilStatuses),
    birthdate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    cellphone_number: generatePhoneNumber(),
    email_address: generateEmail(firstName, lastName, i + 1),
    student_type: randomElement(studentTypes),
    weight: randomInt(50, 90) + Math.random(),
    height: randomInt(150, 185) + Math.random(),
    blood_type: randomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
    eye_color: randomElement(['Brown', 'Black', 'Hazel', 'Green'])
  });
}

export async function seedAccounts() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  👥 SEEDING USER ACCOUNTS'.bold.magenta);
  console.log('='.repeat(60).rainbow + '\n');

  let successCount = 0;
  let skipCount = 0;

  for (const account of accountsData) {
    const { email, password, birthdate, weight, height, ...userData } = account;
    
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      
      if (existing) {
        console.log(`⏭️  Skipping: ${email}`.yellow);
        skipCount++;
        continue;
      }

      // Animate account creation
      const createMessage = `Creating: ${userData.first_name} ${userData.last_name} (${userData.role})`;
      await animateProgress(createMessage, 400);

      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          birthdate: birthdate ? new Date(birthdate) : null,
          weight: weight || null,
          height: height || null,
          ...userData,
        },
      });

      if (userData.role === 'ADMIN' || email === 'user@ridermind.com') {
        console.log(`   📧 Email: ${email}`.dim);
        console.log(`   🔑 Password: ${password}\n`.dim);
      }
      successCount++;
      
    } catch (error) {
      console.log(`✗ Error creating ${email}: ${error.message}`.red);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Results:`.bold);
  console.log(`   ✓ Created: ${successCount} accounts`.green);
  console.log(`   ⏭️  Skipped: ${skipCount} accounts`.yellow);
  console.log('─'.repeat(60).gray);

  if (successCount > 0) {
    console.log('\n' + '💡 Developer Credentials:'.bold.yellow);
    console.log(`   Admin: email="admin@ridermind.com", password="123456"`.cyan);
    console.log(`   User:  email="user@ridermind.com", password="123456"`.cyan);
  }
  console.log('');

  return { success: successCount, skipped: skipCount };
}

export default seedAccounts;
