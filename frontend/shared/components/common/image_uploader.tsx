'use client';

import { useRef, useState, DragEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/shared/services/cloudinary.service';

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

async function uploadToCloudinary(file: File): Promise<UploadedImage> {
  return uploadImage(file);
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
            'flex cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed p-8 transition-colors',
            isDragging ? 'border-white/40 bg-parchment-deep' : 'border-hairline-strong hover:border-hairline-strong',
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <Upload className="mb-2 h-8 w-8 text-ink-muted" />
          <p className="text-sm text-ink-muted">
            {uploading ? 'Uploading…' : 'Drop images here or click to upload'}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
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
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {img.isCover && (
                <span className="absolute left-1 top-1 rounded bg-parchment/90 px-1 text-[10px] font-medium text-parchment">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setCover(idx)}
                  className="rounded bg-parchment-deep px-1.5 py-0.5 text-[10px] text-ink hover:bg-parchment-deep"
                >
                  {img.isCover ? 'Cover' : 'Set cover'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded bg-red-500/80 p-0.5 text-ink hover:bg-red-500"
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
