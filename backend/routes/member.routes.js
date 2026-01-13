import express from 'express';
import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats
} from '../controllers/member.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route (must be before :id route)
router.get('/stats', getMemberStats);

// CRUD routes
router.route('/')
  .get(getMembers)
  .post(createMember);

router.route('/:id')
  .get(getMember)
  .put(updateMember)
  .delete(deleteMember);

export default router;