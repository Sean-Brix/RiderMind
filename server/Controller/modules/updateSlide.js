import { PrismaClient } from '@prisma/client';
import { deleteVideoFile } from '../../utils/videoHandler.js';

const prisma = new PrismaClient();

/**
 * Update a slide
 * Params: slideId
 * Body: { type, title, content, description, position, imageData, imageMime, videoPath }
 */
export default async function updateSlide(req, res) {
  try {
    const { slideId } = req.params;
    const { type, title, content, description, position, imageData, imageMime, videoPath } = req.body;

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
    
    // Process image data if present
    if (imageData !== undefined) {
      if (imageData) {
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        updateData.imageData = Buffer.from(base64Data, 'base64');
      } else {
        updateData.imageData = null;
      }
    }
    
    if (imageMime !== undefined) updateData.imageMime = imageMime;
    
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
