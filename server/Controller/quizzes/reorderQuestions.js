import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Reorder questions within a quiz
 * Body: { questions: [{ id: number, position: number }, ...] }
 */
export default async function reorderQuestions(req, res) {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Questions array is required'
      });
    }

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Update all question positions in a transaction
    await prisma.$transaction(
      questions.map(({ id, position }) =>
        prisma.quizQuestion.update({
          where: { id: parseInt(id) },
          data: { position: parseInt(position) }
        })
      )
    );

    // Fetch updated questions
    const updatedQuestions = await prisma.quizQuestion.findMany({
      where: { quizId: parseInt(quizId) },
      orderBy: { position: 'asc' },
      include: {
        options: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedQuestions
    });

  } catch (error) {
    console.error('Error reordering questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder questions',
      message: error.message
    });
  }
}
