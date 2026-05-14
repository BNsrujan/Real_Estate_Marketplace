import { pgTable, uuid, varchar, numeric, integer, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['buyer', 'agent', 'admin']);
export const propertyTypeEnum = pgEnum('property_type', [
    'house', 'site', 'agriculture land', 'commercial space', 'apartment', 'commercial plots',
]);
export const listingTypeEnum = pgEnum('listing_type', ['sale', 'rent']);
export const propertyStatusEnum = pgEnum('property_status', ['active', 'sold', 'rented']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).unique().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('buyer'),
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
    title: varchar('title', { length: 255 }).notNull(),
    type: propertyTypeEnum('type').notNull(),
    priceLabel: varchar('price_label', { length: 50 }).notNull(),
    priceValue: numeric('price_value', { precision: 15, scale: 2 }).notNull(),
    sizeLabel: varchar('size_label', { length: 50 }).notNull(),
    sizeValue: numeric('size_value', { precision: 12, scale: 2 }),
    lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
    lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
    districtId: uuid('district_id').references(() => districts.id),
    listingType: listingTypeEnum('listing_type').default('sale'),
    status: propertyStatusEnum('status').default('active'),
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
