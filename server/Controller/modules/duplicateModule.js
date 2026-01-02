import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Duplicate a module with all its objectives and slides
 * Creates a copy with " (Copy)" appended to the title
 */
export default async function duplicateModule(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // From auth middleware

    // Fetch the original module with all relations
    const originalModule = await prisma.module.findUnique({
      where: { id: parseInt(id) },
      include: {
        objectives: {
          orderBy: { position: 'asc' }
        },
        slides: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!originalModule) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Create the duplicate module with all relations in a transaction
    const duplicatedModule = await prisma.$transaction(async (tx) => {
      // Create the new module
      const newModule = await tx.module.create({
        data: {
          title: `${originalModule.title} (Copy)`,
          description: originalModule.description,
          isActive: false, // Duplicates start as inactive
          position: originalModule.position,
          createdBy: userId,
          updatedBy: userId,
          // Create objectives
          objectives: {
            create: originalModule.objectives.map(obj => ({
              objective: obj.objective,
              position: obj.position
            }))
          },
          // Create slides
          slides: {
            create: originalModule.slides.map(slide => ({
              type: slide.type,
              title: slide.title,
              content: slide.content,
              description: slide.description,
              position: slide.position,
              skillLevel: slide.skillLevel,
              imageUrl: slide.imageUrl,
              imagePath: slide.imagePath,
              imageMime: slide.imageMime,
              videoUrl: slide.videoUrl,
              videoPath: slide.videoPath
            }))
          }
        },
        include: {
          objectives: {
            orderBy: { position: 'asc' }
          },
          slides: {
            orderBy: { position: 'asc' }
          }
        }
      });

      return newModule;
    });

    res.status(201).json({
      success: true,
      data: duplicatedModule,
      message: 'Module duplicated successfully'
    });

  } catch (error) {
    console.error('Error duplicating module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate module',
      message: error.message
    });
  }
}
