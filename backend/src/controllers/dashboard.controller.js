import { eq, and, count } from 'drizzle-orm';
import { db } from '../db/db.js';
import { properties, districts, propertyImages, enquiries, savedProperties } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asynHandler.js';

const propertyRow = {
    id: properties.id,
    slug: properties.slug,
    title: properties.title,
    type: properties.type,
    priceLabel: properties.priceLabel,
    priceValue: properties.priceValue,
    sizeLabel: properties.sizeLabel,
    areaUnit: properties.areaUnit,
    listingType: properties.listingType,
    status: properties.status,
    thumbnailUrl: properties.thumbnailUrl,
    isFeatured: properties.isFeatured,
    city: properties.city,
    districtName: districts.name,
    districtId: districts.id,
    createdAt: properties.createdAt,
    updatedAt: properties.updatedAt,
};

const getDashboardProperties = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const sellerId = req.user.userId;

    const conditions = [eq(properties.sellerId, sellerId)];
    if (status) conditions.push(eq(properties.status, status));

    const offset = (Number(page) - 1) * Number(limit);

    const rows = await db
        .select(propertyRow)
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(and(...conditions))
        .limit(Number(limit))
        .offset(offset);

    return res.status(200).json(new ApiResponse(200, {
        data: rows,
        page: Number(page),
        limit: Number(limit),
    }));
});

const getDashboardEnquiries = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const sellerId = req.user.userId;

    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [eq(properties.sellerId, sellerId)];
    if (status) conditions.push(eq(enquiries.status, status));

    const rows = await db
        .select({
            id: enquiries.id,
            message: enquiries.message,
            phone: enquiries.phone,
            status: enquiries.status,
            createdAt: enquiries.createdAt,
            buyerId: enquiries.buyerId,
            propertyId: enquiries.propertyId,
            propertyTitle: properties.title,
            propertySlug: properties.slug,
        })
        .from(enquiries)
        .innerJoin(properties, eq(enquiries.propertyId, properties.id))
        .where(and(...conditions))
        .limit(Number(limit))
        .offset(offset);

    return res.status(200).json(new ApiResponse(200, {
        data: rows,
        page: Number(page),
        limit: Number(limit),
    }));
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const sellerId = req.user.userId;

    const [activeResult, soldResult, rentedResult, enquiryResult] = await Promise.all([
        db.select({ count: count() }).from(properties)
            .where(and(eq(properties.sellerId, sellerId), eq(properties.status, 'active'))),
        db.select({ count: count() }).from(properties)
            .where(and(eq(properties.sellerId, sellerId), eq(properties.status, 'sold'))),
        db.select({ count: count() }).from(properties)
            .where(and(eq(properties.sellerId, sellerId), eq(properties.status, 'rented'))),
        db.select({ count: count() }).from(enquiries)
            .innerJoin(properties, eq(enquiries.propertyId, properties.id))
            .where(eq(properties.sellerId, sellerId)),
    ]);

    return res.status(200).json(new ApiResponse(200, {
        activeCount: Number(activeResult[0].count),
        soldCount: Number(soldResult[0].count),
        rentedCount: Number(rentedResult[0].count),
        enquiryCount: Number(enquiryResult[0].count),
    }));
});

export { getDashboardProperties, getDashboardEnquiries, getDashboardStats };
