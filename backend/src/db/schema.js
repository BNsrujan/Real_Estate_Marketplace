import {
    pgTable, uuid, varchar, numeric, integer, boolean,
    timestamp, pgEnum, unique, text, jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';



export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'agent', 'admin']);

export const propertyTypeEnum = pgEnum('property_type', [
    'house', 'site', 'apartment', 'agriculture', 'commercial_space', 'commercial_plot',
]);

export const listingTypeEnum = pgEnum('listing_type', ['sale', 'rent', 'both']);

export const propertyStatusEnum = pgEnum('property_status', ['active', 'sold', 'rented']);

export const areaUnitEnum = pgEnum('area_unit', ['sqft', 'acres', 'guntas']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).unique().notNull(),
    name: varchar('name', { length: 201 }),   // full name = firstName + " " + lastName
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),  
    phone: varchar('phone', { length: 20 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    role: userRoleEnum('role').default('buyer'),
    isVerified: boolean('is_verified').default(false),
    isPro: boolean('is_pro').default(false),
    provider: varchar('provider', { length: 20 }).default('local'), // 'local' | 'google'
    googleId: varchar('google_id', { length: 255 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});


export const districts = pgTable('districts', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
    lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
});

export const properties = pgTable('properties', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 300 }).unique(),
    title: varchar('title', { length: 255 }).notNull(),
    type: propertyTypeEnum('type').notNull(),
    priceLabel: varchar('price_label', { length: 50 }).notNull(),
    priceValue: numeric('price_value', { precision: 15, scale: 2 }).notNull(),
    sizeLabel: varchar('size_label', { length: 50 }).notNull(),
    sizeValue: numeric('size_value', { precision: 12, scale: 2 }),
    areaUnit: areaUnitEnum('area_unit').default('sqft'),
    lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
    lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
    districtId: uuid('district_id').references(() => districts.id),
    city: varchar('city', { length: 100 }),
    taluk: varchar('taluk', { length: 100 }),
    listingType: listingTypeEnum('listing_type').default('sale'),
    status: propertyStatusEnum('status').default('active'),
    thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
    description: text('description'),
    features: jsonb('features').default(sql`'[]'::jsonb`),
    sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});


export const propertyImages = pgTable('property_images', {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
        .references(() => properties.id, { onDelete: 'cascade' })
        .notNull(),
    url: varchar('url', { length: 500 }).notNull(),
    alt: varchar('alt', { length: 255 }),
    displayOrder: integer('display_order').default(0),
});


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
    status: varchar('status', { length: 20 }).default('pending'), // pending | replied | closed
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});
