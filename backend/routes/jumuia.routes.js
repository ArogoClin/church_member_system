import express from 'express';
import {
  getJumuias,
  getJumuia,
  createJumuia,
  updateJumuia,
  deleteJumuia,
  getJumuiaMembers
} from '../controllers/jumuia.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getJumuias)
  .post(createJumuia);

router.route('/:id')
  .get(getJumuia)
  .put(updateJumuia)
  .delete(deleteJumuia);

router.get('/:id/members', getJumuiaMembers);

export default router;