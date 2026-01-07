import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Bulk add multiple modules to a category
 * @route POST /api/categories/:id/modules/bulk
 */
export default async function bulkAddModulesToCategory(req, res) {
  try {
    const categoryId = parseInt(req.params.id);
    const { moduleIds } = req.body;

    if (!moduleIds || !Array.isArray(moduleIds) || moduleIds.length === 0) {
      return res.status(400).json({
        error: 'moduleIds array is required and must not be empty'
      });
    }

    // Verify category exists
    const category = await prisma.moduleCategory.findUnique({
      where: { id: categoryId },
      include: {
        modules: {
          select: { moduleId: true, position: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get highest current position
    const maxPosition = category.modules.length > 0
      ? Math.max(...category.modules.map(m => m.position))
      : -1;

    // Verify all modules exist
    const modules = await prisma.module.findMany({
      where: { id: { in: moduleIds } }
    });

    if (modules.length !== moduleIds.length) {
      return res.status(400).json({
        error: 'One or more modules not found'
      });
    }

    // Get already assigned module IDs
    const assignedModuleIds = category.modules.map(m => m.moduleId);

    // Filter out already assigned modules
    const newModuleIds = moduleIds.filter(id => !assignedModuleIds.includes(id));

    if (newModuleIds.length === 0) {
      return res.status(200).json({
        message: 'All modules are already assigned to this category',
        category: {
          ...category,
          moduleCount: category.modules.length
        }
      });
    }

    // Get the highest position
    const maxPositionRecord = await prisma.moduleCategoryModule.findFirst({
      where: { categoryId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const startPosition = maxPositionRecord ? maxPositionRecord.position + 1 : 0;

    // Create bulk assignments
    const assignments = newModuleIds.map((moduleId, index) => ({
      categoryId,
      moduleId,
      position: startPosition + index
    }));

    await prisma.moduleCategoryModule.createMany({
      data: assignments
    });

    // Fetch updated category
    const updatedCategory = await prisma.moduleCategory.findUnique({
      where: { id: categoryId },
      include: {
        modules: {
          include: {
            module: {
              include: {
                objectives: true,
                slides: true,
                quizzes: true
              }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(200).json({
      message: `${newModuleIds.length} module(s) added successfully`,
      category: {
        ...updatedCategory,
        moduleCount: updatedCategory.modules.length
      }
    });

  } catch (error) {
    console.error('Error bulk adding modules to category:', error);
    res.status(500).json({
      error: 'Failed to bulk add modules to category',
      details: error.message
    });
  }
}
