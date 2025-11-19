import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listSlideIds() {
  console.log('📋 Listing all slides with their IDs...\n');

  try {
    const modules = await prisma.module.findMany({
      include: {
        slides: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    for (const module of modules) {
      console.log(`\n📦 Module ${module.id}: "${module.title}"`);
      console.log(`   Total slides: ${module.slides.length}\n`);

      for (const slide of module.slides) {
        console.log(`   Slide ID: ${slide.id}`);
        console.log(`   Position: ${slide.position}`);
        console.log(`   Title: ${slide.title || 'Untitled'}`);
        console.log(`   Type: ${slide.type}`);
        if (slide.type === 'image') {
          console.log(`   Has Image: ${slide.imageData ? 'YES' : 'NO'}`);
        } else if (slide.type === 'video') {
          console.log(`   Video Path: ${slide.videoPath || 'None'}`);
        }
        console.log('   ---');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listSlideIds();
