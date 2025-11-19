/**
 * Quick script to check quiz question media in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuizMedia() {
  try {
    console.log('🔍 Checking QuizQuestion media in database...\n');

    const questions = await prisma.quizQuestion.findMany({
      select: {
        id: true,
        question: true,
        imageMime: true,
        videoPath: true,
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`Found ${questions.length} questions total\n`);

    questions.forEach(q => {
      const hasImage = !!q.imageMime;
      const hasVideo = !!q.videoPath;
      
      if (hasImage || hasVideo) {
        console.log(`📋 Question ID ${q.id}: "${q.question}"`);
        console.log(`   Quiz: ${q.quiz.title} (ID: ${q.quiz.id})`);
        if (hasImage) console.log(`   📷 Image: ${q.imageMime}`);
        if (hasVideo) console.log(`   🎬 Video: ${q.videoPath}`);
        console.log('');
      }
    });

    const imageCount = questions.filter(q => q.imageMime).length;
    const videoCount = questions.filter(q => q.videoPath).length;
    
    console.log('📊 Summary:');
    console.log(`   Total questions: ${questions.length}`);
    console.log(`   Questions with images: ${imageCount}`);
    console.log(`   Questions with videos: ${videoCount}`);
    console.log(`   Questions with no media: ${questions.length - imageCount - videoCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuizMedia();
