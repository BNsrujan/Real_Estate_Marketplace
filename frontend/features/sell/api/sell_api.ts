import { apiService } from '@/shared/services/api.service';
import type { Property, ApiResponse, District, Amenity } from '@/shared/types';
import type { SellFormValues } from '../schemas/sell_schemas';

export async function getDistricts(): Promise<District[]> {
  const res = await apiService.get<ApiResponse<{ data: District[] }>>('/api/v1/districts');
  return res.data?.data ?? [];
}

export async function getAmenities(): Promise<Amenity[]> {
  const res = await apiService.get<ApiResponse<{ data: Amenity[] }>>('/api/v1/amenities');
  return res.data?.data ?? [];
}

export async function createPropertyListing(values: SellFormValues): Promise<Property> {
  const payload = {
    type: values.type,
    title: values.title,
    listingType: values.listingType,
    condition: values.condition,
    districtId: values.districtId,
    city: values.city,
    taluk: values.taluk,
    address: values.address,
    lat: values.lat,
    lng: values.lng,
    priceLabel: values.priceLabel,
    priceValue: values.priceValue,
    expectedPrice: values.expectedPrice,
    sizeLabel: values.sizeLabel,
    sizeValue: values.sizeValue,
    areaUnit: values.areaUnit,
    facing: values.facing,
    siteDimensions: values.siteDimensions,
    landUse: values.landUse,
    documentStatus: values.documentStatus,
    roadAccess: values.roadAccess,
    description: values.description,
    contactNumber: values.contactNumber,
    amenityIds: values.amenityIds,
    imageUrls: values.imageUrls.map((url, i) => ({
      url,
      isCover: i === values.coverIndex,
      displayOrder: i,
    })),
    residentialDetails: ['house', 'apartment', 'villa'].includes(values.type) ? {
      bhkLabel: values.bhkLabel,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      balconies: values.balconies,
      floors: values.floors,
      floorNumber: values.floorNumber,
      furnishedStatus: values.furnishedStatus,
    } : undefined,
    roadInfo: values.roadAccess ? {
      roadWidth: values.roadWidth,
      roadType: values.roadType,
      roadFacing: values.roadFacing,
    } : undefined,
    agricultureDetails: values.type === 'agriculture' ? {
      waterSource: values.waterSource,
      soilType: values.soilType,
      surveyNumber: values.surveyNumber,
    } : undefined,
  };

  const res = await apiService.post<ApiResponse<Property>>('/api/v1/properties', payload);
  return res.data;
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url as string;
}
