import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSlide() {
  try {
    const slide = await prisma.moduleSlide.findUnique({
      where: { id: 657 }
    });
    
    console.log('\n=== SLIDE 657 ===');
    console.log(JSON.stringify(slide, null, 2));
    
    // Also check a few video slides from seed
    console.log('\n=== ALL VIDEO SLIDES ===');
    const videoSlides = await prisma.moduleSlide.findMany({
      where: { type: 'video' },
      take: 5,
      select: {
        id: true,
        type: true,
        videoPath: true,
        title: true
      }
    });
    
    videoSlides.forEach(s => {
      console.log(`ID ${s.id}: ${s.title}`);
      console.log(`  videoPath: ${s.videoPath}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSlide();
