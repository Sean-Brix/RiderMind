import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuizVideos() {
  try {
    const questions = await prisma.question.findMany({
      take: 5,
      select: {
        id: true,
        question: true,
        videoUrl: true,
        videoPath: true
      }
    });

    console.log('\n🔍 Checking Quiz Question Videos:\n');
    console.log(JSON.stringify(questions, null, 2));

    const withVideos = questions.filter(q => q.videoUrl || q.videoPath);
    console.log(`\n✅ ${withVideos.length} / ${questions.length} questions have video data\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuizVideos();
