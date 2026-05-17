import dotenv from 'dotenv';
dotenv.config();

import { db } from './db.js';
import { districts, properties, propertyImages } from './schema.js';

function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// ─── Districts (Karnataka only) ───────────────────────────────────────────────

const DISTRICTS_DATA = [
    { name: 'Bangalore',   state: 'Karnataka', lat: '12.9716', lng: '77.5946' },
    { name: 'Dharwad',     state: 'Karnataka', lat: '15.4589', lng: '75.0078' },
    { name: 'Davanagere',  state: 'Karnataka', lat: '14.4663', lng: '75.9238' },
    { name: 'Bellary',     state: 'Karnataka', lat: '15.1394', lng: '76.9214' },
    { name: 'Chitradurga', state: 'Karnataka', lat: '14.2251', lng: '76.3980' },
];

// ─── Properties ───────────────────────────────────────────────────────────────

const PROPERTIES_DATA = [

    // ── Bangalore (8 listings) ────────────────────────────────────────────────
    {
        title: 'Luxury Villa in Whitefield', type: 'house',
        priceLabel: '2.4 Cr', priceValue: '24000000',
        sizeLabel: '3200 sqft', sizeValue: '3200', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bangalore', taluk: 'Bangalore East',
        lat: '12.9698', lng: '77.7500', districtName: 'Bangalore',
        description: 'Spacious 4BHK villa in a gated community with pool and landscaped garden.',
    },
    {
        title: '3BHK Apartment in Koramangala', type: 'apartment',
        priceLabel: '1.1 Cr', priceValue: '11000000',
        sizeLabel: '1750 sqft', sizeValue: '1750', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bangalore', taluk: 'Bangalore South',
        lat: '12.9352', lng: '77.6245', districtName: 'Bangalore',
        description: 'Modern 3BHK in the heart of Koramangala with premium finishes.',
    },
    {
        title: 'Commercial Office Space in MG Road', type: 'commercial_space',
        priceLabel: '2.8 Cr', priceValue: '28000000',
        sizeLabel: '4000 sqft', sizeValue: '4000', areaUnit: 'sqft',
        listingType: 'rent', city: 'Bangalore', taluk: 'Bangalore Central',
        lat: '12.9757', lng: '77.6011', districtName: 'Bangalore',
        description: 'Grade-A office space with glass façade and 24x7 security on MG Road.',
    },
    {
        title: 'Residential Site in Sarjapur', type: 'site',
        priceLabel: '85 Lakhs', priceValue: '8500000',
        sizeLabel: '1200 sqft', sizeValue: '1200', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bangalore', taluk: 'Anekal',
        lat: '12.8598', lng: '77.7878', districtName: 'Bangalore',
        description: 'North-facing BDA-approved site in a fast-developing Sarjapur layout.',
    },
    {
        title: 'Independent House in Jayanagar', type: 'house',
        priceLabel: '3.5 Cr', priceValue: '35000000',
        sizeLabel: '2800 sqft', sizeValue: '2800', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bangalore', taluk: 'Bangalore South',
        lat: '12.9258', lng: '77.5830', districtName: 'Bangalore',
        description: 'Well-maintained G+1 independent house on a 30×40 site in Jayanagar 4th Block.',
    },
    {
        title: 'Studio Apartment in Electronic City', type: 'apartment',
        priceLabel: '38 Lakhs', priceValue: '3800000',
        sizeLabel: '580 sqft', sizeValue: '580', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bangalore', taluk: 'Anekal',
        lat: '12.8458', lng: '77.6603', districtName: 'Bangalore',
        description: 'Compact studio close to IT parks in Electronic City Phase 1.',
    },
    {
        title: 'Commercial Plot in Hebbal', type: 'commercial_plot',
        priceLabel: '1.9 Cr', priceValue: '19000000',
        sizeLabel: '2400 sqft', sizeValue: '2400', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bangalore', taluk: 'Bangalore North',
        lat: '13.0358', lng: '77.5970', districtName: 'Bangalore',
        description: 'Corner commercial plot on Outer Ring Road near Hebbal flyover.',
    },
    {
        title: 'Agriculture Land in Devanahalli', type: 'agriculture',
        priceLabel: '65 Lakhs', priceValue: '6500000',
        sizeLabel: '2 Acres', sizeValue: '2', areaUnit: 'acres',
        listingType: 'sale', city: 'Devanahalli', taluk: 'Devanahalli',
        lat: '13.2479', lng: '77.7173', districtName: 'Bangalore',
        description: 'Fertile red-soil agricultural land near BIAL with borewell.',
    },

    // ── Dharwad (6 listings) ──────────────────────────────────────────────────
    {
        title: 'Independent House in Hubli', type: 'house',
        priceLabel: '72 Lakhs', priceValue: '7200000',
        sizeLabel: '1800 sqft', sizeValue: '1800', areaUnit: 'sqft',
        listingType: 'sale', city: 'Hubli', taluk: 'Hubli',
        lat: '15.3647', lng: '75.1240', districtName: 'Dharwad',
        description: 'G+1 house with car parking and terrace in a prime Hubli locality.',
    },
    {
        title: '2BHK Apartment in Dharwad City', type: 'apartment',
        priceLabel: '48 Lakhs', priceValue: '4800000',
        sizeLabel: '1100 sqft', sizeValue: '1100', areaUnit: 'sqft',
        listingType: 'sale', city: 'Dharwad', taluk: 'Dharwad',
        lat: '15.4546', lng: '75.0135', districtName: 'Dharwad',
        description: 'Ready-to-move 2BHK near Karnataka University campus.',
    },
    {
        title: 'Commercial Space in Hubli CBD', type: 'commercial_space',
        priceLabel: '55 Lakhs', priceValue: '5500000',
        sizeLabel: '1400 sqft', sizeValue: '1400', areaUnit: 'sqft',
        listingType: 'rent', city: 'Hubli', taluk: 'Hubli',
        lat: '15.3600', lng: '75.1200', districtName: 'Dharwad',
        description: 'Ground-floor commercial space on the main Hubli CBD road.',
    },
    {
        title: 'Agriculture Land in Kundgol', type: 'agriculture',
        priceLabel: '28 Lakhs', priceValue: '2800000',
        sizeLabel: '3 Acres', sizeValue: '3', areaUnit: 'acres',
        listingType: 'sale', city: 'Kundgol', taluk: 'Kundgol',
        lat: '15.2564', lng: '75.2440', districtName: 'Dharwad',
        description: 'Black-soil farmland with canal irrigation and kutcha road access.',
    },
    {
        title: 'Residential Site near NTTF Hubli', type: 'site',
        priceLabel: '32 Lakhs', priceValue: '3200000',
        sizeLabel: '1000 sqft', sizeValue: '1000', areaUnit: 'sqft',
        listingType: 'sale', city: 'Hubli', taluk: 'Hubli',
        lat: '15.3720', lng: '75.1350', districtName: 'Dharwad',
        description: 'HDMC-approved residential plot in a new layout near NTTF.',
    },
    {
        title: 'Warehouse Plot on Gokul Road', type: 'commercial_plot',
        priceLabel: '90 Lakhs', priceValue: '9000000',
        sizeLabel: '5000 sqft', sizeValue: '5000', areaUnit: 'sqft',
        listingType: 'sale', city: 'Hubli', taluk: 'Hubli',
        lat: '15.3800', lng: '75.1430', districtName: 'Dharwad',
        description: 'Large industrial plot on Gokul Road, suitable for warehouse or showroom.',
    },

    // ── Davanagere (5 listings) ───────────────────────────────────────────────
    {
        title: 'House in Davanagere City', type: 'house',
        priceLabel: '58 Lakhs', priceValue: '5800000',
        sizeLabel: '1600 sqft', sizeValue: '1600', areaUnit: 'sqft',
        listingType: 'sale', city: 'Davanagere', taluk: 'Davanagere',
        lat: '14.4671', lng: '75.9227', districtName: 'Davanagere',
        description: 'Neat 3BHK house with open yard in a well-connected Davanagere locality.',
    },
    {
        title: '2BHK Apartment near P.J. Extension', type: 'apartment',
        priceLabel: '42 Lakhs', priceValue: '4200000',
        sizeLabel: '980 sqft', sizeValue: '980', areaUnit: 'sqft',
        listingType: 'sale', city: 'Davanagere', taluk: 'Davanagere',
        lat: '14.4700', lng: '75.9195', districtName: 'Davanagere',
        description: 'Affordable 2BHK in a gated complex close to P.J. Extension market.',
    },
    {
        title: 'Agriculture Land in Harihar', type: 'agriculture',
        priceLabel: '20 Lakhs', priceValue: '2000000',
        sizeLabel: '2.5 Acres', sizeValue: '2.5', areaUnit: 'acres',
        listingType: 'sale', city: 'Harihar', taluk: 'Harihar',
        lat: '14.5173', lng: '75.8007', districtName: 'Davanagere',
        description: 'Productive farmland near Tungabhadra river with drip-irrigation setup.',
    },
    {
        title: 'Commercial Space on NH-48', type: 'commercial_space',
        priceLabel: '68 Lakhs', priceValue: '6800000',
        sizeLabel: '2000 sqft', sizeValue: '2000', areaUnit: 'sqft',
        listingType: 'both', city: 'Davanagere', taluk: 'Davanagere',
        lat: '14.4750', lng: '75.9350', districtName: 'Davanagere',
        description: 'Prominent roadside commercial space on NH-48 with high footfall.',
    },
    {
        title: 'Residential Site in Shivaganga Layout', type: 'site',
        priceLabel: '18 Lakhs', priceValue: '1800000',
        sizeLabel: '800 sqft', sizeValue: '800', areaUnit: 'sqft',
        listingType: 'sale', city: 'Davanagere', taluk: 'Davanagere',
        lat: '14.4620', lng: '75.9280', districtName: 'Davanagere',
        description: 'CMC-approved east-facing site in Shivaganga Layout with road and drainage.',
    },

    // ── Bellary (5 listings) ──────────────────────────────────────────────────
    {
        title: 'Independent House in Bellary City', type: 'house',
        priceLabel: '62 Lakhs', priceValue: '6200000',
        sizeLabel: '1700 sqft', sizeValue: '1700', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bellary', taluk: 'Bellary',
        lat: '15.1492', lng: '76.9218', districtName: 'Bellary',
        description: 'Well-maintained house with tiled roof and large compound near city centre.',
    },
    {
        title: 'Iron Ore Belt Commercial Plot', type: 'commercial_plot',
        priceLabel: '1.2 Cr', priceValue: '12000000',
        sizeLabel: '6000 sqft', sizeValue: '6000', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bellary', taluk: 'Bellary',
        lat: '15.1600', lng: '76.9300', districtName: 'Bellary',
        description: 'Strategic commercial plot near the mining belt; ideal for logistics or trade.',
    },
    {
        title: 'Agriculture Land in Sandur', type: 'agriculture',
        priceLabel: '35 Lakhs', priceValue: '3500000',
        sizeLabel: '4 Acres', sizeValue: '4', areaUnit: 'acres',
        listingType: 'sale', city: 'Sandur', taluk: 'Sandur',
        lat: '15.0814', lng: '76.5574', districtName: 'Bellary',
        description: 'Red loamy soil land close to Sandur town with borewell and fencing.',
    },
    {
        title: '3BHK Apartment in Bellary', type: 'apartment',
        priceLabel: '55 Lakhs', priceValue: '5500000',
        sizeLabel: '1400 sqft', sizeValue: '1400', areaUnit: 'sqft',
        listingType: 'sale', city: 'Bellary', taluk: 'Bellary',
        lat: '15.1380', lng: '76.9180', districtName: 'Bellary',
        description: 'Newly constructed 3BHK apartment with modular kitchen and balcony.',
    },
    {
        title: 'Residential Site in Hospet', type: 'site',
        priceLabel: '22 Lakhs', priceValue: '2200000',
        sizeLabel: '1200 sqft', sizeValue: '1200', areaUnit: 'sqft',
        listingType: 'sale', city: 'Hospet', taluk: 'Hospet',
        lat: '15.2689', lng: '76.3877', districtName: 'Bellary',
        description: 'CMC-approved plot near Hospet town bus stand with clear title.',
    },

    // ── Chitradurga (5 listings) ───────────────────────────────────────────────
    {
        title: 'House in Chitradurga Town', type: 'house',
        priceLabel: '45 Lakhs', priceValue: '4500000',
        sizeLabel: '1500 sqft', sizeValue: '1500', areaUnit: 'sqft',
        listingType: 'sale', city: 'Chitradurga', taluk: 'Chitradurga',
        lat: '14.2299', lng: '76.3973', districtName: 'Chitradurga',
        description: 'Comfortable 3BHK house with bore water and UDS document near fort road.',
    },
    {
        title: 'Agriculture Land in Hiriyur', type: 'agriculture',
        priceLabel: '25 Lakhs', priceValue: '2500000',
        sizeLabel: '3 Acres', sizeValue: '3', areaUnit: 'acres',
        listingType: 'sale', city: 'Hiriyur', taluk: 'Hiriyur',
        lat: '13.9441', lng: '76.6173', districtName: 'Chitradurga',
        description: 'Dry-land converted to irrigation with drip-farming setup for groundnut.',
    },
    {
        title: '2BHK Apartment in Chitradurga', type: 'apartment',
        priceLabel: '32 Lakhs', priceValue: '3200000',
        sizeLabel: '950 sqft', sizeValue: '950', areaUnit: 'sqft',
        listingType: 'sale', city: 'Chitradurga', taluk: 'Chitradurga',
        lat: '14.2250', lng: '76.3950', districtName: 'Chitradurga',
        description: 'Affordable 2BHK in a newly developed apartment complex off NH-150.',
    },
    {
        title: 'Commercial Plot on NH-150', type: 'commercial_plot',
        priceLabel: '75 Lakhs', priceValue: '7500000',
        sizeLabel: '3600 sqft', sizeValue: '3600', areaUnit: 'sqft',
        listingType: 'sale', city: 'Chitradurga', taluk: 'Chitradurga',
        lat: '14.2350', lng: '76.4050', districtName: 'Chitradurga',
        description: 'Highway-facing commercial plot with high visibility on NH-150.',
    },
    {
        title: 'Residential Site in Holalkere', type: 'site',
        priceLabel: '12 Lakhs', priceValue: '1200000',
        sizeLabel: '900 sqft', sizeValue: '900', areaUnit: 'sqft',
        listingType: 'sale', city: 'Holalkere', taluk: 'Holalkere',
        lat: '14.0468', lng: '76.1843', districtName: 'Chitradurga',
        description: 'Town-panchayat approved site with water connection in Holalkere town.',
    },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
    console.log('Seeding districts...');
    await db.insert(districts).values(DISTRICTS_DATA).onConflictDoNothing();

    const allDistricts = await db.select().from(districts);
    const districtMap = Object.fromEntries(allDistricts.map((d) => [d.name, d.id]));
    console.log(`Districts ready: ${allDistricts.length}`);

    console.log('Clearing existing properties and images...');
    await db.delete(propertyImages);
    await db.delete(properties);

    console.log('Seeding properties...');

    const usedSlugs = new Set();
    const propertyValues = PROPERTIES_DATA.map(({ districtName, ...p }) => {
        let base = slugify(p.title);
        let slug = base;
        let n = 1;
        while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
        usedSlugs.add(slug);

        return {
            ...p,
            slug,
            districtId: districtMap[districtName] ?? null,
            features: [],
        };
    });

    const insertedProperties = await db
        .insert(properties)
        .values(propertyValues)
        .returning({ id: properties.id });

    console.log(`Properties inserted: ${insertedProperties.length}`);

    console.log('Seeding placeholder images...');
    const imageValues = insertedProperties.flatMap((p) => [
        { propertyId: p.id, url: '/property/image.png', alt: 'Property image 1', displayOrder: 0 },
        { propertyId: p.id, url: '/property/image.png', alt: 'Property image 2', displayOrder: 1 },
    ]);
    await db.insert(propertyImages).values(imageValues);

    console.log('Seed complete.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
