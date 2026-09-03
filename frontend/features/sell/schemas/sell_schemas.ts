import { z } from 'zod';

export const step1Schema = z.object({
  type: z.enum(['house', 'apartment', 'villa', 'site', 'plot', 'agriculture', 'commercial_space', 'commercial_plot']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  listingType: z.enum(['sale', 'rent', 'both']),
  condition: z.string().optional(),
});

export const step2Schema = z.object({
  districtId: z.string().min(1, 'Please select a district'),
  city: z.string().min(1, 'City is required').max(100),
  taluk: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  lat: z.string().min(1, 'Please pin the location on the map'),
  lng: z.string().min(1, 'Please pin the location on the map'),
});

export const step3Schema = z.object({
  priceLabel: z.string().min(1, 'Price label is required'),
  priceValue: z.string().min(1, 'Price value is required'),
  expectedPrice: z.string().optional(),
  sizeLabel: z.string().min(1, 'Size label is required'),
  sizeValue: z.string().optional(),
  areaUnit: z.enum(['sqft', 'acres', 'guntas']),
});

export const step4Schema = z.object({
  // Residential
  bhkLabel: z.string().optional(),
  bedrooms: z.coerce.number().int().min(1).max(20).optional(),
  bathrooms: z.coerce.number().int().min(1).max(10).optional(),
  balconies: z.coerce.number().int().min(0).max(10).optional(),
  floors: z.coerce.number().int().min(1).max(100).optional(),
  floorNumber: z.coerce.number().int().min(0).max(100).optional(),
  furnishedStatus: z.string().optional(),
  // Site/plot
  facing: z.string().optional(),
  siteDimensions: z.string().optional(),
  landUse: z.string().optional(),
  // Agriculture
  waterSource: z.string().optional(),
  soilType: z.string().optional(),
  surveyNumber: z.string().optional(),
});

export const step5Schema = z.object({
  roadAccess: z.boolean(),
  roadWidth: z.string().optional(),
  roadType: z.string().optional(),
  roadFacing: z.boolean().optional(),
  documentStatus: z.string().optional(),
});

export const step6Schema = z.object({
  amenityIds: z.array(z.string()),
  description: z.string().max(2000).optional(),
  contactNumber: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
});

export const step7Schema = z.object({
  imageUrls: z.array(z.string()).min(1, 'At least one image is required'),
  coverIndex: z.number().int().min(0),
});

export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
export type Step4Values = z.infer<typeof step4Schema>;
export type Step5Values = z.infer<typeof step5Schema>;
export type Step6Values = z.infer<typeof step6Schema>;
export type Step7Values = z.infer<typeof step7Schema>;

export type SellFormValues = Step1Values & Step2Values & Step3Values & Step4Values & Step5Values & Step6Values & Step7Values;
