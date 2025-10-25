import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add slide to a module
 * Params: moduleId
 * Body: { type, title, content, description, position, videoPath }
 * Note: Use POST /slides/:slideId/image for image uploads (FormData) after creating the slide
 */
export default async function addSlide(req, res) {
  try {
    const { moduleId } = req.params;
    const { type, title, content, description, position, videoPath } = req.body;

    // Validation
    if (!type || !['text', 'image', 'video'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Valid slide type is required (text, image, or video)'
      });
    }

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Create slide (image will be uploaded separately via FormData)
    const slide = await prisma.moduleSlide.create({
      data: {
        moduleId: parseInt(moduleId),
        type,
        title: title || '',
        content: content || '',
        description: description || null,
        position: position || 0,
        videoPath: videoPath || null
      },
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

    res.status(201).json({
      success: true,
      message: 'Slide added successfully. Upload image via POST /slides/:slideId/image if needed.',
      data: slide
    });

  } catch (error) {
    console.error('Error adding slide:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add slide',
      message: error.message
    });
  }
}
