import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVideoPaths() {
  try {
    const questions = await prisma.quizQuestion.findMany({
      where: {
        videoPath: { not: null }
      },
      select: {
        id: true,
        question: true,
        videoPath: true
      }
    });

    console.log('=== Questions with Videos ===');
    console.log('Total:', questions.length);
    console.log('');
    
    questions.forEach(q => {
      console.log(`Question ID: ${q.id}`);
      console.log(`Question: ${q.question}`);
      console.log(`VideoPath: ${q.videoPath}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideoPaths();
