const isDev = process.env.NODE_ENV !== "production";

export const env = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? (isDev ? "http://localhost:8000" : ""),
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_API_KEY ?? "",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryUploadPreset:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
} as const;

export const isCloudinaryConfigured = Boolean(
  env.cloudinaryCloudName && env.cloudinaryUploadPreset,
);
