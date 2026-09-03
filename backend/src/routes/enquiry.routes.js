import { Router } from 'express';
import { submitEnquiry, getMyEnquiries, updateEnquiryStatus } from '../controllers/enquiry.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyToken, submitEnquiry);
router.get('/mine', verifyToken, getMyEnquiries);
router.patch('/:id/status', verifyToken, requireRole('seller', 'agent', 'admin'), updateEnquiryStatus);

export default router;
