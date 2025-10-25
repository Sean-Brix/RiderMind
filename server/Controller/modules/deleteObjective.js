import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete an objective
 * Params: objectiveId
 */
export default async function deleteObjective(req, res) {
  try {
    const { objectiveId } = req.params;

    // Check if objective exists
    const existing = await prisma.moduleObjective.findUnique({
      where: { id: parseInt(objectiveId) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Objective not found'
      });
    }

    // Delete objective
    await prisma.moduleObjective.delete({
      where: { id: parseInt(objectiveId) }
    });

    res.status(200).json({
      success: true,
      message: 'Objective deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting objective:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete objective',
      message: error.message
    });
  }
}
