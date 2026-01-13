import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env. JWT_EXPIRE
  });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    logger.warn('Login attempt with missing credentials', { email });
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password'
    });
  }

  // Check if admin exists
  const admin = await prisma.admin.findUnique({
    where: { email }
  });

  if (!admin) {
    logger.warn('Login attempt with non-existent email', { email });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    logger.warn('Login attempt with invalid password', { 
      email,
      adminId: admin.id 
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(admin.id);

  logger.info('Admin logged in successfully', {
    adminId: admin.id,
    email: admin.email
  });

  res.status(200).json({
    success: true,
    data: {
      id: admin.id,
      name:  admin.name,
      email: admin.email
    },
    token
  });
});

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    select: {
      id: true,
      name:  true,
      email: true,
      createdAt: true
    }
  });

  logger.info('Admin fetched profile', {
    adminId: admin.id,
    email: admin.email
  });

  res.status(200).json({
    success:  true,
    data: admin
  });
});