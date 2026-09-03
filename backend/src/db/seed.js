import 'dotenv/config';

import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';
import { db, pool } from './db.js';
import {
    districts, amenities, blogCategories, blogTags, users,
    properties, propertyResidentialDetails, propertyRoadInfo,
    propertyAgricultureDetails, propertyImages, propertyGeometries,
    propertyAmenities, savedProperties, enquiries, blogPosts, blogPostTags,
} from './schema.js';

const DEMO_PASSWORD = 'Password@123';
const SALT_ROUNDS = 10;

const TABLES_IN_TRUNCATION_ORDER = [
    'blog_post_tags', 'blog_posts', 'blog_tags', 'blog_categories',
    'enquiries', 'saved_properties', 'property_amenities', 'property_geometries',
    'property_images', 'property_agriculture_details', 'property_road_info',
    'property_residential_details', 'properties', 'amenities', 'districts', 'users',
];

const slugify = (value) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const propertyRef = (index) => `ND-${String(index + 1).padStart(5, '0')}`;

const DISTRICTS = [
    { name: 'Bangalore Urban', state: 'Karnataka', lat: '12.9716', lng: '77.5946' },
    { name: 'Mysuru', state: 'Karnataka', lat: '12.2958', lng: '76.6394' },
    { name: 'Dharwad', state: 'Karnataka', lat: '15.4589', lng: '75.0078' },
    { name: 'Davanagere', state: 'Karnataka', lat: '14.4663', lng: '75.9238' },
    { name: 'Ballari', state: 'Karnataka', lat: '15.1394', lng: '76.9214' },
    { name: 'Chitradurga', state: 'Karnataka', lat: '14.2251', lng: '76.3980' },
    { name: 'Mangaluru', state: 'Karnataka', lat: '12.9141', lng: '74.8560' },
    { name: 'Belagavi', state: 'Karnataka', lat: '15.8497', lng: '74.4977' },
];

const AMENITIES = [
    { name: 'Borewell', icon: 'droplet', category: 'infrastructure' },
    { name: 'Compound Wall', icon: 'brick-wall', category: 'infrastructure' },
    { name: 'Three Phase Power', icon: 'zap', category: 'infrastructure' },
    { name: 'Tar Road Access', icon: 'route', category: 'infrastructure' },
    { name: 'Covered Parking', icon: 'car', category: 'convenience' },
    { name: 'Lift', icon: 'move-vertical', category: 'convenience' },
    { name: 'Power Backup', icon: 'battery-charging', category: 'convenience' },
    { name: 'Piped Water', icon: 'pipette', category: 'convenience' },
    { name: 'Gated Security', icon: 'shield', category: 'safety' },
    { name: 'CCTV Surveillance', icon: 'cctv', category: 'safety' },
    { name: 'Fire Safety', icon: 'flame', category: 'safety' },
    { name: 'Rainwater Harvesting', icon: 'cloud-rain', category: 'nature' },
    { name: 'Landscaped Garden', icon: 'trees', category: 'nature' },
    { name: 'Lake View', icon: 'waves', category: 'nature' },
    { name: 'Near School', icon: 'graduation-cap', category: 'nearby' },
    { name: 'Near Hospital', icon: 'cross', category: 'nearby' },
    { name: 'Near Metro', icon: 'train-front', category: 'nearby' },
    { name: 'Near Highway', icon: 'milestone', category: 'nearby' },
];

const BLOG_CATEGORIES = [
    { name: 'Buying Guides', slug: 'buying-guides' },
    { name: 'Land & Legal', slug: 'land-and-legal' },
    { name: 'Market Trends', slug: 'market-trends' },
    { name: 'Agriculture', slug: 'agriculture' },
];

const BLOG_TAGS = [
    { name: 'RTC', slug: 'rtc' },
    { name: 'Khata', slug: 'khata' },
    { name: 'Home Loan', slug: 'home-loan' },
    { name: 'Site Purchase', slug: 'site-purchase' },
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'Farmland', slug: 'farmland' },
];

