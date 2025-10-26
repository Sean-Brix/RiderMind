import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update student's module progress
 * PUT /api/student-modules/:moduleId/progress
 * Body: { currentSlideId, progress }
 */
export default async function updateProgress(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { currentSlideId, progress, categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'categoryId is required'
      });
    }

    // Find the student module record
    const studentModule = await prisma.studentModule.findFirst({
      where: {
        userId,
        moduleId: parseInt(moduleId),
        categoryId: parseInt(categoryId)
      }
    });

    if (!studentModule) {
      return res.status(404).json({
        success: false,
        error: 'Student module not found'
      });
    }

    // Update progress
    const updateData = {};
    
    if (currentSlideId !== undefined) {
      updateData.currentSlideId = currentSlideId;
    }
    
    if (progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, parseFloat(progress)));
    }

    // Set startedAt if not already set
    if (!studentModule.startedAt) {
      updateData.startedAt = new Date();
    }

    const updated = await prisma.studentModule.update({
      where: { id: studentModule.id },
      data: updateData,
      include: {
        module: {
          include: {
            objectives: true,
            slides: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                type: true,
                title: true,
                description: true,
                position: true,
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress',
      message: error.message
    });
  }
}
