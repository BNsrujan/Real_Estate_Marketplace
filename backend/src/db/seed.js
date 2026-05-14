import dotenv from 'dotenv';
dotenv.config();

import { db } from './db.js';
import { districts, properties, propertyImages } from './schema.js';

const DISTRICTS_DATA = [
    { name: 'Bangalore', state: 'Karnataka', lat: '12.9716', lng: '77.5946' },
    { name: 'Mysore', state: 'Karnataka', lat: '12.2958', lng: '76.6394' },
    { name: 'Mangalore', state: 'Karnataka', lat: '12.8652', lng: '74.8664' },
    { name: 'Belgaum', state: 'Karnataka', lat: '15.8497', lng: '75.6499' },
    { name: 'Shimoga', state: 'Karnataka', lat: '13.7307', lng: '75.5678' },
    { name: 'Chennai', state: 'Tamil Nadu', lat: '13.0827', lng: '80.2707' },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: '11.0081', lng: '76.9877' },
    { name: 'Salem', state: 'Tamil Nadu', lat: '11.6643', lng: '78.1460' },
    { name: 'Hyderabad', state: 'Telangana', lat: '17.3850', lng: '78.4867' },
    { name: 'Warangal', state: 'Telangana', lat: '17.9689', lng: '79.5941' },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: '17.6869', lng: '83.2185' },
    { name: 'Vijayawada', state: 'Andhra Pradesh', lat: '16.5062', lng: '80.6480' },
    { name: 'Mumbai', state: 'Maharashtra', lat: '19.0760', lng: '72.8777' },
    { name: 'Pune', state: 'Maharashtra', lat: '18.5204', lng: '73.8567' },
    { name: 'Nagpur', state: 'Maharashtra', lat: '21.1458', lng: '79.0882' },
    { name: 'Delhi', state: 'Delhi', lat: '28.7041', lng: '77.1025' },
    { name: 'Gurgaon', state: 'Haryana', lat: '28.4595', lng: '77.0266' },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: '26.8467', lng: '80.9462' },
    { name: 'Kanpur', state: 'Uttar Pradesh', lat: '26.4499', lng: '80.3319' },
    { name: 'Ahmedabad', state: 'Gujarat', lat: '23.0225', lng: '72.5714' },
    { name: 'Surat', state: 'Gujarat', lat: '21.1702', lng: '72.8311' },
    { name: 'Jaipur', state: 'Rajasthan', lat: '26.9124', lng: '75.7873' },
    { name: 'Jodhpur', state: 'Rajasthan', lat: '26.2389', lng: '73.0243' },
    { name: 'Kolkata', state: 'West Bengal', lat: '22.5726', lng: '88.3639' },
    { name: 'Darjeeling', state: 'West Bengal', lat: '27.0410', lng: '88.2663' },
    { name: 'Kochi', state: 'Kerala', lat: '9.9312', lng: '76.2673' },
    { name: 'Thiruvananthapuram', state: 'Kerala', lat: '8.5241', lng: '76.9366' },
    { name: 'Chandigarh', state: 'Punjab', lat: '30.7333', lng: '76.7794' },
    { name: 'Ludhiana', state: 'Punjab', lat: '30.9010', lng: '75.8573' },
    { name: 'Faridabad', state: 'Haryana', lat: '28.4089', lng: '77.3178' },
];

