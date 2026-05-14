import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { savedProperties, properties, districts } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const getWatchlist = asyncHandler(async (req, res) => {
    const rows = await db
        .select({
            id: properties.id,
            title: properties.title,
            type: properties.type,
            priceLabel: properties.priceLabel,
            sizeLabel: properties.sizeLabel,
            lat: properties.lat,
            lng: properties.lng,
            listingType: properties.listingType,
            districtName: districts.name,
            savedAt: savedProperties.savedAt,
        })
        .from(savedProperties)
        .innerJoin(properties, eq(savedProperties.propertyId, properties.id))
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(eq(savedProperties.userId, req.userId));

    return res.status(200).json(new ApiResponse(200, { data: rows }));
});

const saveProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.body;
    if (!propertyId) throw new ApiError(400, 'propertyId is required');

    await db
        .insert(savedProperties)
        .values({ userId: req.userId, propertyId })
        .onConflictDoNothing();

    return res.status(201).json(new ApiResponse(201, null, 'Property saved'));
});

const removeProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    await db
        .delete(savedProperties)
        .where(and(eq(savedProperties.userId, req.userId), eq(savedProperties.propertyId, propertyId)));

    return res.status(200).json(new ApiResponse(200, null, 'Property removed from watchlist'));
});

export { getWatchlist, saveProperty, removeProperty };
