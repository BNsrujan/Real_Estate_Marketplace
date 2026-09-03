import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { districts } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const getDistricts = asyncHandler(async (_req, res) => {
    const rows = await db.select().from(districts).orderBy(districts.name);
    return res.status(200).json(new ApiResponse(200, { data: rows }));
});

const getDistrictById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const rows = await db.select().from(districts).where(eq(districts.id, id)).limit(1);

    if (!rows.length) throw new ApiError(404, 'District not found');

    return res.status(200).json(new ApiResponse(200, rows[0]));
});

export { getDistricts, getDistrictById };
