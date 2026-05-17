import { eq, and, gte, lte, ilike } from 'drizzle-orm';
import { db } from '../db/db.js';
import { properties, districts, propertyImages } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const propertyRow = {
    id: properties.id,
    slug: properties.slug,
    title: properties.title,
    type: properties.type,
    priceLabel: properties.priceLabel,
    priceValue: properties.priceValue,
    sizeLabel: properties.sizeLabel,
    sizeValue: properties.sizeValue,
    areaUnit: properties.areaUnit,
    lat: properties.lat,
    lng: properties.lng,
    listingType: properties.listingType,
    status: properties.status,
    thumbnailUrl: properties.thumbnailUrl,
    description: properties.description,
    features: properties.features,
    sellerId: properties.sellerId,
    city: properties.city,
    taluk: properties.taluk,
    districtName: districts.name,
    districtState: districts.state,
    districtId: districts.id,
    createdAt: properties.createdAt,
    updatedAt: properties.updatedAt,
};

function buildProperty(row, images = []) {
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
        lat: row.lat,
        lng: row.lng,
        listingType: row.listingType,
        status: row.status,
        isActive: row.status === 'active',
        thumbnailUrl: row.thumbnailUrl ?? null,
        imageUrls: images.map((i) => i.url),
        description: row.description ?? '',
        features: row.features ?? [],
        sellerId: row.sellerId ?? null,
        city: row.city ?? '',
        taluk: row.taluk ?? '',
        districtName: row.districtName,
        districtState: row.districtState,
        districtId: row.districtId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

const getProperties = asyncHandler(async (req, res) => {
    const {
        type,
        district,
        listing,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 50,
    } = req.query;

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
        new ApiResponse(200, {
            data: rows.map((r) => buildProperty(r)),
            page: Number(page),
            limit: Number(limit),
        }),
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

    return res.status(200).json(new ApiResponse(200, buildProperty(rows[0], images)));
});

const getPropertiesByDistrict = asyncHandler(async (req, res) => {
    const { districtId } = req.params;

    const rows = await db
        .select(propertyRow)
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(
            and(
                eq(properties.districtId, districtId),
                eq(properties.status, 'active'),
            ),
        );

    return res.status(200).json(
        new ApiResponse(200, { data: rows.map((r) => buildProperty(r)) }),
    );
});

export { getProperties, getPropertyById, getPropertiesByDistrict };
