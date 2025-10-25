import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add slide to a module
 * Params: moduleId
 * Body: { type, title, content, description, position, imageData, imageMime, videoPath }
 */
export default async function addSlide(req, res) {
  try {
    const { moduleId } = req.params;
    const { type, title, content, description, position, imageData, imageMime, videoPath } = req.body;

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

    // Process image data if present
    let processedImageData = null;
    if (imageData) {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      processedImageData = Buffer.from(base64Data, 'base64');
      console.log('Image data processed:', {
        originalLength: imageData.length,
        base64Length: base64Data.length,
        bufferLength: processedImageData.length,
        imageMime
      });
    }

    // Create slide
    const slide = await prisma.moduleSlide.create({
      data: {
        moduleId: parseInt(moduleId),
        type,
        title: title || '',
        content: content || '',
        description: description || null,
        position: position || 0,
        imageData: processedImageData,
        imageMime: imageMime || null,
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
      message: 'Slide added successfully',
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