const PROPERTIES_DATA = [
    { title: 'Luxury Villa in Bangalore', type: 'house', priceLabel: '1.2 Cr', priceValue: '12000000', sizeLabel: '2400 sqft', sizeValue: '2400', lat: '12.9716', lng: '77.5946', districtName: 'Bangalore' },
    { title: 'Apartment in Mysore', type: 'apartment', priceLabel: '95 Lakhs', priceValue: '9500000', sizeLabel: '1800 sqft', sizeValue: '1800', lat: '12.2958', lng: '76.6394', districtName: 'Mysore' },
    { title: 'Commercial Space in Mangalore', type: 'commercial space', priceLabel: '2.5 Cr', priceValue: '25000000', sizeLabel: '3500 sqft', sizeValue: '3500', lat: '12.8652', lng: '74.8664', districtName: 'Mangalore' },
    { title: 'Agricultural Land in Belgaum', type: 'agriculture land', priceLabel: '45 Lakhs', priceValue: '4500000', sizeLabel: '5 Acres', sizeValue: '217800', lat: '15.8497', lng: '75.6499', districtName: 'Belgaum' },
    { title: 'Commercial Plot in Shimoga', type: 'commercial plots', priceLabel: '1.5 Cr', priceValue: '15000000', sizeLabel: '2000 sqft', sizeValue: '2000', lat: '13.7307', lng: '75.5678', districtName: 'Shimoga' },
    { title: 'House in Chennai', type: 'house', priceLabel: '2.0 Cr', priceValue: '20000000', sizeLabel: '2800 sqft', sizeValue: '2800', lat: '13.0827', lng: '80.2707', districtName: 'Chennai' },
    { title: 'Apartment in Coimbatore', type: 'apartment', priceLabel: '1.1 Cr', priceValue: '11000000', sizeLabel: '1600 sqft', sizeValue: '1600', lat: '11.0081', lng: '76.9877', districtName: 'Coimbatore' },
    { title: 'Commercial Space in Salem', type: 'commercial space', priceLabel: '85 Lakhs', priceValue: '8500000', sizeLabel: '2200 sqft', sizeValue: '2200', lat: '11.6643', lng: '78.1460', districtName: 'Salem' },
    { title: 'Luxury Villa in Hyderabad', type: 'house', priceLabel: '3.0 Cr', priceValue: '30000000', sizeLabel: '3200 sqft', sizeValue: '3200', lat: '17.3850', lng: '78.4867', districtName: 'Hyderabad' },
    { title: 'Agricultural Land in Warangal', type: 'agriculture land', priceLabel: '35 Lakhs', priceValue: '3500000', sizeLabel: '4 Acres', sizeValue: '174240', lat: '17.9689', lng: '79.5941', districtName: 'Warangal' },
    { title: 'Apartment in Visakhapatnam', type: 'apartment', priceLabel: '1.3 Cr', priceValue: '13000000', sizeLabel: '1900 sqft', sizeValue: '1900', lat: '17.6869', lng: '83.2185', districtName: 'Visakhapatnam' },
    { title: 'Commercial Plot in Vijayawada', type: 'commercial plots', priceLabel: '95 Lakhs', priceValue: '9500000', sizeLabel: '1800 sqft', sizeValue: '1800', lat: '16.5062', lng: '80.6480', districtName: 'Vijayawada' },
    { title: 'House in Mumbai', type: 'house', priceLabel: '4.5 Cr', priceValue: '45000000', sizeLabel: '2600 sqft', sizeValue: '2600', lat: '19.0760', lng: '72.8777', districtName: 'Mumbai' },
    { title: 'Commercial Space in Pune', type: 'commercial space', priceLabel: '2.8 Cr', priceValue: '28000000', sizeLabel: '3100 sqft', sizeValue: '3100', lat: '18.5204', lng: '73.8567', districtName: 'Pune' },
    { title: 'Apartment in Nagpur', type: 'apartment', priceLabel: '75 Lakhs', priceValue: '7500000', sizeLabel: '1400 sqft', sizeValue: '1400', lat: '21.1458', lng: '79.0882', districtName: 'Nagpur' },
    { title: 'Luxury Villa in Delhi', type: 'house', priceLabel: '5.0 Cr', priceValue: '50000000', sizeLabel: '3500 sqft', sizeValue: '3500', lat: '28.7041', lng: '77.1025', districtName: 'Delhi' },
    { title: 'Commercial Space in Gurgaon', type: 'commercial space', priceLabel: '3.2 Cr', priceValue: '32000000', sizeLabel: '3800 sqft', sizeValue: '3800', lat: '28.4595', lng: '77.0266', districtName: 'Gurgaon' },
    { title: 'Apartment in Lucknow', type: 'apartment', priceLabel: '85 Lakhs', priceValue: '8500000', sizeLabel: '1700 sqft', sizeValue: '1700', lat: '26.8467', lng: '80.9462', districtName: 'Lucknow' },
    { title: 'Agricultural Land in Kanpur', type: 'agriculture land', priceLabel: '40 Lakhs', priceValue: '4000000', sizeLabel: '3 Acres', sizeValue: '130680', lat: '26.4499', lng: '80.3319', districtName: 'Kanpur' },
    { title: 'House in Ahmedabad', type: 'house', priceLabel: '1.8 Cr', priceValue: '18000000', sizeLabel: '2200 sqft', sizeValue: '2200', lat: '23.0225', lng: '72.5714', districtName: 'Ahmedabad' },
    { title: 'Commercial Plot in Surat', type: 'commercial plots', priceLabel: '1.2 Cr', priceValue: '12000000', sizeLabel: '2100 sqft', sizeValue: '2100', lat: '21.1702', lng: '72.8311', districtName: 'Surat' },
    { title: 'Luxury Villa in Jaipur', type: 'house', priceLabel: '2.2 Cr', priceValue: '22000000', sizeLabel: '2800 sqft', sizeValue: '2800', lat: '26.9124', lng: '75.7873', districtName: 'Jaipur' },
    { title: 'Apartment in Jodhpur', type: 'apartment', priceLabel: '65 Lakhs', priceValue: '6500000', sizeLabel: '1500 sqft', sizeValue: '1500', lat: '26.2389', lng: '73.0243', districtName: 'Jodhpur' },
    { title: 'House in Kolkata', type: 'house', priceLabel: '1.5 Cr', priceValue: '15000000', sizeLabel: '2100 sqft', sizeValue: '2100', lat: '22.5726', lng: '88.3639', districtName: 'Kolkata' },
    { title: 'Agricultural Land in Darjeeling', type: 'agriculture land', priceLabel: '25 Lakhs', priceValue: '2500000', sizeLabel: '2 Acres', sizeValue: '87120', lat: '27.0410', lng: '88.2663', districtName: 'Darjeeling' },
    { title: 'House in Kochi', type: 'house', priceLabel: '1.9 Cr', priceValue: '19000000', sizeLabel: '2300 sqft', sizeValue: '2300', lat: '9.9312', lng: '76.2673', districtName: 'Kochi' },
    { title: 'Apartment in Thiruvananthapuram', type: 'apartment', priceLabel: '1.1 Cr', priceValue: '11000000', sizeLabel: '1800 sqft', sizeValue: '1800', lat: '8.5241', lng: '76.9366', districtName: 'Thiruvananthapuram' },
    { title: 'House in Chandigarh', type: 'house', priceLabel: '1.6 Cr', priceValue: '16000000', sizeLabel: '2000 sqft', sizeValue: '2000', lat: '30.7333', lng: '76.7794', districtName: 'Chandigarh' },
    { title: 'Agricultural Land in Ludhiana', type: 'agriculture land', priceLabel: '30 Lakhs', priceValue: '3000000', sizeLabel: '3 Acres', sizeValue: '130680', lat: '30.9010', lng: '75.8573', districtName: 'Ludhiana' },
    { title: 'Commercial Space in Faridabad', type: 'commercial space', priceLabel: '1.3 Cr', priceValue: '13000000', sizeLabel: '2400 sqft', sizeValue: '2400', lat: '28.4089', lng: '77.3178', districtName: 'Faridabad' },
];