const USERS = [
    { username: 'admin_nd', name: 'Registry Admin', email: 'admin@nammadharani.test', role: 'admin', phone: '+919845000001', isVerified: true, isPro: true },
    { username: 'lakshmi_agent', name: 'Lakshmi Rao', email: 'lakshmi@nammadharani.test', role: 'agent', phone: '+919845000002', isVerified: true, isPro: true },
    { username: 'imran_agent', name: 'Imran Sheikh', email: 'imran@nammadharani.test', role: 'agent', phone: '+919845000003', isVerified: true },
    { username: 'ravi_seller', name: 'Ravi Gowda', email: 'ravi@nammadharani.test', role: 'seller', phone: '+919845000004', isVerified: true },
    { username: 'sunitha_seller', name: 'Sunitha Hegde', email: 'sunitha@nammadharani.test', role: 'seller', phone: '+919845000005' },
    { username: 'mahesh_seller', name: 'Mahesh Patil', email: 'mahesh@nammadharani.test', role: 'seller', phone: '+919845000006', isVerified: true },
    { username: 'anita_buyer', name: 'Anita Desai', email: 'anita@nammadharani.test', role: 'buyer', phone: '+919845000007', isVerified: true },
    { username: 'kiran_buyer', name: 'Kiran Kumar', email: 'kiran@nammadharani.test', role: 'buyer', phone: '+919845000008' },
    { username: 'farah_buyer', name: 'Farah Noor', email: 'farah@nammadharani.test', role: 'buyer', phone: '+919845000009' },
];

