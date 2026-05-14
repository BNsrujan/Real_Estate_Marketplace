import { Router } from 'express';
import { getWatchlist, saveProperty, removeProperty } from '../controllers/watchlist.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getWatchlist);
router.post('/', saveProperty);
router.delete('/:propertyId', removeProperty);

export default router;
