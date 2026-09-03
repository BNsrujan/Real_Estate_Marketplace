import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { amenities } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const getAmenities = asyncHandler(async (req, res) => {
    const { category } = req.query;

    let query = db.select().from(amenities);
    if (category) query = query.where(eq(amenities.category, category));

    const rows = await query;
    return res.status(200).json(new ApiResponse(200, { data: rows }));
});

const createAmenity = asyncHandler(async (req, res) => {
    const { name, icon, category, isCustom = false } = req.body;
    if (!name) throw new ApiError(400, 'name is required');

    const [amenity] = await db.insert(amenities).values({ name, icon, category, isCustom }).returning();
    return res.status(201).json(new ApiResponse(201, { data: amenity }));
});

const deleteAmenity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await db.select({ id: amenities.id }).from(amenities)
        .where(eq(amenities.id, id)).limit(1);
    if (!existing.length) throw new ApiError(404, 'Amenity not found');

    await db.delete(amenities).where(eq(amenities.id, id));
    return res.status(200).json(new ApiResponse(200, { message: 'Amenity deleted' }));
});

export { getAmenities, createAmenity, deleteAmenity };
