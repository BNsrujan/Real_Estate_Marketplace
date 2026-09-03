import { env, isCloudinaryConfigured } from "@/lib/env";

export interface UploadedAsset {
  url: string;
  width?: number;
  height?: number;
}

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super(
      "Image upload is unavailable: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
    this.name = "CloudinaryNotConfiguredError";
  }
}

export async function uploadImage(file: File): Promise<UploadedAsset> {
  if (!isCloudinaryConfigured) throw new CloudinaryNotConfiguredError();

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", env.cloudinaryUploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    throw new Error(`Image upload failed (${response.status})`);
  }

  const data = await response.json();
  return { url: data.secure_url, width: data.width, height: data.height };
}

export { isCloudinaryConfigured };
