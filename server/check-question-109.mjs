import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkQuestion() {
  try {
    const question = await prisma.quizQuestion.findUnique({
      where: { id: 109 }
    });

    console.log('=== Question 109 ===');
    console.log('Question text:', question.question);
    console.log('VideoPath in DB:', question.videoPath);
    console.log('');

    if (question.videoPath) {
      // Check if file exists
      const fullPath = path.join(__dirname, 'public', question.videoPath);
      console.log('Expected file path:', fullPath);
      console.log('File exists:', fs.existsSync(fullPath));
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log('File size:', stats.size, 'bytes');
      } else {
        console.log('❌ VIDEO FILE MISSING!');
        
        // Check what files DO exist in the directory
        const videoDir = path.join(__dirname, 'public', 'quiz-videos');
        const files = fs.readdirSync(videoDir);
        console.log('');
        console.log('Files in quiz-videos directory:');
        files.forEach(f => console.log('  -', f));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestion();
