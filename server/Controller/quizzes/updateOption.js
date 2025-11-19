import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update an option
 * Params: optionId
 * Body: { optionText, isCorrect, position, imageUrl, imagePath, imageMime }
 */
export default async function updateOption(req, res) {
  try {
    const { optionId } = req.params;
    const { optionText, isCorrect, position, imageUrl, imagePath, imageMime } = req.body;

    // Check if option exists
    const existing = await prisma.quizQuestionOption.findUnique({
      where: { id: parseInt(optionId) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Option not found'
      });
    }

    // Build update data
    const updateData = {};
    
    if (optionText !== undefined) updateData.optionText = optionText;
    if (isCorrect !== undefined) updateData.isCorrect = isCorrect;
    if (position !== undefined) updateData.position = position;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imagePath !== undefined) updateData.imagePath = imagePath;
    if (imageMime !== undefined) updateData.imageMime = imageMime;

    // Update option
    const option = await prisma.quizQuestionOption.update({
      where: { id: parseInt(optionId) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Option updated successfully',
      data: option
    });

  } catch (error) {
    console.error('Error updating option:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update option',
      message: error.message
    });
  }
}
