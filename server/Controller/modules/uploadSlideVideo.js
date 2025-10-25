import { PrismaClient } from '@prisma/client';
import { uploadVideo } from '../../utils/videoHandler.js';

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

    // Delete old video if exists
    if (slide.videoPath) {
      try {
        const { deleteVideoFile } = await import('../../utils/videoHandler.js');
        deleteVideoFile(slide.videoPath);
      } catch (error) {
        console.error(`Failed to delete old video: ${slide.videoPath}`, error);
      }
    }

    // Update slide with new video path
    const updated = await prisma.moduleSlide.update({
      where: { id: parseInt(slideId) },
      data: {
        type: 'video',
        videoPath: req.file.filename
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