const PROPERTIES = [
    {
        title: 'Four Bedroom Villa in Whitefield', type: 'house', listingType: 'sale', status: 'active',
        priceLabel: '2.4 Cr', priceValue: '24000000.00', expectedPrice: '25000000.00',
        sizeLabel: '3200 sqft', sizeValue: '3200.00', areaUnit: 'sqft',
        district: 'Bangalore Urban', city: 'Bengaluru', taluk: 'Bangalore East',
        address: 'Palm Meadows Road, Whitefield', lat: '12.9698000', lng: '77.7500000',
        facing: 'East', condition: 'Ready to move', documentStatus: 'A-Khata, clear title',
        landUse: 'Residential', roadAccess: true, isFeatured: true, seller: 'ravi_seller',
        description: 'A four bedroom villa inside a gated community with a private garden, covered parking for two cars and a rooftop terrace. Walking distance to two international schools.',
        features: ['Modular kitchen', 'Rooftop terrace', 'Servant quarters'],
        residential: { bhkLabel: '4 BHK', bedrooms: 4, bathrooms: 4, balconies: 3, floors: 2, floorNumber: 0, furnishedStatus: 'Semi-furnished' },
        road: { roadWidth: '40 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Covered Parking', 'Gated Security', 'Power Backup', 'Landscaped Garden', 'Near School'],
        images: ['whitefield-villa-front', 'whitefield-villa-living', 'whitefield-villa-garden'],
    },
    {
        title: 'Three Bedroom Apartment in Koramangala', type: 'apartment', listingType: 'sale', status: 'active',
        priceLabel: '1.1 Cr', priceValue: '11000000.00',
        sizeLabel: '1750 sqft', sizeValue: '1750.00', areaUnit: 'sqft',
        district: 'Bangalore Urban', city: 'Bengaluru', taluk: 'Bangalore South',
        address: '5th Block, Koramangala', lat: '12.9352000', lng: '77.6245000',
        facing: 'North East', condition: 'Ready to move', documentStatus: 'A-Khata',
        landUse: 'Residential', roadAccess: true, isFeatured: true, seller: 'sunitha_seller',
        description: 'Corner apartment on the ninth floor with cross ventilation on three sides, covered parking and a clubhouse shared across two towers.',
        features: ['Corner unit', 'Clubhouse access', 'Vaastu compliant'],
        residential: { bhkLabel: '3 BHK', bedrooms: 3, bathrooms: 3, balconies: 2, floors: 14, floorNumber: 9, furnishedStatus: 'Unfurnished' },
        road: { roadWidth: '60 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Lift', 'Power Backup', 'Gated Security', 'CCTV Surveillance', 'Near Metro'],
        images: ['koramangala-apartment-hall', 'koramangala-apartment-balcony'],
    },
    {
        title: 'Grade A Office Floor on MG Road', type: 'commercial_space', listingType: 'rent', status: 'active',
        priceLabel: '4.2 L / month', priceValue: '420000.00',
        sizeLabel: '4000 sqft', sizeValue: '4000.00', areaUnit: 'sqft',
        district: 'Bangalore Urban', city: 'Bengaluru', taluk: 'Bangalore Central',
        address: 'Trinity Circle, MG Road', lat: '12.9757000', lng: '77.6011000',
        facing: 'West', condition: 'Warm shell', documentStatus: 'Commercial occupancy certificate',
        landUse: 'Commercial', roadAccess: true, seller: 'lakshmi_agent',
        description: 'Full floor plate with a glass facade, dedicated service lift and twenty four hour building security. Metro entrance is ninety metres from the lobby.',
        features: ['Full floor plate', 'Service lift', '24x7 access'],
        road: { roadWidth: '80 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Lift', 'Power Backup', 'Fire Safety', 'CCTV Surveillance', 'Near Metro'],
        images: ['mg-road-office-floor', 'mg-road-office-lobby'],
    },
    {
        title: 'BDA Approved Site in Sarjapur', type: 'site', listingType: 'sale', status: 'active',
        priceLabel: '85 L', priceValue: '8500000.00',
        sizeLabel: '1200 sqft', sizeValue: '1200.00', areaUnit: 'sqft',
        district: 'Bangalore Urban', city: 'Bengaluru', taluk: 'Anekal',
        address: 'Sompura Gate, Sarjapur Road', lat: '12.8598000', lng: '77.7878000',
        facing: 'North', documentStatus: 'BDA approved, A-Khata', landUse: 'Residential',
        siteDimensions: '30 x 40', roadAccess: true, seller: 'ravi_seller',
        description: 'North facing corner site in a layout with underground drainage and street lighting already laid. Two sides open with a thirty foot road on the front.',
        features: ['Corner site', 'Underground drainage', 'Street lighting'],
        road: { roadWidth: '30 ft', roadType: 'Concrete', roadFacing: true },
        amenities: ['Compound Wall', 'Tar Road Access', 'Three Phase Power', 'Near School'],
        images: ['sarjapur-site-plot'],
    },
    {
        title: 'Irrigated Farmland near Kanakapura', type: 'agriculture', listingType: 'sale', status: 'active',
        priceLabel: '1.6 Cr', priceValue: '16000000.00',
        sizeLabel: '4 acres', sizeValue: '4.00', areaUnit: 'acres',
        district: 'Bangalore Urban', city: 'Kanakapura', taluk: 'Kanakapura',
        address: 'Harohalli Hobli', lat: '12.5460000', lng: '77.4200000',
        facing: 'South', documentStatus: 'RTC in seller name, no encumbrance',
        landUse: 'Agriculture', roadAccess: true, seller: 'mahesh_seller',
        description: 'Four acres of level farmland with a working borewell, drip irrigation across three acres and an existing coconut plantation of about two hundred trees.',
        features: ['Coconut plantation', 'Drip irrigation', 'Farm shed'],
        agriculture: { waterSource: 'Borewell, 6 inch, 480 ft', soilType: 'Red loamy', surveyNumber: '142/3B' },
        road: { roadWidth: '20 ft', roadType: 'Mud', roadFacing: false },
        amenities: ['Borewell', 'Three Phase Power', 'Rainwater Harvesting'],
        images: ['kanakapura-farmland-wide', 'kanakapura-farmland-borewell'],
    },
    {
        title: 'Independent House in Jayanagar', type: 'house', listingType: 'sale', status: 'sold',
        priceLabel: '3.5 Cr', priceValue: '35000000.00',
        sizeLabel: '2800 sqft', sizeValue: '2800.00', areaUnit: 'sqft',
        district: 'Bangalore Urban', city: 'Bengaluru', taluk: 'Bangalore South',
        address: '4th Block, Jayanagar', lat: '12.9258000', lng: '77.5830000',
        facing: 'East', condition: 'Ready to move', documentStatus: 'A-Khata',
        landUse: 'Residential', roadAccess: true, seller: 'sunitha_seller',
        description: 'Two storey independent house on a thirty by fifty site with a mature garden, rented ground floor and an independent staircase to the first floor.',
        features: ['Rental income', 'Mature garden', 'Independent staircase'],
        residential: { bhkLabel: '5 BHK', bedrooms: 5, bathrooms: 4, balconies: 2, floors: 2, floorNumber: 0, furnishedStatus: 'Semi-furnished' },
        road: { roadWidth: '40 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Covered Parking', 'Landscaped Garden', 'Near Hospital', 'Piped Water'],
        images: ['jayanagar-house-front'],
    },
    {
        title: 'Two Bedroom Flat near Infosys Campus', type: 'apartment', listingType: 'rent', status: 'rented',
        priceLabel: '32 K / month', priceValue: '32000.00',
        sizeLabel: '1150 sqft', sizeValue: '1150.00', areaUnit: 'sqft',
        district: 'Mysuru', city: 'Mysuru', taluk: 'Mysuru',
        address: 'Hebbal Industrial Area', lat: '12.3510000', lng: '76.6100000',
        facing: 'North', condition: 'Ready to move', documentStatus: 'E-Khata',
        landUse: 'Residential', roadAccess: true, seller: 'imran_agent',
        description: 'Two bedroom flat on the fourth floor of a lift building, five minutes from the Infosys Mysuru campus gate. Rent includes one covered parking slot.',
        features: ['Near IT campus', 'Covered parking', 'Piped gas'],
        residential: { bhkLabel: '2 BHK', bedrooms: 2, bathrooms: 2, balconies: 1, floors: 6, floorNumber: 4, furnishedStatus: 'Fully furnished' },
        road: { roadWidth: '40 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Lift', 'Power Backup', 'Gated Security', 'Near Hospital'],
        images: ['mysuru-flat-hall'],
    },
    {
        title: 'Heritage Bungalow Plot in Mysuru', type: 'plot', listingType: 'sale', status: 'active',
        priceLabel: '2.9 Cr', priceValue: '29000000.00',
        sizeLabel: '9600 sqft', sizeValue: '9600.00', areaUnit: 'sqft',
        district: 'Mysuru', city: 'Mysuru', taluk: 'Mysuru',
        address: 'Nazarbad Main Road', lat: '12.3050000', lng: '76.6600000',
        facing: 'West', documentStatus: 'Clear title, MUDA approved', landUse: 'Residential',
        siteDimensions: '80 x 120', roadAccess: true, isFeatured: true, seller: 'lakshmi_agent',
        description: 'Large plot in an established residential quarter with mature rain trees on the boundary. Suitable for a single bungalow or a boutique guest house.',
        features: ['Mature trees', 'Wide frontage', 'Heritage quarter'],
        road: { roadWidth: '60 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Compound Wall', 'Piped Water', 'Near Hospital'],
        images: ['mysuru-plot-frontage'],
    },
    {
        title: 'Warehouse Land on Tumkur Highway', type: 'commercial_plot', listingType: 'sale', status: 'active',
        priceLabel: '5.4 Cr', priceValue: '54000000.00',
        sizeLabel: '2 acres', sizeValue: '2.00', areaUnit: 'acres',
        district: 'Bangalore Urban', city: 'Nelamangala', taluk: 'Nelamangala',
        address: 'NH-48 Service Road', lat: '13.0990000', lng: '77.3940000',
        facing: 'North', documentStatus: 'Converted, industrial use permitted',
        landUse: 'Industrial', roadAccess: true, seller: 'mahesh_seller',
        description: 'Two acres of converted land abutting the Tumkur highway service road, suitable for warehousing or a logistics yard. Container trailers can turn on site.',
        features: ['Highway frontage', 'Converted land', 'Trailer access'],
        road: { roadWidth: '100 ft', roadType: 'Concrete', roadFacing: true },
        amenities: ['Three Phase Power', 'Tar Road Access', 'Near Highway'],
        images: ['tumkur-warehouse-land'],
    },
    {
        title: 'Riverside Farm Plot in Dharwad', type: 'agriculture', listingType: 'sale', status: 'active',
        priceLabel: '48 L', priceValue: '4800000.00',
        sizeLabel: '30 guntas', sizeValue: '30.00', areaUnit: 'guntas',
        district: 'Dharwad', city: 'Dharwad', taluk: 'Kalghatgi',
        address: 'Bennihalla Bank', lat: '15.3400000', lng: '74.9700000',
        facing: 'East', documentStatus: 'RTC clear, Form 9 available',
        landUse: 'Agriculture', roadAccess: false, seller: 'ravi_seller',
        description: 'Thirty guntas on the bank of the Bennihalla with black cotton soil and an open well. Currently under a single season cotton crop.',
        features: ['River frontage', 'Open well', 'Black cotton soil'],
        agriculture: { waterSource: 'Open well and canal', soilType: 'Black cotton', surveyNumber: '77/2' },
        road: { roadWidth: '12 ft', roadType: 'Mud', roadFacing: false },
        amenities: ['Rainwater Harvesting', 'Lake View'],
        images: ['dharwad-farm-riverside'],
    },
    {
        title: 'Sea Facing Apartment in Mangaluru', type: 'apartment', listingType: 'sale', status: 'active',
        priceLabel: '1.85 Cr', priceValue: '18500000.00',
        sizeLabel: '2100 sqft', sizeValue: '2100.00', areaUnit: 'sqft',
        district: 'Mangaluru', city: 'Mangaluru', taluk: 'Mangaluru',
        address: 'Ullal Beach Road', lat: '12.8200000', lng: '74.8400000',
        facing: 'West', condition: 'Ready to move', documentStatus: 'Occupancy certificate issued',
        landUse: 'Residential', roadAccess: true, isFeatured: true, seller: 'imran_agent',
        description: 'Twelfth floor apartment with an unobstructed view of the Arabian Sea from the living room and both bedrooms. Sunset visible year round from the balcony.',
        features: ['Sea view', 'Corner unit', 'Two covered parkings'],
        residential: { bhkLabel: '3 BHK', bedrooms: 3, bathrooms: 3, balconies: 2, floors: 16, floorNumber: 12, furnishedStatus: 'Semi-furnished' },
        road: { roadWidth: '40 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Lift', 'Power Backup', 'Gated Security', 'Lake View', 'Fire Safety'],
        images: ['mangaluru-sea-apartment', 'mangaluru-sea-balcony'],
    },
    {
        title: 'Row House in Belagavi Cantonment', type: 'villa', listingType: 'both', status: 'active',
        priceLabel: '1.15 Cr', priceValue: '11500000.00',
        sizeLabel: '1900 sqft', sizeValue: '1900.00', areaUnit: 'sqft',
        district: 'Belagavi', city: 'Belagavi', taluk: 'Belagavi',
        address: 'Camp Road, Cantonment', lat: '15.8600000', lng: '74.5000000',
        facing: 'South East', condition: 'Ready to move', documentStatus: 'Clear title',
        landUse: 'Residential', roadAccess: true, seller: 'sunitha_seller',
        description: 'End unit row house in a nine house enclave with a private rear courtyard, solar water heating and a dedicated visitor parking bay.',
        features: ['End unit', 'Private courtyard', 'Solar water heating'],
        residential: { bhkLabel: '3 BHK', bedrooms: 3, bathrooms: 3, balconies: 2, floors: 2, floorNumber: 0, furnishedStatus: 'Unfurnished' },
        road: { roadWidth: '30 ft', roadType: 'Tar', roadFacing: true },
        amenities: ['Covered Parking', 'Gated Security', 'Landscaped Garden', 'Near School'],
        images: ['belagavi-rowhouse-front'],
    },
];

