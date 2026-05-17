import { Router } from 'express';
import { uploadImages, updateImage, deleteImage } from '../controllers/propertyImages.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.post('/', verifyToken, requireRole('seller', 'agent', 'admin'), uploadImages);
router.patch('/:imageId', verifyToken, requireRole('seller', 'agent', 'admin'), updateImage);
router.delete('/:imageId', verifyToken, requireRole('seller', 'agent', 'admin'), deleteImage);

export default router;
