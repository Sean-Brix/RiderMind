import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all student modules with filtering, searching, and pagination (Admin only)
 * GET /api/admin/student-modules
 */
export default async function getAllStudentModules(req, res) {
  try {
    const { 
      search, 
      status, 
      page = 1, 
      limit = 25,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const where = {};

    // Search by user ID or student module ID
    if (search) {
      const searchNumber = parseInt(search);
      if (!isNaN(searchNumber)) {
        where.OR = [
          { id: searchNumber },
          { userId: searchNumber }
        ];
      }
    }

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build orderBy
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Fetch student modules with relations
    const [studentModules, total] = await Promise.all([
      prisma.studentModule.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          module: {
            select: {
              id: true,
              title: true,
              description: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy,
        skip,
        take
      }),
      prisma.studentModule.count({ where })
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        studentModules,
        currentPage: parseInt(page),
        totalPages,
        total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching student modules:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch student modules',
      message: error.message 
    });
  }
}