const BLOG_POSTS = [
    {
        title: 'How to read an RTC before buying farmland',
        category: 'land-and-legal', author: 'admin_nd', status: 'published',
        tags: ['rtc', 'farmland'],
        excerpt: 'The Record of Rights, Tenancy and Crops tells you who owns the land, what grows on it and whether anyone else has a claim. Here is how to read one line by line.',
        body: 'Every agricultural survey number in Karnataka carries an RTC. The first block names the owner and the extent held. The second block records the crop for each season. The third block, the one most buyers skip, lists encumbrances and tenancy claims. Read the third block first. A clean extent with a pending tenancy entry is not a clean purchase, and the mutation register at the village accountant office will tell you when the entry was last changed.',
    },
    {
        title: 'A-Khata and B-Khata, explained without the jargon',
        category: 'land-and-legal', author: 'lakshmi_agent', status: 'published',
        tags: ['khata', 'bangalore'],
        excerpt: 'A Khata is a municipal account, not a title document. Knowing which kind you hold decides whether you can build, borrow or sell without friction.',
        body: 'An A-Khata property sits fully within the municipal record: property tax is assessed, building plans can be sanctioned and most banks will lend against it. A B-Khata property is recorded separately for tax collection but is not recognised for plan sanction. Converting from B to A requires the underlying land to be converted from agricultural use and all betterment charges to be cleared. Buyers routinely underestimate how long that takes.',
    },
    {
        title: 'What a site visit should actually cover',
        category: 'buying-guides', author: 'imran_agent', status: 'published',
        tags: ['site-purchase'],
        excerpt: 'Ten minutes on the plot tells you more than ten listings online. A short checklist for the visit itself.',
        body: 'Walk the boundary and count your paces against the stated dimensions. Look for the survey stones at each corner. Check which direction the water drains after rain, and whether the neighbouring plots are built up or vacant. Ask who maintains the approach road. Photograph the electricity pole nearest the plot and note its number. These details are cheap to collect on the day and expensive to discover later.',
    },
    {
        title: 'Where Bengaluru prices moved this quarter',
        category: 'market-trends', author: 'admin_nd', status: 'published',
        tags: ['bangalore', 'home-loan'],
        excerpt: 'Movement concentrated along the eastern corridor while the north held flat. A short read of the quarter.',
        body: 'Transaction volumes along Sarjapur and Whitefield rose against the previous quarter, driven mostly by ready to move inventory rather than new launches. The northern corridor towards the airport held flat on price while absorbing more supply. Rental yields stayed in the familiar three to three and a half per cent band across both corridors.',
    },
    {
        title: 'Drip irrigation subsidies for small holdings',
        category: 'agriculture', author: 'mahesh_seller', status: 'draft',
        tags: ['farmland'],
        excerpt: 'State horticulture subsidies can cover a meaningful share of drip installation for holdings under five acres.',
        body: 'Applications run through the taluk horticulture office and are assessed on holding size and existing water source. Keep the borewell yield certificate and the RTC extract ready before applying; incomplete applications are the most common reason for delay.',
    },
];

