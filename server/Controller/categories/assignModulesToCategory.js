import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Assign modules to a category
 * Params: id (categoryId)
 * Body: { moduleIds: [1, 2, 3] } - Array of module IDs with their positions
 */
export default async function assignModulesToCategory(req, res) {
  try {
    const { id } = req.params;
    const { moduleIds } = req.body;

    // Validation
    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({
        success: false,
        error: 'moduleIds must be an array'
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

    // Verify all modules exist
    const modules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds }
      }
    });

    if (modules.length !== moduleIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more modules not found'
      });
    }

    // Delete existing assignments
    await prisma.moduleCategoryModule.deleteMany({
      where: { categoryId: parseInt(id) }
    });

    // Create new assignments with position based on array order
    const assignments = moduleIds.map((moduleId, index) => ({
      categoryId: parseInt(id),
      moduleId: moduleId,
      position: index
    }));

    await prisma.moduleCategoryModule.createMany({
      data: assignments
    });

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
                isActive: true
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
      message: 'Modules assigned successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error assigning modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign modules',
      message: error.message
    });
  }
}
