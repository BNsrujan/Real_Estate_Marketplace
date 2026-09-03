import { Router } from 'express';
import { getDistricts, getDistrictById } from '../controllers/district.controller.js';

const router = Router();

router.get('/', getDistricts);
router.get('/:id', getDistrictById);

export default router;