const ENQUIRIES = [
    { property: 0, buyer: 'anita_buyer', status: 'pending', phone: '+919845000007', message: 'Is the villa still available for a site visit this weekend? I can come Saturday morning.' },
    { property: 0, buyer: 'kiran_buyer', status: 'replied', phone: '+919845000008', message: 'What is the maintenance charge per month in this community, and is the corpus fund already paid?' },
    { property: 1, buyer: 'farah_buyer', status: 'pending', phone: '+919845000009', message: 'Could you share the floor plan and the exact carpet area? Also is the parking covered?' },
    { property: 3, buyer: 'anita_buyer', status: 'closed', phone: '+919845000007', message: 'Has the layout received the final BDA release order? I would like to see the approval copy.' },
    { property: 4, buyer: 'kiran_buyer', status: 'pending', phone: '+919845000008', message: 'What is the current borewell yield in inches, and does the drip system cover the coconut plantation?' },
    { property: 10, buyer: 'farah_buyer', status: 'replied', phone: '+919845000009', message: 'Is the sea view protected by any building restriction on the plot in front?' },
    { property: 7, buyer: 'anita_buyer', status: 'pending', phone: '+919845000007', message: 'Are the rain trees on the boundary protected? I would want to retain them.' },
];

const SAVED = [
    { buyer: 'anita_buyer', properties: [0, 3, 10] },
    { buyer: 'kiran_buyer', properties: [1, 4] },
    { buyer: 'farah_buyer', properties: [0, 7, 10, 1] },
];

