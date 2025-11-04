import { enrollStudentInCategory } from '../../Services/studentModuleService.js';

/**
 * Controller to manually enroll a student in a category with specified skill level
 * POST /api/student-modules/enroll
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {number} req.body.categoryId - The category ID to enroll in
 * @param {string} req.body.skillLevel - The student's skill level (Beginner, Intermediate, Expert)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with enrollment data
 */
async function enrollInCategoryController(req, res) {
  try {
    console.log('📝 Enrollment request received');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);
    
    const userId = req.user.id;
    const { categoryId, skillLevel = 'Beginner' } = req.body;

    // Validate required fields
    if (!categoryId) {
      console.log('❌ No category ID provided');
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    // Validate skill level
    const validSkillLevels = ['Beginner', 'Intermediate', 'Expert'];
    if (!validSkillLevels.includes(skillLevel)) {
      console.log('❌ Invalid skill level:', skillLevel);
      return res.status(400).json({
        success: false,
        message: 'Invalid skill level. Must be Beginner, Intermediate, or Expert'
      });
    }

    console.log(`✅ Enrolling user ${userId} in category ${categoryId} with ${skillLevel} level`);

    // Enroll the student using the service function
    const studentModules = await enrollStudentInCategory(
      userId,
      parseInt(categoryId),
      skillLevel
    );

    console.log(`✅ Successfully enrolled! Created ${studentModules.length} student modules`);

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in course with ${skillLevel} level`,
      data: {
        modules: studentModules,
        enrolledCount: studentModules.length,
        skillLevel: skillLevel
      }
    });
  } catch (error) {
    console.error('❌ Error enrolling student:', error);
    
    // Handle specific error cases
    if (error.message.includes('already enrolled')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('No modules found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to enroll in category',
      error: error.message
    });
  }
}

export default enrollInCategoryController;
