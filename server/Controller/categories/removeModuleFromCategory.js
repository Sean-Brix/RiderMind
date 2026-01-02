import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Remove a module from a category
 * Params: id (categoryId), moduleId
 */
export default async function removeModuleFromCategory(req, res) {
  try {
    const { id, moduleId } = req.params;

    // Check if assignment exists
    const assignment = await prisma.moduleCategoryModule.findUnique({
      where: {
        categoryId_moduleId: {
          categoryId: parseInt(id),
          moduleId: parseInt(moduleId)
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Module not assigned to this category'
      });
    }

    // Delete assignment
    await prisma.moduleCategoryModule.delete({
      where: {
        categoryId_moduleId: {
          categoryId: parseInt(id),
          moduleId: parseInt(moduleId)
        }
      }
    });

    // Reorder remaining modules to fill the gap
    const remainingModules = await prisma.moduleCategoryModule.findMany({
      where: { categoryId: parseInt(id) },
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
      message: 'Module removed successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error removing module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove module',
      message: error.message
    });
  }
}
