import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete a module category
 * Params: id
 */
export default async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.moduleCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        modules: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Prevent deletion of default category
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the default category'
      });
    }

    // Delete category (cascades to module_category_modules)
    await prisma.moduleCategory.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      message: error.message
    });
  }
}
