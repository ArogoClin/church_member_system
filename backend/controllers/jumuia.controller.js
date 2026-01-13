import { asyncHandler } from '../middleware/errorHandler.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all jumuias
// @route   GET /api/jumuias
// @access  Private
export const getJumuias = asyncHandler(async (req, res) => {
  const jumuias = await prisma.jumuia.findMany({
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
    count: jumuias.length,
    data: jumuias
  });
});

// @desc    Get single jumuia by ID
// @route   GET /api/jumuias/:id
// @access  Private
export const getJumuia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const jumuia = await prisma.jumuia.findUnique({
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

  if (!jumuia) {
    return res.status(404).json({
      success: false,
      error: 'Jumuia not found'
    });
  }

  res.status(200).json({
    success: true,
    data: jumuia
  });
});

// @desc    Create new jumuia
// @route   POST /api/jumuias
// @access  Private
export const createJumuia = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Please provide jumuia name'
    });
  }

  // Create jumuia
  const jumuia = await prisma.jumuia.create({
    data: {
      name
    }
  });

  res.status(201).json({
    success: true,
    data: jumuia
  });
});

// @desc    Update jumuia
// @route   PUT /api/jumuias/:id
// @access  Private
export const updateJumuia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Check if jumuia exists
  const existingJumuia = await prisma.jumuia.findUnique({
    where: { id }
  });

  if (!existingJumuia) {
    return res.status(404).json({
      success: false,
      error: 'Jumuia not found'
    });
  }

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Please provide jumuia name'
    });
  }

  // Update jumuia
  const jumuia = await prisma.jumuia.update({
    where: { id },
    data: { name }
  });

  res.status(200).json({
    success: true,
    data: jumuia
  });
});

// @desc    Delete jumuia
// @route   DELETE /api/jumuias/:id
// @access  Private
export const deleteJumuia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if jumuia exists
  const jumuia = await prisma.jumuia.findUnique({
    where: { id },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });

  if (!jumuia) {
    return res.status(404).json({
      success: false,
      error: 'Jumuia not found'
    });
  }

  // Check if jumuia has members
  if (jumuia._count.members > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete jumuia. It has ${jumuia._count.members} member(s). Please reassign or remove members first.`
    });
  }

  // Delete jumuia
  await prisma.jumuia.delete({
    where: { id }
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Jumuia deleted successfully'
  });
});

// @desc    Get members of a specific jumuia
// @route   GET /api/jumuias/:id/members
// @access  Private
export const getJumuiaMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if jumuia exists
  const jumuia = await prisma.jumuia.findUnique({
    where: { id }
  });

  if (!jumuia) {
    return res.status(404).json({
      success: false,
      error: 'Jumuia not found'
    });
  }

  // Get members
  const members = await prisma.member.findMany({
    where: { jumuiaId: id },
    include: {
      group: {
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