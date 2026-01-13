import { asyncHandler } from '../middleware/errorHandler.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
export const getGroups = asyncHandler(async (req, res) => {
  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: { members: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  res.status(200).json({
    success: true,
    count: groups.length,
    data: groups
  });
});

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          phone: true,
          status: true
        }
      },
      _count: {
        select: { members: true }
      }
    }
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }

  res.status(200).json({
    success: true,
    data: group
  });
});

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
export const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Please provide group name'
    });
  }

  // Create group
  const group = await prisma.group.create({
    data: {
      name
    }
  });

  res.status(201).json({
    success: true,
    data: group
  });
});

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
export const updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Check if group exists
  const existingGroup = await prisma.group.findUnique({
    where: { id }
  });

  if (!existingGroup) {
    return res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Please provide group name'
    });
  }

  // Update group
  const group = await prisma.group.update({
    where: { id },
    data: { name }
  });

  res.status(200).json({
    success: true,
    data: group
  });
});

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
export const deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if group exists
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }

  // Check if group has members
  if (group._count.members > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete group. It has ${group._count.members} member(s). Please reassign or remove members first.`
    });
  }

  // Delete group
  await prisma.group.delete({
    where: { id }
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Group deleted successfully'
  });
});

// @desc    Get members of a specific group
// @route   GET /api/groups/:id/members
// @access  Private
export const getGroupMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if group exists
  const group = await prisma.group.findUnique({
    where: { id }
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }

  // Get members
  const members = await prisma.member.findMany({
    where: { groupId: id },
    include: {
      jumuia: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      firstName: 'asc'
    }
  });

  res.status(200).json({
    success: true,
    count: members.length,
    data: members
  });
});