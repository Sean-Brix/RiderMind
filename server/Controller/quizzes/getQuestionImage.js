import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get question image data (BLOB)
 * GET /api/quizzes/questions/:questionId/image
 * 
 * Response: Raw binary image data (same as module slides)
 */
export default async function getQuestionImage(req, res) {
  try {
    const { questionId } = req.params;

    // Get question with image data
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) },
      select: {
        id: true,
        imageData: true,
        imageMime: true
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    if (!question.imageData || !question.imageMime) {
      console.log('No image data:', { 
        questionId, 
        hasImageData: !!question.imageData,
        hasImageMime: !!question.imageMime
      });
      return res.status(404).json({
        success: false,
        error: 'Question has no image'
      });
    }

    // Convert Prisma BLOB to Buffer
    // Prisma may return Buffer as: Buffer, {type: 'Buffer', data: [...]}, or Uint8Array
    let buffer;
    if (Buffer.isBuffer(question.imageData)) {
      buffer = question.imageData;
    } else if (question.imageData && typeof question.imageData === 'object' && question.imageData.type === 'Buffer') {
      // Prisma returns BLOB as {type: 'Buffer', data: [...]}
      buffer = Buffer.from(question.imageData.data);
    } else if (question.imageData instanceof Uint8Array) {
      buffer = Buffer.from(question.imageData);
    } else {
      // Fallback: try to convert whatever we got
      buffer = Buffer.from(question.imageData);
    }

    console.log('Sending quiz question image:', {
      questionId,
      imageMime: question.imageMime,
      bufferLength: buffer.length,
      isBuffer: Buffer.isBuffer(buffer)
    });

    // Set appropriate headers (same as module slides)
    res.setHeader('Content-Type', question.imageMime || 'image/jpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send binary image data
    res.end(buffer, 'binary');
    
    console.log('Image sent successfully for question:', questionId);

  } catch (error) {
    console.error('Error getting quiz question image:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to get image',
      message: error.message
    });
  }
}
