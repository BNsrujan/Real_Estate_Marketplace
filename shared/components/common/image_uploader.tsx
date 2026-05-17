'use client';

import { useRef, useState, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  url: string;
  width?: number;
  height?: number;
  isCover?: boolean;
}

interface ImageUploaderProps {
  max?: number;
  onUpload: (images: UploadedImage[]) => void;
  existing?: UploadedImage[];
}

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

async function uploadToCloudinary(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return { url: data.secure_url, width: data.width, height: data.height };
}

export function ImageUploader({ max = 10, onUpload, existing = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(existing);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const available = max - images.length;
    const toUpload = Array.from(files).slice(0, available);
    if (!toUpload.length) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(toUpload.map(uploadToCloudinary));
      const next = [
        ...images,
        ...uploaded.map((img, idx) => ({
          ...img,
          isCover: images.length === 0 && idx === 0,
        })),
      ];
      setImages(next);
      onUpload(next);
    } catch {
      // silently fail individual uploads — user can retry
    } finally {
      setUploading(false);
    }
  }

  function remove(idx: number) {
    const next = images.filter((_, i) => i !== idx).map((img, i) => ({ ...img, isCover: i === 0 }));
    setImages(next);
    onUpload(next);
  }

  function setCover(idx: number) {
    const next = images.map((img, i) => ({ ...img, isCover: i === idx }));
    setImages(next);
    onUpload(next);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      {images.length < max && (
        <div
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
            isDragging ? 'border-white/40 bg-white/10' : 'border-white/20 hover:border-white/30',
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <Upload className="mb-2 h-8 w-8 text-zinc-400" />
          <p className="text-sm text-zinc-300">
            {uploading ? 'Uploading…' : 'Drop images here or click to upload'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {images.length}/{max} images
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => processFiles(e.target.files)}
          />
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {img.isCover && (
                <span className="absolute left-1 top-1 rounded bg-white/90 px-1 text-[10px] font-medium text-black">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setCover(idx)}
                  className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white hover:bg-white/30"
                >
                  {img.isCover ? 'Cover' : 'Set cover'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded bg-red-500/80 p-0.5 text-white hover:bg-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
