import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update a module
 * Params: id
 * Body: { title, description, isActive, position }
 */
export default async function updateModule(req, res) {
  try {
    const { id } = req.params;
    const { title, description, isActive, position, objectives, slides } = req.body;

    // Check if module exists
    const existing = await prisma.module.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Check for duplicate title (if changing title)
    if (title && title !== existing.title) {
      const duplicate = await prisma.module.findFirst({
        where: { 
          title,
          id: { not: parseInt(id) }
        }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Module with this title already exists'
        });
      }
    }

    // Build update data
    const updateData = {
      updatedBy: req.user?.id || null
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (position !== undefined) updateData.position = position;

    // Handle objectives update
    if (objectives && Array.isArray(objectives)) {
      // Delete existing objectives and create new ones
      updateData.objectives = {
        deleteMany: {},
        create: objectives.map((obj, index) => ({
          objective: typeof obj === 'string' ? obj : obj.objective,
          position: obj.position || index + 1
        }))
      };
    }

    // Handle slides update
    if (slides && Array.isArray(slides)) {
      // Get existing slide IDs
      const existingSlides = await prisma.moduleSlide.findMany({
        where: { moduleId: parseInt(id) },
        select: { id: true }
      });
      const existingSlideIds = existingSlides.map(s => s.id);

      // Separate slides into create and update
      const slidesToCreate = slides.filter(slide => !slide.id);
      const slidesToUpdate = slides.filter(slide => slide.id && existingSlideIds.includes(slide.id));
      const slideIdsToKeep = slidesToUpdate.map(s => s.id);
      
      // Delete slides that are no longer in the list
      const slideIdsToDelete = existingSlideIds.filter(id => !slideIdsToKeep.includes(id));

      updateData.slides = {
        deleteMany: slideIdsToDelete.length > 0 ? {
          id: { in: slideIdsToDelete }
        } : undefined,
        create: slidesToCreate.map((slide, index) => ({
          type: slide.type || 'text',
          title: slide.title,
          content: slide.content || '',
          description: slide.description || null,
          skillLevel: slide.skillLevel || 'Beginner',
          position: slide.position || index + 1,
          imageUrl: slide.imageUrl || null,
          imagePath: slide.imagePath || null,
          imageMime: slide.imageMime || null,
          videoUrl: slide.videoUrl || null,
          videoPath: slide.videoPath || null
        })),
        updateMany: slidesToUpdate.map(slide => ({
          where: { id: slide.id },
          data: {
            type: slide.type || 'text',
            title: slide.title,
            content: slide.content || '',
            description: slide.description || null,
            skillLevel: slide.skillLevel || 'Beginner',
            position: slide.position,
            imageUrl: slide.imageUrl || null,
            videoUrl: slide.videoUrl || null
          }
        }))
      };
    }

    // Update module
    const module = await prisma.module.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        objectives: {
          orderBy: { position: 'asc' }
        },
        slides: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            description: true,
            position: true,
            skillLevel: true,
            imageUrl: true,
            imagePath: true,
            imageMime: true,
            videoUrl: true,
            videoPath: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: module
    });

  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update module',
      message: error.message
    });
  }
}
