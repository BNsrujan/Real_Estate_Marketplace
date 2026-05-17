import { Router } from 'express';
import { getDashboardProperties, getDashboardEnquiries, getDashboardStats } from '../controllers/dashboard.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken, requireRole('seller', 'agent', 'admin'));

router.get('/properties', getDashboardProperties);
router.get('/enquiries', getDashboardEnquiries);
router.get('/stats', getDashboardStats);

export default router;
