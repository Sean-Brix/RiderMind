import { PrismaClient } from '@prisma/client';
import { streamVideo } from '../../utils/videoHandler.js';

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

    console.log('✅ Streaming video:', slide.videoPath);
    
    // Use the streamVideo utility
    streamVideo(slide.videoPath, req, res);

  } catch (error) {
    console.error('❌ Error streaming video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stream video',
      message: error.message
    });
  }
}