const imageUrl = (name, width = 1200, height = 800) =>
    `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=${width}&h=${height}&q=70&ixid=${encodeURIComponent(name)}`;

async function truncateAll() {
    await db.execute(
        sql.raw(`TRUNCATE TABLE ${TABLES_IN_TRUNCATION_ORDER.join(', ')} RESTART IDENTITY CASCADE`),
    );
}

async function seed() {
    console.log('Clearing existing rows...');
    await truncateAll();

    console.log('Seeding districts, amenities and taxonomy...');
    const districtRows = await db.insert(districts).values(DISTRICTS).returning();
    const districtByName = new Map(districtRows.map((row) => [row.name, row]));

    const amenityRows = await db.insert(amenities)
        .values(AMENITIES.map((item) => ({ ...item, isCustom: false })))
        .returning();
    const amenityByName = new Map(amenityRows.map((row) => [row.name, row]));

    const categoryRows = await db.insert(blogCategories).values(BLOG_CATEGORIES).returning();
    const categoryBySlug = new Map(categoryRows.map((row) => [row.slug, row]));

    const tagRows = await db.insert(blogTags).values(BLOG_TAGS).returning();
    const tagBySlug = new Map(tagRows.map((row) => [row.slug, row]));

    console.log('Seeding users...');
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    const userRows = await db.insert(users)
        .values(USERS.map((user) => ({
            username: user.username,
            name: user.name,
            email: user.email,
            passwordHash,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified ?? false,
            isPro: user.isPro ?? false,
            provider: 'local',
        })))
        .returning();
    const userByUsername = new Map(userRows.map((row) => [row.username, row]));

    console.log('Seeding properties and their detail tables...');
    const propertyRows = await db.insert(properties)
        .values(PROPERTIES.map((item, index) => ({
            propertyRef: propertyRef(index),
            slug: slugify(`${item.title}-${propertyRef(index)}`),
            title: item.title,
            type: item.type,
            priceLabel: item.priceLabel,
            priceValue: item.priceValue,
            expectedPrice: item.expectedPrice ?? null,
            sizeLabel: item.sizeLabel,
            sizeValue: item.sizeValue,
            areaUnit: item.areaUnit,
            lat: item.lat,
            lng: item.lng,
            districtId: districtByName.get(item.district).id,
            city: item.city,
            taluk: item.taluk,
            address: item.address,
            listingType: item.listingType,
            status: item.status,
            thumbnailUrl: imageUrl(item.images[0]),
            description: item.description,
            features: item.features ?? [],
            facing: item.facing ?? null,
            siteDimensions: item.siteDimensions ?? null,
            landUse: item.landUse ?? null,
            documentStatus: item.documentStatus ?? null,
            condition: item.condition ?? null,
            contactNumber: userByUsername.get(item.seller).phone,
            roadAccess: item.roadAccess ?? false,
            isFeatured: item.isFeatured ?? false,
            sellerId: userByUsername.get(item.seller).id,
        })))
        .returning();

    const residentialValues = [];
    const roadValues = [];
    const agricultureValues = [];
    const imageValues = [];
    const geometryValues = [];
    const amenityLinks = [];

    PROPERTIES.forEach((item, index) => {
        const property = propertyRows[index];

        if (item.residential) {
            residentialValues.push({ propertyId: property.id, ...item.residential });
        }
        if (item.road) {
            roadValues.push({ propertyId: property.id, ...item.road });
        }
        if (item.agriculture) {
            agricultureValues.push({ propertyId: property.id, ...item.agriculture });
        }

        item.images.forEach((name, imageIndex) => {
            imageValues.push({
                propertyId: property.id,
                url: imageUrl(name),
                alt: `${item.title} photograph ${imageIndex + 1}`,
                displayOrder: imageIndex,
                isCover: imageIndex === 0,
                width: 1200,
                height: 800,
            });
        });

        const lat = Number(item.lat);
        const lng = Number(item.lng);
        const delta = 0.0016;

        geometryValues.push({
            propertyId: property.id,
            type: 'point',
            geojson: { type: 'Point', coordinates: [lng, lat] },
        });
        geometryValues.push({
            propertyId: property.id,
            type: 'polygon',
            geojson: {
                type: 'Polygon',
                coordinates: [[
                    [lng - delta, lat - delta],
                    [lng + delta, lat - delta],
                    [lng + delta, lat + delta],
                    [lng - delta, lat + delta],
                    [lng - delta, lat - delta],
                ]],
            },
        });

        (item.amenities ?? []).forEach((amenityName) => {
            amenityLinks.push({
                propertyId: property.id,
                amenityId: amenityByName.get(amenityName).id,
            });
        });
    });

    if (residentialValues.length) await db.insert(propertyResidentialDetails).values(residentialValues);
    if (roadValues.length) await db.insert(propertyRoadInfo).values(roadValues);
    if (agricultureValues.length) await db.insert(propertyAgricultureDetails).values(agricultureValues);
    if (imageValues.length) await db.insert(propertyImages).values(imageValues);
    if (geometryValues.length) await db.insert(propertyGeometries).values(geometryValues);
    if (amenityLinks.length) await db.insert(propertyAmenities).values(amenityLinks);

    console.log('Seeding watchlists and enquiries...');
    const savedValues = SAVED.flatMap((entry) =>
        entry.properties.map((propertyIndex) => ({
            userId: userByUsername.get(entry.buyer).id,
            propertyId: propertyRows[propertyIndex].id,
        })),
    );
    if (savedValues.length) await db.insert(savedProperties).values(savedValues);

    const enquiryValues = ENQUIRIES.map((entry) => ({
        propertyId: propertyRows[entry.property].id,
        buyerId: userByUsername.get(entry.buyer).id,
        message: entry.message,
        phone: entry.phone,
        status: entry.status,
    }));
    if (enquiryValues.length) await db.insert(enquiries).values(enquiryValues);

    console.log('Seeding blog posts...');
    const postRows = await db.insert(blogPosts)
        .values(BLOG_POSTS.map((post) => ({
            slug: slugify(post.title),
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            coverImage: imageUrl(slugify(post.title)),
            status: post.status,
            authorId: userByUsername.get(post.author).id,
            categoryId: categoryBySlug.get(post.category).id,
            publishedAt: post.status === 'published' ? new Date() : null,
        })))
        .returning();

    const postTagValues = BLOG_POSTS.flatMap((post, index) =>
        post.tags.map((tagSlug) => ({
            postId: postRows[index].id,
            tagId: tagBySlug.get(tagSlug).id,
        })),
    );
    if (postTagValues.length) await db.insert(blogPostTags).values(postTagValues);

    console.log('');
    console.log('Seed complete:');
    console.log(`  districts                     ${districtRows.length}`);
    console.log(`  amenities                     ${amenityRows.length}`);
    console.log(`  blog_categories               ${categoryRows.length}`);
    console.log(`  blog_tags                     ${tagRows.length}`);
    console.log(`  users                         ${userRows.length}`);
    console.log(`  properties                    ${propertyRows.length}`);
    console.log(`  property_residential_details  ${residentialValues.length}`);
    console.log(`  property_road_info            ${roadValues.length}`);
    console.log(`  property_agriculture_details  ${agricultureValues.length}`);
    console.log(`  property_images               ${imageValues.length}`);
    console.log(`  property_geometries           ${geometryValues.length}`);
    console.log(`  property_amenities            ${amenityLinks.length}`);
    console.log(`  saved_properties              ${savedValues.length}`);
    console.log(`  enquiries                     ${enquiryValues.length}`);
    console.log(`  blog_posts                    ${postRows.length}`);
    console.log(`  blog_post_tags                ${postTagValues.length}`);
    console.log('');
    console.log(`Every seeded account uses the password: ${DEMO_PASSWORD}`);
    console.log('Admin sign-in: admin@nammadharani.test');
}

seed()
    .then(async () => {
        await pool.end();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error('Seed failed:', error);
        await pool.end();
        process.exit(1);
    });
