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

    // Check if module exists and get associated videos
    const module = await prisma.module.findUnique({
      where: { id: parseInt(id) },
      include: {
        slides: {
          where: {
            type: 'video',
            videoPath: { not: null }
          },
          select: { videoPath: true }
        }
      }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
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
