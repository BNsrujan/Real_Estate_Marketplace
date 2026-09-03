import { Router } from 'express';
import {
    listUsers, updateUserRole, toggleUserVerified,
    listAllProperties, setPropertyStatus, toggleFeatured,
    listAllEnquiries,
} from '../controllers/admin.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken, requireRole('admin'));

router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/verify', toggleUserVerified);

router.get('/properties', listAllProperties);
router.patch('/properties/:id/status', setPropertyStatus);
router.patch('/properties/:id/featured', toggleFeatured);

router.get('/enquiries', listAllEnquiries);

export default router;
