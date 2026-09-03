import { eq, and, gte, lte, ilike, inArray } from 'drizzle-orm';
import { db } from '../db/db.js';
import {
    properties, districts, propertyImages, amenities,
    propertyResidentialDetails, propertyRoadInfo, propertyAgricultureDetails,
    propertyAmenities, propertyGeometries,
} from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const propertyRow = {
    id: properties.id,
    propertyRef: properties.propertyRef,
    slug: properties.slug,
    title: properties.title,
    type: properties.type,
    priceLabel: properties.priceLabel,
    priceValue: properties.priceValue,
    expectedPrice: properties.expectedPrice,
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
    facing: properties.facing,
    siteDimensions: properties.siteDimensions,
    landUse: properties.landUse,
    documentStatus: properties.documentStatus,
    condition: properties.condition,
    contactNumber: properties.contactNumber,
    roadAccess: properties.roadAccess,
    isFeatured: properties.isFeatured,
    address: properties.address,
    sellerId: properties.sellerId,
    city: properties.city,
    taluk: properties.taluk,
    districtName: districts.name,
    districtState: districts.state,
    districtId: districts.id,
    createdAt: properties.createdAt,
    updatedAt: properties.updatedAt,
};

function buildProperty(row, images = [], detail = {}) {
    return {
        id: row.id,
        propertyRef: row.propertyRef ?? null,
        slug: row.slug ?? row.id,
        title: row.title,
        type: row.type,
        priceLabel: row.priceLabel,
        priceValue: row.priceValue,
        expectedPrice: row.expectedPrice ?? null,
        sizeLabel: row.sizeLabel,
        sizeValue: row.sizeValue,
        areaUnit: row.areaUnit ?? 'sqft',
        lat: row.lat,
        lng: row.lng,
        listingType: row.listingType,
        status: row.status,
        isActive: row.status === 'active',
        thumbnailUrl: row.thumbnailUrl ?? null,
        images: images.map((i) => ({
            id: i.id,
            url: i.url,
            alt: i.alt ?? '',
            displayOrder: i.displayOrder,
            isCover: i.isCover,
            width: i.width ?? null,
            height: i.height ?? null,
        })),
        imageUrls: images.map((i) => i.url),
        description: row.description ?? '',
        features: row.features ?? [],
        facing: row.facing ?? null,
        siteDimensions: row.siteDimensions ?? null,
        landUse: row.landUse ?? null,
        documentStatus: row.documentStatus ?? null,
        condition: row.condition ?? null,
        contactNumber: row.contactNumber ?? null,
        roadAccess: row.roadAccess ?? false,
        isFeatured: row.isFeatured ?? false,
        address: row.address ?? null,
        sellerId: row.sellerId ?? null,
        city: row.city ?? '',
        taluk: row.taluk ?? '',
        districtName: row.districtName,
        districtState: row.districtState,
        districtId: row.districtId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        residentialDetails: detail.residential ?? null,
        roadInfo: detail.road ?? null,
        agricultureDetails: detail.agriculture ?? null,
        amenities: detail.amenities ?? [],
        geometries: detail.geometries ?? [],
    };
}

