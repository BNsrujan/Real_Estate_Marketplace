import { Router } from 'express';
import {
    getProperties, getPropertyBySlug, getPropertyById, getPropertiesByDistrict,
    createProperty, updateProperty, deleteProperty,
} from '../controllers/property.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getProperties);
router.get('/district/:districtId', getPropertiesByDistrict);
router.get('/slug/:slug', getPropertyBySlug);
router.get('/:id', getPropertyById);

router.post('/', verifyToken, requireRole('seller', 'agent', 'admin'), createProperty);
router.patch('/:id', verifyToken, requireRole('seller', 'agent', 'admin'), updateProperty);
router.delete('/:id', verifyToken, requireRole('seller', 'agent', 'admin'), deleteProperty);

export default router;
