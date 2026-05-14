import { Router } from 'express';
import { getProperties, getPropertyById, getPropertiesByDistrict } from '../controllers/property.controller.js';

const router = Router();

router.get('/', getProperties);
router.get('/district/:districtId', getPropertiesByDistrict);
router.get('/:id', getPropertyById);

export default router;
