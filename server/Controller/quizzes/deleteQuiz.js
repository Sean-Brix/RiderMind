import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete a quiz (cascade deletes questions, options, attempts, answers)
 * Params: id
 */
export default async function deleteQuiz(req, res) {
  try {
    const { id } = req.params;

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            attempts: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Optional: Prevent deletion if there are attempts
    // Uncomment the following if you want to prevent deletion of quizzes with attempts
    /*
    if (quiz._count.attempts > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete quiz. There are ${quiz._count.attempts} attempt(s) recorded.`,
        message: 'Consider deactivating the quiz instead'
      });
    }
    */

    // Delete quiz (cascade will handle questions, options, attempts, answers)
    await prisma.quiz.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
      data: {
        id: parseInt(id),
        title: quiz.title
      }
    });

  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quiz',
      message: error.message
    });
  }
}
