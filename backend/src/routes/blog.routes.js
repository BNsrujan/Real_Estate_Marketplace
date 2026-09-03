import { Router } from 'express';
import { getPosts, getPostBySlug, getCategories, getTags, createPost, updatePost, deletePost } from '../controllers/blog.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getPosts);
router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/:slug', getPostBySlug);

router.post('/', verifyToken, requireRole('admin', 'agent'), createPost);
router.patch('/:id', verifyToken, requireRole('admin', 'agent'), updatePost);
router.delete('/:id', verifyToken, requireRole('admin'), deletePost);

export default router;
