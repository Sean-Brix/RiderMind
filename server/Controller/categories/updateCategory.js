import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update a module category
 * Params: id
 * Body: { name, description, studentType, isActive, isDefault }
 */
export default async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, studentType, isActive, isDefault } = req.body;

    // Check if category exists
    const existing = await prisma.moduleCategory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check for duplicate name (excluding current category)
    if (name && name.trim() !== '') {
      const duplicate = await prisma.moduleCategory.findFirst({
        where: {
          name: name.trim(),
          id: { not: parseInt(id) }
        }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'A category with this name already exists'
        });
      }
    }

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await prisma.moduleCategory.updateMany({
        where: { 
          isDefault: true,
          id: { not: parseInt(id) }
        },
        data: { isDefault: false }
      });
    }

    // Build update data
    const updateData = {
      updatedBy: req.user?.id || null
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (studentType !== undefined) updateData.studentType = studentType;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    // Update category
    const category = await prisma.moduleCategory.update({
      where: { id: parseInt(id) },
      data: updateData,
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
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
      message: error.message
    });
  }
}
