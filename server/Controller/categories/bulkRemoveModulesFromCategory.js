import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Bulk remove multiple modules from a category
 * @route DELETE /api/categories/:id/modules/bulk
 */
export default async function bulkRemoveModulesFromCategory(req, res) {
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
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete all specified assignments
    const deleteResult = await prisma.moduleCategoryModule.deleteMany({
      where: {
        categoryId,
        moduleId: { in: moduleIds }
      }
    });

    // Reorder remaining modules to fill gaps
    const remainingModules = await prisma.moduleCategoryModule.findMany({
      where: { categoryId },
      orderBy: { position: 'asc' }
    });

    // Update positions sequentially
    for (let i = 0; i < remainingModules.length; i++) {
      await prisma.moduleCategoryModule.update({
        where: { id: remainingModules[i].id },
        data: { position: i }
      });
    }

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
      message: `${deleteResult.count} module(s) removed successfully`,
      category: {
        ...updatedCategory,
        moduleCount: updatedCategory.modules.length
      }
    });

  } catch (error) {
    console.error('Error bulk removing modules from category:', error);
    res.status(500).json({
      error: 'Failed to bulk remove modules from category',
      details: error.message
    });
  }
}
