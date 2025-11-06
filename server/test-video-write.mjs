import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUIZ_VIDEO_DIR = path.join(__dirname, 'public', 'quiz-videos');

console.log('Quiz video directory:', QUIZ_VIDEO_DIR);
console.log('Directory exists:', fs.existsSync(QUIZ_VIDEO_DIR));

// Try to write a test file
const testFile = path.join(QUIZ_VIDEO_DIR, 'test.txt');
try {
  fs.writeFileSync(testFile, 'test content');
  console.log('✅ Successfully wrote test file');
  
  // Read it back
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ Successfully read test file:', content);
  
  // Delete it
  fs.unlinkSync(testFile);
  console.log('✅ Successfully deleted test file');
  
  console.log('\n✅ Directory is writable!');
} catch (error) {
  console.error('❌ Error:', error.message);
}
