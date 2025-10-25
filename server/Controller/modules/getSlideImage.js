import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get slide image data (BLOB)
 * Params: slideId
 */
export default async function getSlideImage(req, res) {
  try {
    const { slideId } = req.params;

    const slide = await prisma.moduleSlide.findUnique({
      where: { id: parseInt(slideId) },
      select: {
        imageData: true,
        imageMime: true,
        type: true
      }
    });

    if (!slide) {
      return res.status(404).json({
        success: false,
        error: 'Slide not found'
      });
    }

    if (slide.type !== 'image' || !slide.imageData) {
      console.log('No image data:', { 
        slideId, 
        type: slide.type, 
        hasImageData: !!slide.imageData 
      });
      return res.status(404).json({
        success: false,
        error: 'No image data available for this slide'
      });
    }

    console.log('Sending image:', {
      slideId,
      imageMime: slide.imageMime,
      dataLength: slide.imageData.length,
      dataType: typeof slide.imageData,
      isBuffer: Buffer.isBuffer(slide.imageData)
    });

    // Set appropriate headers
    res.setHeader('Content-Type', slide.imageMime || 'image/jpeg');
    res.setHeader('Content-Length', slide.imageData.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Ensure we're sending as Buffer
    const buffer = Buffer.isBuffer(slide.imageData) ? slide.imageData : Buffer.from(slide.imageData);
    
    // Send binary image data
    res.end(buffer, 'binary');

  } catch (error) {
    console.error('Error fetching slide image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch slide image',
      message: error.message
    });
  }
}
