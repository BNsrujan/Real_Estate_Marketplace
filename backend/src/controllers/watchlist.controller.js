import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { savedProperties, properties, districts } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const watchlistRow = {
    id: properties.id,
    slug: properties.slug,
    title: properties.title,
    type: properties.type,
    priceLabel: properties.priceLabel,
    priceValue: properties.priceValue,
    sizeLabel: properties.sizeLabel,
    sizeValue: properties.sizeValue,
    areaUnit: properties.areaUnit,
    thumbnailUrl: properties.thumbnailUrl,
    lat: properties.lat,
    lng: properties.lng,
    listingType: properties.listingType,
    city: properties.city,
    taluk: properties.taluk,
    description: properties.description,
    features: properties.features,
    districtName: districts.name,
    districtId: districts.id,
    createdAt: properties.createdAt,
    updatedAt: properties.updatedAt,
    savedAt: savedProperties.savedAt,
};

function buildWatchlistItem(row) {
    return {
        id: row.id,
        slug: row.slug ?? row.id,
        title: row.title,
        type: row.type,
        priceLabel: row.priceLabel,
        priceValue: row.priceValue,
        sizeLabel: row.sizeLabel,
        sizeValue: row.sizeValue,
        areaUnit: row.areaUnit ?? 'sqft',
        thumbnailUrl: row.thumbnailUrl ?? null,
        lat: row.lat,
        lng: row.lng,
        listingType: row.listingType,
        city: row.city ?? '',
        taluk: row.taluk ?? '',
        description: row.description ?? '',
        features: row.features ?? [],
        districtName: row.districtName,
        districtId: row.districtId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        savedAt: row.savedAt,
    };
}

const getWatchlist = asyncHandler(async (req, res) => {
    const rows = await db
        .select(watchlistRow)
        .from(savedProperties)
        .innerJoin(properties, eq(savedProperties.propertyId, properties.id))
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(eq(savedProperties.userId, req.userId));

    return res.status(200).json(new ApiResponse(200, { data: rows.map(buildWatchlistItem) }));
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
        .where(and(
            eq(savedProperties.userId, req.userId),
            eq(savedProperties.propertyId, propertyId),
        ));

    return res.status(200).json(new ApiResponse(200, null, 'Property removed from watchlist'));
});

export { getWatchlist, saveProperty, removeProperty };
