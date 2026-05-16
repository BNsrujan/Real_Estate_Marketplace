import { Router } from 'express';
import { submitEnquiry, getMyEnquiries } from '../controllers/enquiry.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyToken, submitEnquiry);
router.get('/mine', verifyToken, getMyEnquiries);

export default router;
