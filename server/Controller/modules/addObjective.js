import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add objective to a module
 * Params: moduleId
 * Body: { objective, position }
 */
export default async function addObjective(req, res) {
  try {
    const { moduleId } = req.params;
    const { objective, position } = req.body;

    // Validation
    if (!objective) {
      return res.status(400).json({
        success: false,
        error: 'Objective text is required'
      });
    }

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Create objective
    const newObjective = await prisma.moduleObjective.create({
      data: {
        moduleId: parseInt(moduleId),
        objective,
        position: position || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Objective added successfully',
      data: newObjective
    });

  } catch (error) {
    console.error('Error adding objective:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add objective',
      message: error.message
    });
  }
}
