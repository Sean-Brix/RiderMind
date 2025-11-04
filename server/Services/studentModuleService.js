const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Student Module Service
 * Manages student-specific module orders and progress tracking
 */

/**
 * Enrolls a student in a category by copying the current module order
 * Creates a snapshot of the current module arrangement for this student
 * @param {number} userId - The student's user ID
 * @param {number} categoryId - The module category ID
 * @returns {Promise<Array>} Created student module records
 */
async function enrollStudentInCategory(userId, categoryId) {
  try {
    // 1. Check if student is already enrolled in this category
    const existingEnrollment = await prisma.studentModule.findFirst({
      where: { userId, categoryId }
    });

    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this category');
    }

    // 2. Get all active modules for this category with their current order
    const categoryModules = await prisma.moduleCategoryModule.findMany({
      where: { categoryId },
      orderBy: { position: 'asc' },
      include: { 
        module: true,
        category: true
      }
    });

    if (categoryModules.length === 0) {
      throw new Error('No modules found in this category');
    }

    // 3. Create StudentModule records preserving the current order
    const studentModules = categoryModules.map(cm => ({
      userId,
      categoryId,
      moduleId: cm.moduleId,
      position: cm.position, // Freeze the order at enrollment time
      skillLevel: 'Beginner', // Default skill level for new enrollments
      isCompleted: false
    }));

    // 4. Insert all records
    await prisma.studentModule.createMany({
      data: studentModules,
      skipDuplicates: true
    });

    // 5. Return the created records
    const createdModules = await prisma.studentModule.findMany({
      where: { userId, categoryId },
      orderBy: { position: 'asc' },
      include: {
        module: {
          include: {
            objectives: true,
            slides: { 
              orderBy: { position: 'asc' },
              select: {
                id: true,
                type: true,
                title: true,
                content: true,
                description: true,
                position: true,
                skillLevel: true,
                videoPath: true,
                imageMime: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });

    // Filter slides based on student's skill level
    const filteredModules = createdModules.map(sm => {
      const studentSkillLevel = sm.skillLevel;
      
      const skillLevelRank = {
        'Beginner': 1,
        'Intermediate': 2,
        'Expert': 3
      };
      
      const studentRank = skillLevelRank[studentSkillLevel];
      
      const filteredSlides = sm.module.slides.filter(slide => {
        const slideRank = skillLevelRank[slide.skillLevel];
        return slideRank <= studentRank;
      });
      
      return {
        ...sm,
        module: {
          ...sm.module,
          slides: filteredSlides
        }
      };
    });

    return filteredModules;
  } catch (error) {
    throw new Error(`Failed to enroll student in category: ${error.message}`);
  }
}

/**
 * Gets all modules for a student in a specific category
 * Returns modules in the order assigned to this student
 * Filters slides based on student's skill level
 * @param {number} userId - The student's user ID
 * @param {number} categoryId - The module category ID
 * @returns {Promise<Array>} Student's modules with progress
 */
async function getStudentModules(userId, categoryId) {
  try {
    const studentModules = await prisma.studentModule.findMany({
      where: { userId, categoryId },
      orderBy: { position: 'asc' },
      include: {
        module: {
          include: {
            objectives: { orderBy: { position: 'asc' } },
            slides: { 
              orderBy: { position: 'asc' },
              select: {
                id: true,
                type: true,
                title: true,
                description: true,
                position: true,
                skillLevel: true
              }
            }
          }
        },
        category: true
      }
    });

    // Filter slides based on student's skill level for each module
    const filteredModules = studentModules.map(sm => {
      const studentSkillLevel = sm.skillLevel; // Student's skill level
      
      // Map skill levels to hierarchy: Beginner = 1, Intermediate = 2, Expert = 3
      const skillLevelRank = {
        'Beginner': 1,
        'Intermediate': 2,
        'Expert': 3
      };
      
      const studentRank = skillLevelRank[studentSkillLevel];
      
      // Filter slides: show slides at or below student's skill level
      const filteredSlides = sm.module.slides.filter(slide => {
        const slideRank = skillLevelRank[slide.skillLevel];
        return slideRank <= studentRank;
      });
      
      return {
        ...sm,
        module: {
          ...sm.module,
          slides: filteredSlides
        }
      };
    });

    return filteredModules;
  } catch (error) {
    throw new Error(`Failed to get student modules: ${error.message}`);
  }
}

/**
 * Gets a specific module for a student
 * Filters slides based on student's skill level
 * @param {number} userId - The student's user ID
 * @param {number} categoryId - The module category ID
 * @param {number} moduleId - The module ID
 * @returns {Promise<Object>} Student module with details
 */
async function getStudentModule(userId, categoryId, moduleId) {
  try {
    const studentModule = await prisma.studentModule.findFirst({
      where: { userId, categoryId, moduleId },
      include: {
        module: {
          include: {
            objectives: { orderBy: { position: 'asc' } },
            slides: { 
              orderBy: { position: 'asc' },
              select: {
                id: true,
                type: true,
                title: true,
                content: true,
                description: true,
                position: true,
                skillLevel: true,
                videoPath: true,
                imageMime: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        category: true
      }
    });

    if (!studentModule) {
      throw new Error('Module not found in student enrollment');
    }

    // Filter slides based on student's skill level
    const studentSkillLevel = studentModule.skillLevel;
    
    const skillLevelRank = {
      'Beginner': 1,
      'Intermediate': 2,
      'Expert': 3
    };
    
    const studentRank = skillLevelRank[studentSkillLevel];
    
    // Filter slides: show slides at or below student's skill level
    const filteredSlides = studentModule.module.slides.filter(slide => {
      const slideRank = skillLevelRank[slide.skillLevel];
      return slideRank <= studentRank;
    });
    
    return {
      ...studentModule,
      module: {
        ...studentModule.module,
        slides: filteredSlides
      }
    };
  } catch (error) {
    throw new Error(`Failed to get student module: ${error.message}`);
  }
}

/**
 * Marks a module as started for a student
 * @param {number} userId - The student's user ID
 * @param {number} categoryId - The module category ID
 * @param {number} moduleId - The module ID
 * @returns {Promise<Object>} Updated student module
 */
async function startModule(userId, categoryId, moduleId) {
  try {
    const updated = await prisma.studentModule.updateMany({
      where: {
        userId,
        categoryId,
        moduleId,
        startedAt: null // Only update if not already started
      },
      data: {
        startedAt: new Date()
      }
    });

    if (updated.count === 0) {
      // Module was already started or doesn't exist
      const existing = await prisma.studentModule.findFirst({
        where: { userId, categoryId, moduleId }
      });
      
      if (!existing) {
        throw new Error('Module not found in student enrollment');
      }
      
      return existing;
    }

    return await prisma.studentModule.findFirst({
      where: { userId, categoryId, moduleId },
      include: { module: true }
    });
  } catch (error) {
    throw new Error(`Failed to start module: ${error.message}`);
  }
}

/**
 * Marks a module as completed for a student
 * @param {number} userId - The student's user ID
 * @param {number} categoryId - The module category ID
 * @param {number} moduleId - The module ID
 * @returns {Promise<Object>} Updated student module
 */
async function completeModule(userId, categoryId, moduleId) {
  try {
    const updated = await prisma.studentModule.updateMany({
      where: {
        userId,
        categoryId,
        moduleId
      },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        startedAt: new Date() // Set startedAt if it wasn't set before
      }
    });

    if (updated.count === 0) {
      throw new Error('Module not found in student enrollment');
    }

    return await prisma.studentModule.findFirst({
      where: { userId, categoryId, moduleId },
      include: { module: true }
    });
  } catch (error) {
    throw new Error(`Failed to complete module: ${error.message}`);
  }
}

/**
 * Gets student's progress in a specific category
 * @param {number} userId - The student's user ID
 * @param {number} categoryId - The module category ID
 * @returns {Promise<Object>} Progress statistics
 */
async function getStudentProgress(userId, categoryId) {
  try {
    const modules = await prisma.studentModule.findMany({
      where: { userId, categoryId },
      orderBy: { position: 'asc' },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      }
    });

    const total = modules.length;
    const completed = modules.filter(m => m.isCompleted).length;
    const inProgress = modules.filter(m => m.startedAt && !m.isCompleted).length;
    const notStarted = modules.filter(m => !m.startedAt).length;

    // Find current module (first incomplete module)
    const currentModule = modules.find(m => !m.isCompleted);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      currentModule: currentModule || null,
      modules: modules.map(m => ({
        id: m.id,
        moduleId: m.moduleId,
        title: m.module.title,
        position: m.position,
        isCompleted: m.isCompleted,
        startedAt: m.startedAt,
        completedAt: m.completedAt
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get student progress: ${error.message}`);
  }
}

/**
 * Gets overall progress across all categories for a student
 * @param {number} userId - The student's user ID
 * @returns {Promise<Array>} Progress for all enrolled categories
 */
async function getOverallProgress(userId) {
  try {
    const categories = await prisma.studentModule.findMany({
      where: { userId },
      distinct: ['categoryId'],
      select: { categoryId: true }
    });

    const progressByCategory = await Promise.all(
      categories.map(async ({ categoryId }) => {
        const progress = await getStudentProgress(userId, categoryId);
        const category = await prisma.moduleCategory.findUnique({
          where: { id: categoryId },
          select: { id: true, name: true, description: true, vehicleType: true }
        });
        
        return {
          category,
          ...progress
        };
      })
    );

    return progressByCategory;
  } catch (error) {
    throw new Error(`Failed to get overall progress: ${error.message}`);
  }
}

/**
 * Re-syncs a student's modules with the current category order
 * WARNING: This will reset their progress and change their module order
 * @param {number} userId - The student's user ID
 * @param {number} categoryId - The module category ID
 * @returns {Promise<Array>} New student module records
 */
async function reenrollStudent(userId, categoryId) {
  try {
    // Delete existing enrollment
    await prisma.studentModule.deleteMany({
      where: { userId, categoryId }
    });

    // Re-enroll with current order
    return await enrollStudentInCategory(userId, categoryId);
  } catch (error) {
    throw new Error(`Failed to re-enroll student: ${error.message}`);
  }
}

/**
 * Gets all students enrolled in a specific category
 * @param {number} categoryId - The module category ID
 * @returns {Promise<Array>} Students with their progress
 */
async function getEnrolledStudents(categoryId) {
  try {
    const enrollments = await prisma.studentModule.findMany({
      where: { categoryId },
      distinct: ['userId'],
      select: { userId: true }
    });

    const studentsWithProgress = await Promise.all(
      enrollments.map(async ({ userId }) => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            student_type: true
          }
        });

        const progress = await getStudentProgress(userId, categoryId);

        return {
          user,
          progress
        };
      })
    );

    return studentsWithProgress;
  } catch (error) {
    throw new Error(`Failed to get enrolled students: ${error.message}`);
  }
}

module.exports = {
  enrollStudentInCategory,
  getStudentModules,
  getStudentModule,
  startModule,
  completeModule,
  getStudentProgress,
  getOverallProgress,
  reenrollStudent,
  getEnrolledStudents
};
