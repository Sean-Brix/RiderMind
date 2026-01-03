import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_NAME = '20260103022521_v1';
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', MIGRATION_NAME, 'migration.sql');

function sha256Hex(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const prisma = new PrismaClient();
try {
  const fileBuffer = fs.readFileSync(migrationPath);
  const fileHashHex = sha256Hex(fileBuffer);

  const rows = await prisma.$queryRawUnsafe(
    `SELECT migration_name, checksum FROM _prisma_migrations WHERE migration_name = '${MIGRATION_NAME}' LIMIT 1;`
  );

  console.log('Migration:', MIGRATION_NAME);
  console.log('File hash (sha256 hex):', fileHashHex);
  console.log('DB row:', rows[0] ?? null);

  if (rows[0]?.checksum) {
    console.log('DB checksum matches file?:', rows[0].checksum.toLowerCase() === fileHashHex.toLowerCase());
  }
} finally {
  await prisma.$disconnect();
}
