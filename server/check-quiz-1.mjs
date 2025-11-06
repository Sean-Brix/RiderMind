/**
 * Check all questions in Quiz ID 1
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuiz1() {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: 1 },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            question: true,
            position: true,
            imageMime: true,
            videoPath: true
          }
        }
      }
    });

    if (!quiz) {
      console.log('❌ Quiz ID 1 not found');
      return;
    }

    console.log(`📚 Quiz: ${quiz.title} (ID: ${quiz.id})`);
    console.log(`   Total questions: ${quiz.questions.length}\n`);

    quiz.questions.forEach((q, index) => {
      console.log(`${index + 1}. Question ID ${q.id} (Position: ${q.position})`);
      console.log(`   Text: "${q.question}"`);
      console.log(`   📷 Image: ${q.imageMime || 'NONE'}`);
      console.log(`   🎬 Video: ${q.videoPath || 'NONE'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuiz1();
