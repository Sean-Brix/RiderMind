import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add a single module to a category
 * Params: id (categoryId)
 * Body: { moduleId: number }
 */
export default async function addModuleToCategory(req, res) {
  try {
    const { id } = req.params;
    const { moduleId } = req.body;

    // Validation
    if (!moduleId) {
      return res.status(400).json({
        success: false,
        error: 'moduleId is required'
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

    // Check if module already assigned
    const existing = await prisma.moduleCategoryModule.findUnique({
      where: {
        categoryId_moduleId: {
          categoryId: parseInt(id),
          moduleId: parseInt(moduleId)
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Module already assigned to this category'
      });
    }

    // Get the highest position
    const maxPosition = await prisma.moduleCategoryModule.findFirst({
      where: { categoryId: parseInt(id) },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const newPosition = maxPosition ? maxPosition.position + 1 : 0;

    // Create assignment
    await prisma.moduleCategoryModule.create({
      data: {
        categoryId: parseInt(id),
        moduleId: parseInt(moduleId),
        position: newPosition
      }
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
      message: 'Module added successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add module',
      message: error.message
    });
  }
}
