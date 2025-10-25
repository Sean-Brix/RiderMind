import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMissingImages() {
  console.log('🔍 Checking for slides with missing images...\n');

  try {
    // Get all image-type slides
    const imageSlides = await prisma.moduleSlide.findMany({
      where: {
        type: 'image'
      },
      select: {
        id: true,
        title: true,
        moduleId: true,
        position: true,
        imageData: true,
        imageMime: true,
      },
      orderBy: [
        { moduleId: 'asc' },
        { position: 'asc' }
      ]
    });

    console.log(`📊 Total image slides: ${imageSlides.length}\n`);

    // Check for missing images
    const slidesWithImages = imageSlides.filter(slide => slide.imageData);
    const slidesWithoutImages = imageSlides.filter(slide => !slide.imageData);

    console.log(`✅ Slides with images: ${slidesWithImages.length}`);
    console.log(`❌ Slides without images: ${slidesWithoutImages.length}\n`);

    if (slidesWithoutImages.length > 0) {
      console.log('🚨 Missing Images:\n');
      for (const slide of slidesWithoutImages) {
        console.log(`  Slide ID: ${slide.id}`);
        console.log(`  Title: ${slide.title || 'Untitled'}`);
        console.log(`  Module ID: ${slide.moduleId}`);
        console.log(`  Position: ${slide.position}`);
        console.log(`  MIME Type: ${slide.imageMime || 'Not set'}`);
        console.log('  ---');
      }
    }

    // Get module info for slides without images
    if (slidesWithoutImages.length > 0) {
      console.log('\n📝 Affected Modules:\n');
      const moduleIds = [...new Set(slidesWithoutImages.map(s => s.moduleId))];
      
      for (const moduleId of moduleIds) {
        const module = await prisma.module.findUnique({
          where: { id: moduleId },
          select: {
            id: true,
            title: true,
            _count: {
              select: { slides: true }
            }
          }
        });

        const missingCount = slidesWithoutImages.filter(s => s.moduleId === moduleId).length;
        console.log(`  Module ${module.id}: "${module.title}"`);
        console.log(`  Total slides: ${module._count.slides}`);
        console.log(`  Missing images: ${missingCount}`);
        console.log('  ---');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingImages();
