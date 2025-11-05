import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Submit Registration Request
 * POST /api/auth/register
 * Public endpoint - creates a pending registration request
 */
export async function submitRegistration(req, res) {
  try {
    const {
      email,
      password,
      last_name,
      first_name,
      middle_name,
      name_extension,
      birthdate,
      sex,
      nationality,
      civil_status,
      weight,
      height,
      blood_type,
      eye_color,
      address_house_no,
      address_street,
      address_barangay,
      address_city_municipality,
      address_province,
      telephone_number,
      cellphone_number,
      email_address,
      emergency_contact_name,
      emergency_contact_relationship,
      emergency_contact_number,
      student_type
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!last_name || !first_name) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Check if there's already a pending request with this email
    const existingRequest = await prisma.registrationRequest.findFirst({
      where: {
        email,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A registration request with this email is already pending approval',
        requestId: existingRequest.id
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create registration request
    const registrationRequest = await prisma.registrationRequest.create({
      data: {
        email,
        passwordHash,
        last_name,
        first_name,
        middle_name,
        name_extension,
        birthdate: birthdate ? new Date(birthdate) : null,
        sex,
        nationality,
        civil_status,
        weight,
        height,
        blood_type,
        eye_color,
        address_house_no,
        address_street,
        address_barangay,
        address_city_municipality,
        address_province,
        telephone_number,
        cellphone_number,
        email_address,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_number,
        student_type,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully',
      requestId: registrationRequest.id,
      data: {
        id: registrationRequest.id,
        email: registrationRequest.email,
        status: registrationRequest.status,
        requestedAt: registrationRequest.requestedAt
      }
    });

  } catch (error) {
    console.error('Submit registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit registration request',
      error: error.message
    });
  }
}

/**
 * Get All Registration Requests (Admin only)
 * GET /api/auth/registration-requests
 * Query params: status (PENDING, APPROVED, REJECTED)
 */
export async function getRegistrationRequests(req, res) {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const requests = await prisma.registrationRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      select: {
        id: true,
        email: true,
        last_name: true,
        first_name: true,
        middle_name: true,
        name_extension: true,
        birthdate: true,
        sex: true,
        nationality: true,
        civil_status: true,
        weight: true,
        height: true,
        blood_type: true,
        eye_color: true,
        address_house_no: true,
        address_street: true,
        address_barangay: true,
        address_city_municipality: true,
        address_province: true,
        telephone_number: true,
        cellphone_number: true,
        email_address: true,
        emergency_contact_name: true,
        emergency_contact_relationship: true,
        emergency_contact_number: true,
        student_type: true,
        status: true,
        requestedAt: true,
        reviewedAt: true,
        reviewedBy: true,
        rejectionReason: true,
        reviewer: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Get registration requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration requests',
      error: error.message
    });
  }
}

/**
 * Get Single Registration Request (Admin only)
 * GET /api/auth/registration-requests/:id
 */
export async function getRegistrationRequest(req, res) {
  try {
    const { id } = req.params;

    const request = await prisma.registrationRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get registration request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration request',
      error: error.message
    });
  }
}

/**
 * Approve Registration Request (Admin only)
 * POST /api/auth/registration-requests/:id/approve
 * Creates a User account from the registration request
 */
export async function approveRegistration(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id; // From authentication middleware

    // Get the registration request
    const request = await prisma.registrationRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Registration request has already been ${request.status.toLowerCase()}`
      });
    }

    // Check if email is already registered (in case it was registered after the request was made)
    const existingUser = await prisma.user.findUnique({
      where: { email: request.email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create user account and update registration request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user account
      const newUser = await tx.user.create({
        data: {
          email: request.email,
          passwordHash: request.passwordHash,
          role: 'USER',
          last_name: request.last_name,
          first_name: request.first_name,
          middle_name: request.middle_name,
          name_extension: request.name_extension,
          birthdate: request.birthdate,
          sex: request.sex,
          nationality: request.nationality,
          civil_status: request.civil_status,
          weight: request.weight,
          height: request.height,
          blood_type: request.blood_type,
          eye_color: request.eye_color,
          address_house_no: request.address_house_no,
          address_street: request.address_street,
          address_barangay: request.address_barangay,
          address_city_municipality: request.address_city_municipality,
          address_province: request.address_province,
          telephone_number: request.telephone_number,
          cellphone_number: request.cellphone_number,
          email_address: request.email_address,
          emergency_contact_name: request.emergency_contact_name,
          emergency_contact_relationship: request.emergency_contact_relationship,
          emergency_contact_number: request.emergency_contact_number,
          student_type: request.student_type
        }
      });

      // Update registration request status
      const updatedRequest = await tx.registrationRequest.update({
        where: { id: parseInt(id) },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      return { newUser, updatedRequest };
    });

    res.status(200).json({
      success: true,
      message: 'Registration approved successfully',
      data: {
        userId: result.newUser.id,
        email: result.newUser.email,
        requestId: result.updatedRequest.id
      }
    });

  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve registration',
      error: error.message
    });
  }
}

/**
 * Reject Registration Request (Admin only)
 * POST /api/auth/registration-requests/:id/reject
 */
export async function rejectRegistration(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const request = await prisma.registrationRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Registration request has already been ${request.status.toLowerCase()}`
      });
    }

    const updatedRequest = await prisma.registrationRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: reason || null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Registration rejected',
      data: {
        requestId: updatedRequest.id,
        status: updatedRequest.status,
        rejectionReason: updatedRequest.rejectionReason
      }
    });

  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject registration',
      error: error.message
    });
  }
}

/**
 * Delete Registration Request (Admin only)
 * DELETE /api/auth/registration-requests/:id
 */
export async function deleteRegistrationRequest(req, res) {
  try {
    const { id } = req.params;

    const request = await prisma.registrationRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found'
      });
    }

    await prisma.registrationRequest.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Registration request deleted successfully'
    });

  } catch (error) {
    console.error('Delete registration request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete registration request',
      error: error.message
    });
  }
}
