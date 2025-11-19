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
    const { title, description, isActive, position } = req.body;

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
