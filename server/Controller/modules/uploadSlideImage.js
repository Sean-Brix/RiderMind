import { PrismaClient } from '@prisma/client';
import { validateImage } from '../../utils/imageHandler.js';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/firebase.js';
import { clearFileCache } from '../../utils/firebaseCache.js';

const prisma = new PrismaClient();

/**
 * Upload image to a slide using FormData (Firebase Storage)
 * Uses multer middleware to handle image upload
 * Params: slideId
 * Files: image (from multer)
 */
export default async function uploadSlideImage(req, res) {
  try {
    const { slideId } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    // Validate the uploaded file
    try {
      validateImage(req.file);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message
      });
    }

    // Check if slide exists
    const slide = await prisma.moduleSlide.findUnique({
      where: { id: parseInt(slideId) }
    });

    if (!slide) {
      return res.status(404).json({
        success: false,
        error: 'Slide not found'
      });
    }

    // Get image buffer from multer (memory storage)
    const imageBuffer = req.file.buffer;
    const imageMime = req.file.mimetype;

    console.log('Uploading image to slide (to Firebase):', {
      slideId,
      imageMime,
      size: imageBuffer.length,
      originalName: req.file.originalname
    });

    // Build a storage path: modules/{moduleId}/slides/{slideId}/{timestamp}-{filename}
    const filename = generateUniqueFilename(req.file.originalname);
    const storagePath = `modules/${slide.moduleId || 'unknown'}/slides/${slideId}/${filename}`;

    // Upload to Firebase
    const result = await uploadFile(imageBuffer, storagePath, imageMime);

    // Clear any cached URL for previous path
    if (slide.imagePath) clearFileCache(slide.imagePath);

    // Update slide with cloud references
    const updatedSlide = await prisma.moduleSlide.update({
      where: { id: parseInt(slideId) },
      data: {
        imageUrl: result.url,
        imagePath: result.path,
        imageMime: imageMime,
        type: 'image'
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        description: true,
        position: true,
        imageMime: true,
        imageUrl: true,
        imagePath: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: updatedSlide
    });

  } catch (error) {
    console.error('Error uploading slide image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error.message
    });
  }
}
