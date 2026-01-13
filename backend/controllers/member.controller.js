import { asyncHandler } from '../middleware/errorHandler.js';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// @desc    Get all members with pagination, search, and filters
// @route   GET /api/members
// @access  Private
export const getMembers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    gender,
    maritalStatus,
    jumuiaId,
    groupId,
    status
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build where clause for filtering
  const where = {};

  // Search by name or phone
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } }
    ];
  }

  // Filter by gender
  if (gender) {
    where.gender = gender;
  }

  // Filter by marital status
  if (maritalStatus) {
    where.maritalStatus = maritalStatus;
  }

  // Filter by jumuia
  if (jumuiaId) {
    where.jumuiaId = jumuiaId;
  }

  // Filter by group
  if (groupId) {
    where.groupId = groupId;
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Get total count for pagination
  const total = await prisma.member.count({ where });

  // Get members
  const members = await prisma.member.findMany({
    where,
    skip,
    take: parseInt(limit),
    include: {
      jumuia: {
        select: {
          id: true,
          name: true
        }
      },
      group: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json({
    success: true,
    count: members.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: members
  });
});

// @desc    Get single member by ID
// @route   GET /api/members/:id
// @access  Private
export const getMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      jumuia: {
        select: {
          id: true,
          name: true
        }
      },
      group: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!member) {
    return res.status(404).json({
      success: false,
      error: 'Member not found'
    });
  }

  res.status(200).json({
    success: true,
    data: member
  });
});

// @desc    Create new member
// @route   POST /api/members
// @access  Private
export const createMember = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    maritalStatus,
    numberOfChildren,
    jumuiaId,
    groupId,
    status
  } = req.body;

  // Validation
  if (!firstName || !lastName || !gender) {
    logger.warn('Member creation failed - missing required fields', {
      adminId: req.admin.id,
      providedFields: Object.keys(req.body)
    });
    return res.status(400).json({
      success: false,
      error: 'Please provide firstName, lastName, and gender'
    });
  }

  // Create member
  const member = await prisma.member.create({
    data: {
      firstName,
      lastName,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      phone,
      maritalStatus: maritalStatus || 'SINGLE',
      numberOfChildren: numberOfChildren || 0,
      jumuiaId: jumuiaId || null,
      groupId: groupId || null,
      status: status || 'ACTIVE'
    },
    include: {
      jumuia: {
        select: {
          id: true,
          name: true
        }
      },
      group: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  logger.info('New member created', {
    adminId: req.admin.id,
    memberId: member.id,
    memberName: `${member.firstName} ${member.lastName}`
  });

  res.status(201).json({
    success: true,
    data: member
  });
});

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
export const updateMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    maritalStatus,
    numberOfChildren,
    jumuiaId,
    groupId,
    status
  } = req.body;

  // Check if member exists
  const existingMember = await prisma.member.findUnique({
    where: { id }
  });

  if (!existingMember) {
    logger.warn('Update attempt for non-existent member', {
      adminId: req.admin.id,
      memberId: id
    });
    return res.status(404).json({
      success: false,
      error: 'Member not found'
    });
  }

  // Update member
  const member = await prisma.member.update({
    where: { id },
    data: {
      firstName: firstName || existingMember.firstName,
      lastName: lastName || existingMember.lastName,
      gender: gender || existingMember.gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingMember.dateOfBirth,
      phone: phone !== undefined ? phone : existingMember.phone,
      maritalStatus: maritalStatus || existingMember.maritalStatus,
      numberOfChildren: numberOfChildren !== undefined ? numberOfChildren : existingMember.numberOfChildren,
      jumuiaId: jumuiaId !== undefined ? jumuiaId : existingMember.jumuiaId,
      groupId: groupId !== undefined ? groupId : existingMember.groupId,
      status: status || existingMember.status
    },
    include: {
      jumuia: {
        select: {
          id: true,
          name: true
        }
      },
      group: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    data: member
  });
});

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
export const deleteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if member exists
  const member = await prisma.member.findUnique({
    where: { id }
  });

  if (!member) {
    logger.warn('Delete attempt for non-existent member', {
      adminId: req.admin.id,
      memberId: id
    });
    return res.status(404).json({
      success: false,
      error: 'Member not found'
    });
  }

  // Delete member
  await prisma.member.delete({
    where: { id }
  });

  logger.warn('Member deleted', {
    adminId: req.admin.id,
    memberId: member.id,
    memberName: `${member.firstName} ${member.lastName}`
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Member deleted successfully'
  });
});

// @desc    Get member statistics
// @route   GET /api/members/stats
// @access  Private
export const getMemberStats = asyncHandler(async (req, res) => {
  const totalMembers = await prisma.member.count();
  const activeMembers = await prisma.member.count({
    where: { status: 'ACTIVE' }
  });
  const inactiveMembers = await prisma.member.count({
    where: { status: 'INACTIVE' }
  });

  const maleMembers = await prisma.member.count({
    where: { gender: 'MALE' }
  });
  const femaleMembers = await prisma.member.count({
    where: { gender: 'FEMALE' }
  });

  const marriedMembers = await prisma.member.count({
    where: { maritalStatus: 'MARRIED' }
  });
  const singleMembers = await prisma.member.count({
    where: { maritalStatus: 'SINGLE' }
  });

  res.status(200).json({
    success: true,
    data: {
      totalMembers,
      activeMembers,
      inactiveMembers,
      maleMembers,
      femaleMembers,
      marriedMembers,
      singleMembers
    }
  });
});