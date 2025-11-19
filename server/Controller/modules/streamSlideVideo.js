import { PrismaClient } from '@prisma/client';
import { getFileUrlCached } from '../../utils/firebaseCache.js';

const prisma = new PrismaClient();

/**
 * Stream video from a slide
 * Params: slideId
 * Supports range requests for video streaming
 */
export default async function streamSlideVideo(req, res) {
  try {
    const { slideId } = req.params;
    
    console.log('🎬 Video request for slide:', slideId);

    // Get slide with video path
    const slide = await prisma.moduleSlide.findUnique({
      where: { id: parseInt(slideId) },
      select: {
        type: true,
        videoPath: true
      }
    });

    console.log('🎬 Slide found:', slide);

    if (!slide) {
      console.log('❌ Slide not found:', slideId);
      return res.status(404).json({
        success: false,
        error: 'Slide not found'
      });
    }

    if (slide.type !== 'video' || !slide.videoPath) {
      console.log('❌ No video for slide:', slideId, 'type:', slide.type, 'videoPath:', slide.videoPath);
      return res.status(404).json({
        success: false,
        error: 'No video available for this slide'
      });
    }

    // If we have a cloud path, resolve a cached download URL and redirect client to it
    try {
      const url = slide.videoUrl || await getFileUrlCached(slide.videoPath);
      if (!url) {
        return res.status(404).json({ success: false, error: 'Video URL not available' });
      }

      // Redirect client to Firebase Storage download URL (supports ranged requests)
      return res.redirect(url);
    } catch (err) {
      console.error('Error resolving video URL for slide:', slideId, err);
      return res.status(500).json({ success: false, error: 'Failed to resolve video URL', message: err.message });
    }

  } catch (error) {
    console.error('❌ Error streaming video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stream video',
      message: error.message
    });
  }
}