async function seed() {
    console.log('Seeding districts...');
    const insertedDistricts = await db
        .insert(districts)
        .values(DISTRICTS_DATA)
        .onConflictDoNothing()
        .returning({ id: districts.id, name: districts.name });

    const allDistricts = await db.select().from(districts);
    const districtMap = Object.fromEntries(allDistricts.map((d) => [d.name, d.id]));

    console.log(`Districts ready: ${allDistricts.length}`);

    console.log('Seeding properties...');
    const propertyValues = PROPERTIES_DATA.map(({ districtName, ...p }) => ({
        ...p,
        districtId: districtMap[districtName] ?? null,
    }));

    const insertedProperties = await db
        .insert(properties)
        .values(propertyValues)
        .onConflictDoNothing()
        .returning({ id: properties.id });

    console.log(`Properties inserted: ${insertedProperties.length}`);

    if (insertedProperties.length > 0) {
        console.log('Seeding placeholder images...');
        const imageValues = insertedProperties.flatMap((p) => [
            { propertyId: p.id, url: '/property/image.png', alt: 'Property image 1', displayOrder: 0 },
            { propertyId: p.id, url: '/property/image.png', alt: 'Property image 2', displayOrder: 1 },
        ]);
        await db.insert(propertyImages).values(imageValues).onConflictDoNothing();
    }

    console.log('Seed complete.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
