import { Router } from 'express';
import { getAmenities, createAmenity, deleteAmenity } from '../controllers/amenities.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAmenities);
router.post('/', verifyToken, requireRole('admin'), createAmenity);
router.delete('/:id', verifyToken, requireRole('admin'), deleteAmenity);

export default router;
