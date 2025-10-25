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

    // Convert Prisma BLOB to Buffer
    // Prisma may return Buffer as: Buffer, {type: 'Buffer', data: [...]}, or Uint8Array
    let buffer;
    if (Buffer.isBuffer(slide.imageData)) {
      buffer = slide.imageData;
    } else if (slide.imageData && typeof slide.imageData === 'object' && slide.imageData.type === 'Buffer') {
      // Prisma returns BLOB as {type: 'Buffer', data: [...]}
      buffer = Buffer.from(slide.imageData.data);
    } else if (slide.imageData instanceof Uint8Array) {
      buffer = Buffer.from(slide.imageData);
    } else {
      // Fallback: try to convert whatever we got
      buffer = Buffer.from(slide.imageData);
    }

    console.log('Sending image:', {
      slideId,
      imageMime: slide.imageMime,
      originalDataType: typeof slide.imageData,
      isOriginalBuffer: Buffer.isBuffer(slide.imageData),
      hasDataProperty: slide.imageData && slide.imageData.data ? 'yes' : 'no',
      dataArrayLength: slide.imageData && slide.imageData.data ? slide.imageData.data.length : 0,
      bufferLength: buffer.length,
      isConvertedBuffer: Buffer.isBuffer(buffer),
      first10Bytes: buffer.slice(0, 10).toString('hex')
    });

    // Set appropriate headers
    res.setHeader('Content-Type', slide.imageMime || 'image/jpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send binary image data
    res.end(buffer, 'binary');
    
    console.log('Image sent successfully for slide:', slideId);

  } catch (error) {
    console.error('Error fetching slide image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch slide image',
      message: error.message
    });
  }
}
