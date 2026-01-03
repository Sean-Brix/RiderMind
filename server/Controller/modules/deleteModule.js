import { PrismaClient } from '@prisma/client';
import { deleteVideoFile } from '../../utils/videoHandler.js';

const prisma = new PrismaClient();

/**
 * Delete a module and all associated data
 * Params: id
 */
export default async function deleteModule(req, res) {
  try {
    const { id } = req.params;

    // Check if module exists and get associated videos and category assignments
    const module = await prisma.module.findUnique({
      where: { id: parseInt(id) },
      include: {
        slides: {
          where: {
            type: 'video',
            videoPath: { not: null }
          },
          select: { videoPath: true }
        },
        categoryModules: {
          include: {
            category: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Check if module is assigned to any categories
    if (module.categoryModules && module.categoryModules.length > 0) {
      const categoryNames = module.categoryModules.map(cm => cm.category.name).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Cannot delete module that is assigned to categories',
        message: `This module is currently assigned to the following categories: ${categoryNames}. Please remove it from these categories before deleting.`
      });
    }

    // Delete associated video files
    if (module.slides && module.slides.length > 0) {
      module.slides.forEach(slide => {
        if (slide.videoPath) {
          try {
            deleteVideoFile(slide.videoPath);
          } catch (error) {
            console.error(`Failed to delete video: ${slide.videoPath}`, error);
          }
        }
      });
    }

    // Delete module (cascade will delete objectives and slides)
    await prisma.module.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete module',
      message: error.message
    });
  }
}
