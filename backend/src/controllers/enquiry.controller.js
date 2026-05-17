import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { enquiries, properties } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const submitEnquiry = asyncHandler(async (req, res) => {
    const { propertyId, message, phone } = req.body;

    if (!propertyId) throw new ApiError(400, 'propertyId is required');
    if (!message || message.trim().length < 10) {
        throw new ApiError(400, 'Message must be at least 10 characters');
    }

   
    const [property] = await db
        .select({ id: properties.id, status: properties.status })
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);

    if (!property) throw new ApiError(404, 'Property not found');
    if (property.status !== 'active') throw new ApiError(400, 'Property is not available');

    const [enquiry] = await db
        .insert(enquiries)
        .values({
            propertyId,
            buyerId: req.userId,
            message: message.trim(),
            phone: phone ?? null,
            status: 'pending',
        })
        .returning({ id: enquiries.id, createdAt: enquiries.createdAt });

    return res.status(201).json(
        new ApiResponse(201, { id: enquiry.id, createdAt: enquiry.createdAt }, 'Enquiry submitted successfully'),
    );
});

const getMyEnquiries = asyncHandler(async (req, res) => {
    const rows = await db
        .select({
            id: enquiries.id,
            propertyId: enquiries.propertyId,
            propertyTitle: properties.title,
            message: enquiries.message,
            phone: enquiries.phone,
            status: enquiries.status,
            createdAt: enquiries.createdAt,
        })
        .from(enquiries)
        .innerJoin(properties, eq(enquiries.propertyId, properties.id))
        .where(eq(enquiries.buyerId, req.userId))
        .orderBy(enquiries.createdAt);

    return res.status(200).json(new ApiResponse(200, { data: rows }));
});

export { submitEnquiry, getMyEnquiries };
