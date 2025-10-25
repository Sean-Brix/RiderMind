import { PrismaClient } from '@prisma/client';
import { deleteVideoFile } from '../../utils/videoHandler.js';

const prisma = new PrismaClient();

/**
 * Delete a slide
 * Params: slideId
 */
export default async function deleteSlide(req, res) {
  try {
    const { slideId } = req.params;

    // Check if slide exists
    const existing = await prisma.moduleSlide.findUnique({
      where: { id: parseInt(slideId) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Slide not found'
      });
    }

    // Delete associated video file if exists
    if (existing.type === 'video' && existing.videoPath) {
      try {
        deleteVideoFile(existing.videoPath);
      } catch (error) {
        console.error(`Failed to delete video: ${existing.videoPath}`, error);
      }
    }

    // Delete slide
    await prisma.moduleSlide.delete({
      where: { id: parseInt(slideId) }
    });

    res.status(200).json({
      success: true,
      message: 'Slide deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting slide:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete slide',
      message: error.message
    });
  }
}
