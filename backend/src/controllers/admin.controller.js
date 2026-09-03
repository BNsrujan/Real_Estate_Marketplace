import { eq, count } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, properties, districts, enquiries } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const listUsers = asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 30 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
        id: users.id, username: users.username, name: users.name,
        email: users.email, phone: users.phone, role: users.role,
        isVerified: users.isVerified, isPro: users.isPro,
        provider: users.provider, createdAt: users.createdAt,
    }).from(users);

    if (role) query = query.where(eq(users.role, role));

    const rows = await query.limit(Number(limit)).offset(offset);
    return res.status(200).json(new ApiResponse(200, { data: rows, page: Number(page), limit: Number(limit) }));
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) throw new ApiError(400, 'role is required');

    const [updated] = await db.update(users).set({ role }).where(eq(users.id, id)).returning({
        id: users.id, username: users.username, name: users.name, email: users.email, role: users.role,
    });
    if (!updated) throw new ApiError(404, 'User not found');

    return res.status(200).json(new ApiResponse(200, { data: updated }));
});

const toggleUserVerified = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isVerified } = req.body;
    if (isVerified === undefined) throw new ApiError(400, 'isVerified is required');

    const [updated] = await db.update(users).set({ isVerified }).where(eq(users.id, id)).returning({
        id: users.id, username: users.username, name: users.name, email: users.email,
        role: users.role, isVerified: users.isVerified,
    });
    if (!updated) throw new ApiError(404, 'User not found');

    return res.status(200).json(new ApiResponse(200, { data: updated }));
});

const listAllProperties = asyncHandler(async (req, res) => {
    const { status, type, page = 1, limit = 30 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (status) conditions.push(eq(properties.status, status));
    if (type) conditions.push(eq(properties.type, type));

    const rows = await db.select({
        id: properties.id, slug: properties.slug, title: properties.title,
        type: properties.type, priceLabel: properties.priceLabel, status: properties.status,
        isFeatured: properties.isFeatured, listingType: properties.listingType,
        city: properties.city, districtName: districts.name,
        sellerId: properties.sellerId, createdAt: properties.createdAt,
    })
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(conditions.length ? conditions[0] : undefined)
        .limit(Number(limit))
        .offset(offset);

    return res.status(200).json(new ApiResponse(200, { data: rows, page: Number(page), limit: Number(limit) }));
});

const setPropertyStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) throw new ApiError(400, 'status is required');

    const [updated] = await db.update(properties).set({ status, updatedAt: new Date() })
        .where(eq(properties.id, id)).returning({ id: properties.id, status: properties.status });
    if (!updated) throw new ApiError(404, 'Property not found');

    return res.status(200).json(new ApiResponse(200, { data: updated }));
});

const toggleFeatured = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    if (isFeatured === undefined) throw new ApiError(400, 'isFeatured is required');

    const [updated] = await db.update(properties).set({ isFeatured, updatedAt: new Date() })
        .where(eq(properties.id, id)).returning({ id: properties.id, isFeatured: properties.isFeatured });
    if (!updated) throw new ApiError(404, 'Property not found');

    return res.status(200).json(new ApiResponse(200, { data: updated }));
});

const listAllEnquiries = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 30 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (status) conditions.push(eq(enquiries.status, status));

    const rows = await db.select({
        id: enquiries.id, message: enquiries.message, phone: enquiries.phone,
        status: enquiries.status, createdAt: enquiries.createdAt,
        buyerId: enquiries.buyerId, propertyId: enquiries.propertyId,
        propertyTitle: properties.title,
    })
        .from(enquiries)
        .innerJoin(properties, eq(enquiries.propertyId, properties.id))
        .where(conditions.length ? conditions[0] : undefined)
        .limit(Number(limit))
        .offset(offset);

    return res.status(200).json(new ApiResponse(200, { data: rows, page: Number(page), limit: Number(limit) }));
});

export {
    listUsers, updateUserRole, toggleUserVerified,
    listAllProperties, setPropertyStatus, toggleFeatured,
    listAllEnquiries,
};