async function fetchPropertyDetail(propertyId) {
    const [residential, road, agriculture, amenityRows, geometryRows] = await Promise.all([
        db.select().from(propertyResidentialDetails)
            .where(eq(propertyResidentialDetails.propertyId, propertyId)).limit(1),
        db.select().from(propertyRoadInfo)
            .where(eq(propertyRoadInfo.propertyId, propertyId)).limit(1),
        db.select().from(propertyAgricultureDetails)
            .where(eq(propertyAgricultureDetails.propertyId, propertyId)).limit(1),
        db.select({ id: amenities.id, name: amenities.name, icon: amenities.icon, category: amenities.category })
            .from(propertyAmenities)
            .innerJoin(amenities, eq(propertyAmenities.amenityId, amenities.id))
            .where(eq(propertyAmenities.propertyId, propertyId)),
        db.select().from(propertyGeometries)
            .where(eq(propertyGeometries.propertyId, propertyId)),
    ]);

    return {
        residential: residential[0] ?? null,
        road: road[0] ?? null,
        agriculture: agriculture[0] ?? null,
        amenities: amenityRows,
        geometries: geometryRows,
    };
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateUniqueSlug(title) {
    const base = slugify(title);
    let slug = base;
    let n = 1;
    while (true) {
        const existing = await db.select({ id: properties.id })
            .from(properties).where(eq(properties.slug, slug)).limit(1);
        if (!existing.length) return slug;
        slug = `${base}-${n++}`;
    }
}

const getProperties = asyncHandler(async (req, res) => {
    const {
        type, district, listing, minPrice, maxPrice, search,
        featured, page = 1, limit = 50,
    } = req.query;

    const conditions = [eq(properties.status, 'active')];

    if (type) conditions.push(eq(properties.type, type));
    if (listing) conditions.push(eq(properties.listingType, listing));
    if (minPrice) conditions.push(gte(properties.priceValue, minPrice));
    if (maxPrice) conditions.push(lte(properties.priceValue, maxPrice));
    if (district) conditions.push(ilike(districts.name, `%${district}%`));
    if (search) conditions.push(ilike(properties.title, `%${search}%`));
    if (featured === 'true') conditions.push(eq(properties.isFeatured, true));

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

const getPropertyBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const rows = await db
        .select(propertyRow)
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(eq(properties.slug, slug))
        .limit(1);

    if (!rows.length) throw new ApiError(404, 'Property not found');

    const [images, detail] = await Promise.all([
        db.select().from(propertyImages)
            .where(eq(propertyImages.propertyId, rows[0].id))
            .orderBy(propertyImages.displayOrder),
        fetchPropertyDetail(rows[0].id),
    ]);

    return res.status(200).json(new ApiResponse(200, buildProperty(rows[0], images, detail)));
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

    const [images, detail] = await Promise.all([
        db.select().from(propertyImages)
            .where(eq(propertyImages.propertyId, id))
            .orderBy(propertyImages.displayOrder),
        fetchPropertyDetail(id),
    ]);

    return res.status(200).json(new ApiResponse(200, buildProperty(rows[0], images, detail)));
});

const getPropertiesByDistrict = asyncHandler(async (req, res) => {
    const { districtId } = req.params;

    const rows = await db
        .select(propertyRow)
        .from(properties)
        .leftJoin(districts, eq(properties.districtId, districts.id))
        .where(and(eq(properties.districtId, districtId), eq(properties.status, 'active')));

    return res.status(200).json(
        new ApiResponse(200, { data: rows.map((r) => buildProperty(r)) }),
    );
});

const createProperty = asyncHandler(async (req, res) => {
    const {
        title, type, priceLabel, priceValue, expectedPrice,
        sizeLabel, sizeValue, areaUnit, lat, lng,
        districtId, city, taluk, address, listingType,
        facing, siteDimensions, landUse, documentStatus, condition,
        contactNumber, roadAccess, description, features,
        residentialDetails, roadInfo, agricultureDetails,
        amenityIds = [], imageUrls = [], geometries = [],
    } = req.body;

    if (!title || !type || !priceLabel || !priceValue || !sizeLabel || !lat || !lng) {
        throw new ApiError(400, 'Missing required fields: title, type, priceLabel, priceValue, sizeLabel, lat, lng');
    }

    const slug = await generateUniqueSlug(title);
    const sellerId = req.user.userId;

    const result = await db.transaction(async (tx) => {
        const [prop] = await tx.insert(properties).values({
            slug, title, type,
            priceLabel, priceValue: String(priceValue),
            expectedPrice: expectedPrice ? String(expectedPrice) : null,
            sizeLabel, sizeValue: sizeValue ? String(sizeValue) : null,
            areaUnit: areaUnit ?? 'sqft',
            lat: String(lat), lng: String(lng),
            districtId: districtId ?? null,
            city: city ?? null, taluk: taluk ?? null, address: address ?? null,
            listingType: listingType ?? 'sale',
            facing: facing ?? null, siteDimensions: siteDimensions ?? null,
            landUse: landUse ?? null, documentStatus: documentStatus ?? null,
            condition: condition ?? null, contactNumber: contactNumber ?? null,
            roadAccess: roadAccess ?? false,
            description: description ?? null,
            features: features ?? [],
            sellerId,
        }).returning();

        const propId = prop.id;

        if (residentialDetails && ['house', 'apartment', 'villa'].includes(type)) {
            await tx.insert(propertyResidentialDetails).values({ propertyId: propId, ...residentialDetails });
        }

        if (roadInfo && roadAccess) {
            await tx.insert(propertyRoadInfo).values({ propertyId: propId, ...roadInfo });
        }

        if (agricultureDetails && type === 'agriculture') {
            await tx.insert(propertyAgricultureDetails).values({ propertyId: propId, ...agricultureDetails });
        }

        if (amenityIds.length) {
            await tx.insert(propertyAmenities).values(
                amenityIds.map((amenityId) => ({ propertyId: propId, amenityId })),
            );
        }

        if (imageUrls.length) {
            await tx.insert(propertyImages).values(
                imageUrls.map((item, idx) => ({
                    propertyId: propId,
                    url: typeof item === 'string' ? item : item.url,
                    alt: typeof item === 'object' ? item.alt ?? null : null,
                    displayOrder: typeof item === 'object' ? item.displayOrder ?? idx : idx,
                    isCover: typeof item === 'object' ? item.isCover ?? idx === 0 : idx === 0,
                    width: typeof item === 'object' ? item.width ?? null : null,
                    height: typeof item === 'object' ? item.height ?? null : null,
                })),
            );
        }

        if (geometries.length) {
            await tx.insert(propertyGeometries).values(
                geometries.map((g) => ({ propertyId: propId, type: g.type, geojson: g.geojson })),
            );
        }

        return propId;
    });

    const [rows, images, detail] = await Promise.all([
        db.select(propertyRow).from(properties)
            .leftJoin(districts, eq(properties.districtId, districts.id))
            .where(eq(properties.id, result)).limit(1),
        db.select().from(propertyImages).where(eq(propertyImages.propertyId, result))
            .orderBy(propertyImages.displayOrder),
        fetchPropertyDetail(result),
    ]);

    return res.status(201).json(new ApiResponse(201, buildProperty(rows[0], images, detail)));
});

const updateProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await db.select({ sellerId: properties.sellerId })
        .from(properties).where(eq(properties.id, id)).limit(1);

    if (!existing.length) throw new ApiError(404, 'Property not found');

    const { role, userId } = req.user;
    if (role !== 'admin' && existing[0].sellerId !== userId) {
        throw new ApiError(403, 'You do not own this listing');
    }

    const {
        residentialDetails, roadInfo, agricultureDetails,
        amenityIds, imageUrls, geometries,
        ...coreFields
    } = req.body;

    const coreUpdate = Object.fromEntries(
        Object.entries(coreFields).filter(([, v]) => v !== undefined),
    );

    await db.transaction(async (tx) => {
        if (Object.keys(coreUpdate).length) {
            await tx.update(properties).set({ ...coreUpdate, updatedAt: new Date() })
                .where(eq(properties.id, id));
        }

        if (residentialDetails !== undefined) {
            await tx.delete(propertyResidentialDetails).where(eq(propertyResidentialDetails.propertyId, id));
            if (residentialDetails) {
                await tx.insert(propertyResidentialDetails).values({ propertyId: id, ...residentialDetails });
            }
        }

        if (roadInfo !== undefined) {
            await tx.delete(propertyRoadInfo).where(eq(propertyRoadInfo.propertyId, id));
            if (roadInfo) {
                await tx.insert(propertyRoadInfo).values({ propertyId: id, ...roadInfo });
            }
        }

        if (agricultureDetails !== undefined) {
            await tx.delete(propertyAgricultureDetails).where(eq(propertyAgricultureDetails.propertyId, id));
            if (agricultureDetails) {
                await tx.insert(propertyAgricultureDetails).values({ propertyId: id, ...agricultureDetails });
            }
        }

        if (amenityIds !== undefined) {
            await tx.delete(propertyAmenities).where(eq(propertyAmenities.propertyId, id));
            if (amenityIds.length) {
                await tx.insert(propertyAmenities).values(
                    amenityIds.map((amenityId) => ({ propertyId: id, amenityId })),
                );
            }
        }
    });

    const [rows, images, detail] = await Promise.all([
        db.select(propertyRow).from(properties)
            .leftJoin(districts, eq(properties.districtId, districts.id))
            .where(eq(properties.id, id)).limit(1),
        db.select().from(propertyImages).where(eq(propertyImages.propertyId, id))
            .orderBy(propertyImages.displayOrder),
        fetchPropertyDetail(id),
    ]);

    return res.status(200).json(new ApiResponse(200, buildProperty(rows[0], images, detail)));
});

const deleteProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await db.select({ sellerId: properties.sellerId })
        .from(properties).where(eq(properties.id, id)).limit(1);

    if (!existing.length) throw new ApiError(404, 'Property not found');

    const { role, userId } = req.user;
    if (role !== 'admin' && existing[0].sellerId !== userId) {
        throw new ApiError(403, 'You do not own this listing');
    }

    await db.delete(properties).where(eq(properties.id, id));

    return res.status(200).json(new ApiResponse(200, { message: 'Property deleted' }));
});

export {
    getProperties, getPropertyBySlug, getPropertyById, getPropertiesByDistrict,
    createProperty, updateProperty, deleteProperty,
};
