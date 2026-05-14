import { eq, and, gte, lte, ilike } from 'drizzle-orm';
import { db } from '../db/db.js';
import { properties, districts, propertyImages } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const propertyRow = {
    id: properties.id,
    title: properties.title,
    type: properties.type,
    priceLabel: properties.priceLabel,
    priceValue: properties.priceValue,
    sizeLabel: properties.sizeLabel,
    sizeValue: properties.sizeValue,
    lat: properties.lat,
    lng: properties.lng,
    listingType: properties.listingType,
    status: properties.status,
    createdAt: properties.createdAt,
    districtName: districts.name,
    districtState: districts.state,
    districtId: districts.id,
};

const getProperties = asyncHandler(async (req, res) => {
    const { type, district, listing, minPrice, maxPrice, search, page = 1, limit = 50 } = req.query;

    const conditions = [eq(properties.status, 'active')];

    if (type) conditions.push(eq(properties.type, type));
    if (listing) conditions.push(eq(properties.listingType, listing));
    if (minPrice) conditions.push(gte(properties.priceValue, minPrice));
    if (maxPrice) conditions.push(lte(properties.priceValue, maxPrice));
    if (district) conditions.push(ilike(districts.name, `%${district}%`));
    if (search) conditions.push(ilike(properties.title, `%${search}%`));

    const offset = (Number(page) - 1) * Number(limit);

    const rows = await db
        .select(propertyRow)
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(and(...conditions))
        .limit(Number(limit))
        .offset(offset);

    return res.status(200).json(
        new ApiResponse(200, { data: rows, page: Number(page), limit: Number(limit) })
    );
});

const getPropertyById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const rows = await db
        .select(propertyRow)
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(eq(properties.id, id))
        .limit(1);

    if (!rows.length) throw new ApiError(404, 'Property not found');

    const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, id))
        .orderBy(propertyImages.displayOrder);

    return res.status(200).json(
        new ApiResponse(200, { ...rows[0], images })
    );
});

const getPropertiesByDistrict = asyncHandler(async (req, res) => {
    const { districtId } = req.params;

    const rows = await db
        .select(propertyRow)
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(and(eq(properties.districtId, districtId), eq(properties.status, 'active')));

    return res.status(200).json(new ApiResponse(200, { data: rows }));
});

export { getProperties, getPropertyById, getPropertiesByDistrict };
