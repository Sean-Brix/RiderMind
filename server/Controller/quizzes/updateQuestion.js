import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update a question
 * Params: questionId
 * Body: { type, question, points, explanation, etc. }
 */
export default async function updateQuestion(req, res) {
  try {
    const { questionId } = req.params;
    const {
      type,
      question,
      points,
      position,
      explanation,
      caseSensitive,
      shuffleOptions,
      imageUrl,
      imagePath,
      imageMime,
      videoUrl,
      videoPath
    } = req.body;

    // Check if question exists
    const existing = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Build update data
    const updateData = {};
    
    if (type !== undefined) updateData.type = type;
    if (question !== undefined) updateData.question = question;
    if (points !== undefined) updateData.points = points;
    if (position !== undefined) updateData.position = position;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (caseSensitive !== undefined) updateData.caseSensitive = caseSensitive;
    if (shuffleOptions !== undefined) updateData.shuffleOptions = shuffleOptions;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imagePath !== undefined) updateData.imagePath = imagePath;
    if (imageMime !== undefined) updateData.imageMime = imageMime;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (videoPath !== undefined) updateData.videoPath = videoPath;

    // Update question
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: updateData,
      include: {
        options: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update question',
      message: error.message
    });
  }
}
