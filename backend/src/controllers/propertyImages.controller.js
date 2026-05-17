import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { properties, propertyImages } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

async function assertOwnership(propertyId, userId, role) {
    const rows = await db.select({ sellerId: properties.sellerId })
        .from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (!rows.length) throw new ApiError(404, 'Property not found');
    if (role !== 'admin' && rows[0].sellerId !== userId) {
        throw new ApiError(403, 'You do not own this listing');
    }
}

const uploadImages = asyncHandler(async (req, res) => {
    const { id: propertyId } = req.params;
    const { urls = [] } = req.body;

    if (!urls.length) throw new ApiError(400, 'urls array is required');

    await assertOwnership(propertyId, req.user.userId, req.user.role);

    const values = urls.map((item, idx) => ({
        propertyId,
        url: typeof item === 'string' ? item : item.url,
        alt: typeof item === 'object' ? item.alt ?? null : null,
        displayOrder: typeof item === 'object' ? item.displayOrder ?? idx : idx,
        isCover: typeof item === 'object' ? item.isCover ?? false : false,
        width: typeof item === 'object' ? item.width ?? null : null,
        height: typeof item === 'object' ? item.height ?? null : null,
    }));

    const inserted = await db.insert(propertyImages).values(values).returning();

    return res.status(201).json(new ApiResponse(201, { data: inserted }));
});

const updateImage = asyncHandler(async (req, res) => {
    const { id: propertyId, imageId } = req.params;
    const { alt, displayOrder, isCover } = req.body;

    await assertOwnership(propertyId, req.user.userId, req.user.role);

    const existing = await db.select().from(propertyImages)
        .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)))
        .limit(1);

    if (!existing.length) throw new ApiError(404, 'Image not found');

    const patch = {};
    if (alt !== undefined) patch.alt = alt;
    if (displayOrder !== undefined) patch.displayOrder = displayOrder;
    if (isCover !== undefined) patch.isCover = isCover;

    const [updated] = await db.update(propertyImages).set(patch)
        .where(eq(propertyImages.id, imageId)).returning();

    return res.status(200).json(new ApiResponse(200, { data: updated }));
});

const deleteImage = asyncHandler(async (req, res) => {
    const { id: propertyId, imageId } = req.params;

    await assertOwnership(propertyId, req.user.userId, req.user.role);

    const existing = await db.select({ id: propertyImages.id }).from(propertyImages)
        .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)))
        .limit(1);

    if (!existing.length) throw new ApiError(404, 'Image not found');

    await db.delete(propertyImages).where(eq(propertyImages.id, imageId));

    return res.status(200).json(new ApiResponse(200, { message: 'Image deleted' }));
});

export { uploadImages, updateImage, deleteImage };
