import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/firebase.js';
import { clearFileCache } from '../../utils/firebaseCache.js';

const prisma = new PrismaClient();

/**
 * Upload video for a slide
 * Uses multer middleware to handle video upload
 * Params: slideId
 * File: video file (multipart/form-data)
 */
export default async function uploadSlideVideo(req, res) {
  try {
    const { slideId } = req.params;

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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded'
      });
    }

    // Delete old video in cloud if exists
    if (slide.videoPath) {
      try {
        await deleteFile(slide.videoPath);
        clearFileCache(slide.videoPath);
      } catch (error) {
        console.error(`Failed to delete old video from cloud: ${slide.videoPath}`, error);
      }
    }

    // Upload new video buffer to Firebase
    const videoBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const filename = generateUniqueFilename(req.file.originalname);
    const storagePath = `modules/${slide.moduleId || 'unknown'}/slides/${slideId}/${filename}`;

    const result = await uploadFile(videoBuffer, storagePath, mimetype);

    // Update slide with cloud references
    const updated = await prisma.moduleSlide.update({
      where: { id: parseInt(slideId) },
      data: {
        type: 'video',
        videoUrl: result.url,
        videoPath: result.path
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        description: true,
        position: true,
        videoUrl: true,
        videoPath: true,
        imageMime: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: updated,
      file: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload video',
      message: error.message
    });
  }
}
