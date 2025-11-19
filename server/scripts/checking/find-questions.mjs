/**
 * Find which quiz contains questions 5, 6, 7
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findQuestions() {
  try {
    const questionIds = [5, 6, 7, 67, 68, 69];
    
    console.log('🔍 Looking for questions:', questionIds, '\n');

    for (const id of questionIds) {
      const question = await prisma.quizQuestion.findUnique({
        where: { id },
        include: {
          quiz: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      if (question) {
        console.log(`📋 Question ID ${id}:`);
        console.log(`   Text: "${question.question}"`);
        console.log(`   Quiz: ${question.quiz.title} (ID: ${question.quiz.id})`);
        console.log(`   📷 Image: ${question.imageMime || 'NONE'}`);
        console.log(`   🎬 Video: ${question.videoPath || 'NONE'}`);
        console.log('');
      } else {
        console.log(`❌ Question ID ${id} not found\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findQuestions();
