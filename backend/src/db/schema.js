import {
    pgTable, uuid, varchar, numeric, integer, boolean,
    timestamp, pgEnum, unique, text, jsonb, index,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const now = () => sql`now()`;

export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'agent', 'admin']);

export const propertyTypeEnum = pgEnum('property_type', [
    'house', 'apartment', 'villa',
    'site', 'plot',
    'agriculture',
    'commercial_space', 'commercial_plot',
]);

export const listingTypeEnum = pgEnum('listing_type', ['sale', 'rent', 'both']);

export const propertyStatusEnum = pgEnum('property_status', ['active', 'sold', 'rented']);

export const areaUnitEnum = pgEnum('area_unit', ['sqft', 'acres', 'guntas']);

export const blogStatusEnum = pgEnum('blog_status', ['draft', 'published', 'archived']);

export const geometryTypeEnum = pgEnum('geometry_type', ['point', 'linestring', 'polygon']);

export const amenityCategoryEnum = pgEnum('amenity_category', [
    'infrastructure', 'convenience', 'safety', 'nature', 'nearby',
]);


export const districts = pgTable('districts', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
    lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
});

export const amenities = pgTable('amenities', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    icon: varchar('icon', { length: 100 }),
    category: amenityCategoryEnum('category'),
    isCustom: boolean('is_custom').default(false).notNull(),
});

export const blogCategories = pgTable('blog_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).unique().notNull(),
});

export const blogTags = pgTable('blog_tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).unique().notNull(),
});

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).unique().notNull(),
    name: varchar('name', { length: 201 }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    role: userRoleEnum('role').default('buyer'),
    isVerified: boolean('is_verified').default(false),
    isPro: boolean('is_pro').default(false),
    provider: varchar('provider', { length: 20 }).default('local'),
    googleId: varchar('google_id', { length: 255 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const properties = pgTable('properties', {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyRef: varchar('property_ref', { length: 20 }),
    slug: varchar('slug', { length: 300 }).unique(),
    title: varchar('title', { length: 255 }).notNull(),
    type: propertyTypeEnum('type').notNull(),
    priceLabel: varchar('price_label', { length: 50 }).notNull(),
    priceValue: numeric('price_value', { precision: 15, scale: 2 }).notNull(),
    expectedPrice: numeric('expected_price', { precision: 15, scale: 2 }),
    sizeLabel: varchar('size_label', { length: 50 }).notNull(),
    sizeValue: numeric('size_value', { precision: 12, scale: 2 }),
    areaUnit: areaUnitEnum('area_unit').default('sqft'),
    lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
    lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
    districtId: uuid('district_id').references(() => districts.id),
    city: varchar('city', { length: 100 }),
    taluk: varchar('taluk', { length: 100 }),
    address: varchar('address', { length: 500 }),
    listingType: listingTypeEnum('listing_type').default('sale'),
    status: propertyStatusEnum('status').default('active'),
    thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
    description: text('description'),
    features: jsonb('features').default(sql`'[]'::jsonb`),
    facing: varchar('facing', { length: 30 }),
    siteDimensions: varchar('site_dimensions', { length: 50 }),
    landUse: varchar('land_use', { length: 100 }),
    documentStatus: varchar('document_status', { length: 255 }),
    condition: varchar('condition', { length: 100 }),
    contactNumber: varchar('contact_number', { length: 20 }),
    roadAccess: boolean('road_access').default(false).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
}, (t) => [
    index('idx_properties_slug').on(t.slug),
    index('idx_properties_status').on(t.status),
    index('idx_properties_listing_type').on(t.listingType),
    index('idx_properties_type').on(t.type),
    index('idx_properties_district_id').on(t.districtId),
    index('idx_properties_seller_id').on(t.sellerId),
    index('idx_properties_is_featured').on(t.isFeatured),
    index('idx_properties_price_value').on(t.priceValue),
    index('idx_properties_latlng').on(t.lat, t.lng),
]);

export const propertyResidentialDetails = pgTable('property_residential_details', {
    propertyId: uuid('property_id')
        .primaryKey()
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    bhkLabel: varchar('bhk_label', { length: 20 }),
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    balconies: integer('balconies'),
    floors: integer('floors'),
    floorNumber: integer('floor_number'),
    furnishedStatus: varchar('furnished_status', { length: 30 }),
});

export const propertyRoadInfo = pgTable('property_road_info', {
    propertyId: uuid('property_id')
        .primaryKey()
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    roadWidth: varchar('road_width', { length: 50 }),
    roadType: varchar('road_type', { length: 50 }),
    roadFacing: boolean('road_facing'),
});

export const propertyAgricultureDetails = pgTable('property_agriculture_details', {
    propertyId: uuid('property_id')
        .primaryKey()
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    waterSource: varchar('water_source', { length: 100 }),
    soilType: varchar('soil_type', { length: 100 }),
    surveyNumber: varchar('survey_number', { length: 100 }),
});

export const propertyImages = pgTable('property_images', {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    url: varchar('url', { length: 500 }).notNull(),
    alt: varchar('alt', { length: 255 }),
    displayOrder: integer('display_order').default(0),
    isCover: boolean('is_cover').default(false),
    width: integer('width'),
    height: integer('height'),
}, (t) => [
    index('idx_property_images_property_order').on(t.propertyId, t.displayOrder),
]);

export const propertyGeometries = pgTable('property_geometries', {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    type: geometryTypeEnum('type').notNull(),
    geojson: jsonb('geojson').notNull(),
});

export const propertyAmenities = pgTable('property_amenities', {
    propertyId: uuid('property_id')
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    amenityId: uuid('amenity_id')
        .references(() => amenities.id, { onDelete: 'cascade' })
        .notNull(),
}, (t) => [
    primaryKey({ columns: [t.propertyId, t.amenityId] }),
]);

export const savedProperties = pgTable('saved_properties', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    propertyId: uuid('property_id')
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    savedAt: timestamp('saved_at', { withTimezone: true }).default(sql`now()`),
}, (t) => [unique().on(t.userId, t.propertyId)]);

export const enquiries = pgTable('enquiries', {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    buyerId: uuid('buyer_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    message: text('message').notNull(),
    phone: varchar('phone', { length: 20 }),
    status: varchar('status', { length: 20 }).default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const blogPosts = pgTable('blog_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 300 }).unique().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    excerpt: text('excerpt'),
    body: text('body'),
    coverImage: varchar('cover_image', { length: 500 }),
    status: blogStatusEnum('status').default('draft'),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    categoryId: uuid('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
}, (t) => [
    index('idx_blog_posts_slug').on(t.slug),
    index('idx_blog_posts_status').on(t.status),
    index('idx_blog_posts_author_id').on(t.authorId),
    index('idx_blog_posts_category_id').on(t.categoryId),
    index('idx_blog_posts_published_at').on(t.publishedAt),
]);

export const blogPostTags = pgTable('blog_post_tags', {
    postId: uuid('post_id')
        .references(() => blogPosts.id, { onDelete: 'cascade' })
        .notNull(),
    tagId: uuid('tag_id')
        .references(() => blogTags.id, { onDelete: 'cascade' })
        .notNull(),
}, (t) => [
    primaryKey({ columns: [t.postId, t.tagId] }),
]);
