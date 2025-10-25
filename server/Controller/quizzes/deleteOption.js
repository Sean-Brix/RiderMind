import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete an option
 * Params: optionId
 */
export default async function deleteOption(req, res) {
  try {
    const { optionId } = req.params;

    // Check if option exists
    const option = await prisma.quizQuestionOption.findUnique({
      where: { id: parseInt(optionId) }
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        error: 'Option not found'
      });
    }

    // Delete option
    await prisma.quizQuestionOption.delete({
      where: { id: parseInt(optionId) }
    });

    res.status(200).json({
      success: true,
      message: 'Option deleted successfully',
      data: {
        id: parseInt(optionId)
      }
    });

  } catch (error) {
    console.error('Error deleting option:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete option',
      message: error.message
    });
  }
}
