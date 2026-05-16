import { Router } from 'express';
import { registerUser, loginUser, googleAuth, getProfile, updateProfile, sendOtp, verifyOtp } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);

export default router;
