import { PrismaClient } from '@prisma/client';
import { deleteVideoFile } from '../../utils/videoHandler.js';

const prisma = new PrismaClient();

/**
 * Update a slide
 * Params: slideId
 * Body: { type, title, content, description, position, skillLevel, videoPath }
 * Note: Use POST /slides/:slideId/image for image uploads (FormData)
 */
export default async function updateSlide(req, res) {
  try {
    const { slideId } = req.params;
    const { type, title, content, description, position, skillLevel, videoPath } = req.body;

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

    // Build update data
    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (description !== undefined) updateData.description = description;
    if (position !== undefined) updateData.position = position;
    if (skillLevel !== undefined) updateData.skillLevel = skillLevel;
    
    // Handle video replacement
    if (videoPath !== undefined) {
      // Delete old video if exists and is being replaced
      if (existing.videoPath && existing.videoPath !== videoPath) {
        try {
          deleteVideoFile(existing.videoPath);
        } catch (error) {
          console.error(`Failed to delete old video: ${existing.videoPath}`, error);
        }
      }
      updateData.videoPath = videoPath;
    }

    // Update slide
    const slide = await prisma.moduleSlide.update({
      where: { id: parseInt(slideId) },
      data: updateData,
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        description: true,
        position: true,
        skillLevel: true,
        videoPath: true,
        imageMime: true,
        imageData: false,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Slide updated successfully',
      data: slide
    });

  } catch (error) {
    console.error('Error updating slide:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update slide',
      message: error.message
    });
  }
}
