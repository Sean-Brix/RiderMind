import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Reorder objectives within a module
 * Body: { objectives: [{ id: number, position: number }, ...] }
 */
export default async function reorderObjectives(req, res) {
  try {
    const { moduleId } = req.params;
    const { objectives } = req.body;

    if (!objectives || !Array.isArray(objectives)) {
      return res.status(400).json({
        success: false,
        error: 'Objectives array is required'
      });
    }

    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Update all objective positions in a transaction
    await prisma.$transaction(
      objectives.map(({ id, position }) =>
        prisma.moduleObjective.update({
          where: { id: parseInt(id) },
          data: { position: parseInt(position) }
        })
      )
    );

    // Fetch updated objectives
    const updatedObjectives = await prisma.moduleObjective.findMany({
      where: { moduleId: parseInt(moduleId) },
      orderBy: { position: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: updatedObjectives
    });

  } catch (error) {
    console.error('Error reordering objectives:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder objectives',
      message: error.message
    });
  }
}
