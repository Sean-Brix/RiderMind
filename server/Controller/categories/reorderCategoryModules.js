import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Reorder modules in a category
 * Params: id (categoryId)
 * Body: { modules: [{ moduleId: 1, position: 0 }, { moduleId: 2, position: 1 }] }
 */
export default async function reorderCategoryModules(req, res) {
  try {
    const { id } = req.params;
    const { modules } = req.body;

    // Validation
    if (!Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        error: 'modules must be an array'
      });
    }

    if (modules.some(m => typeof m.moduleId !== 'number' || typeof m.position !== 'number')) {
      return res.status(400).json({
        success: false,
        error: 'Each module must have moduleId and position as numbers'
      });
    }

    // Check if category exists
    const category = await prisma.moduleCategory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Update positions
    await prisma.$transaction(
      modules.map(({ moduleId, position }) =>
        prisma.moduleCategoryModule.updateMany({
          where: {
            categoryId: parseInt(id),
            moduleId: parseInt(moduleId)
          },
          data: {
            position: position
          }
        })
      )
    );

    // Fetch updated category
    const updatedCategory = await prisma.moduleCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        modules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                description: true,
                isActive: true,
                position: true,
                objectives: true,
                slides: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Modules reordered successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder modules',
      message: error.message
    });
  }
}
