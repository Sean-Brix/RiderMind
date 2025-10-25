import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update an objective
 * Params: objectiveId
 * Body: { objective, position }
 */
export default async function updateObjective(req, res) {
  try {
    const { objectiveId } = req.params;
    const { objective, position } = req.body;

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

    // Build update data
    const updateData = {};
    if (objective !== undefined) updateData.objective = objective;
    if (position !== undefined) updateData.position = position;

    // Update objective
    const updated = await prisma.moduleObjective.update({
      where: { id: parseInt(objectiveId) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Objective updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('Error updating objective:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update objective',
      message: error.message
    });
  }
}
