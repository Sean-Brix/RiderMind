import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete a question (cascade deletes options and answers)
 * Params: questionId
 */
export default async function deleteQuestion(req, res) {
  try {
    const { questionId } = req.params;

    // Check if question exists
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Delete question (cascade will handle options and answers)
    await prisma.quizQuestion.delete({
      where: { id: parseInt(questionId) }
    });

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      data: {
        id: parseInt(questionId)
      }
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete question',
      message: error.message
    });
  }
}
