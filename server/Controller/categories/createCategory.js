import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new module category
 * Body: { name, description, vehicleType, isActive, isDefault }
 */
export default async function createCategory(req, res) {
  try {
    const { name, description, vehicleType, isActive, isDefault } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Validate vehicleType
    if (!vehicleType || !['MOTORCYCLE', 'CAR'].includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle type must be either MOTORCYCLE or CAR'
      });
    }

    // Check for duplicate name
    const existing = await prisma.moduleCategory.findFirst({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A category with this name already exists'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.moduleCategory.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Create category
    const category = await prisma.moduleCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        vehicleType: vehicleType,
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault || false,
        createdBy: req.user?.id || null,
        updatedBy: req.user?.id || null
      },
      include: {
        modules: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      message: error.message
    });
  }
}
