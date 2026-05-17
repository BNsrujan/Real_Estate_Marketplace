'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ChevronRight, ChevronLeft, Home, Landmark, Wheat, Building2, MapPinned, Factory, Check, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/shared/store';
import { createPortal } from 'react-dom';
import type { District, Amenity, PropertyType } from '@/shared/types';
import {
  step1Schema, step2Schema, step3Schema, step4Schema,
  step5Schema, step6Schema, step7Schema,
  type Step1Values, type Step2Values, type Step3Values, type Step4Values,
  type Step5Values, type Step6Values, type Step7Values,
} from '../schemas/sell_schemas';
import { getDistricts, getAmenities, createPropertyListing, uploadToCloudinary } from '../api/sell_api';

// ─── Types ────────────────────────────────────────────────────────────────────

type AllValues = Step1Values & Step2Values & Step3Values & Step4Values & Step5Values & Step6Values & Step7Values;

const STEPS = ['Basics', 'Location', 'Pricing', 'Details', 'Road & Docs', 'Amenities', 'Images'];

const TYPE_OPTIONS: { value: PropertyType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: 'house',           label: 'House',            icon: Home },
  { value: 'apartment',       label: 'Apartment',        icon: Landmark },
  { value: 'villa',           label: 'Villa',            icon: Home },
  { value: 'site',            label: 'Site',             icon: MapPinned },
  { value: 'plot',            label: 'Plot',             icon: MapPinned },
  { value: 'agriculture',     label: 'Agriculture',      icon: Wheat },
  { value: 'commercial_space', label: 'Commercial Space', icon: Building2 },
  { value: 'commercial_plot', label: 'Commercial Plot',  icon: Factory },
];

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const selectCls = inputCls + ' appearance-none';

// ─── Step 1: Basics ──────────────────────────────────────────────────────────

function Step1({ form }: { form: ReturnType<typeof useForm<AllValues>> }) {
  const { register, formState: { errors }, setValue, watch } = form;
  const type = watch('type');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-zinc-300 uppercase tracking-wider mb-3">Property Type</p>
        <div className="grid grid-cols-4 gap-2">
          {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('type', value, { shouldValidate: true })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition-colors',
                type === value
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white',
              )}
            >
              <Icon size={20} />
              <span className="text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
        {errors.type && <p className="mt-1.5 text-xs text-red-400">{errors.type.message as string}</p>}
      </div>

      <Field label="Title" error={errors.title?.message as string}>
        <input {...register('title')} placeholder="e.g. 3BHK Villa near Mysuru Ring Road" className={inputCls} />
      </Field>

      <Field label="Listing Type" error={errors.listingType?.message as string}>
        <div className="flex gap-2">
          {(['sale', 'rent', 'both'] as const).map((lt) => (
            <button
              key={lt}
              type="button"
              onClick={() => setValue('listingType', lt, { shouldValidate: true })}
              className={cn(
                'flex-1 rounded-xl border py-2.5 text-sm capitalize transition-colors',
                form.watch('listingType') === lt
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white',
              )}
            >
              {`${lt}`}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Condition (optional)">
        <select {...register('condition')} className={selectCls}>
          <option value="">Select condition</option>
          {['Ready to Move', 'Under Construction', 'Resale', 'New Launch'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

// ─── Step 2: Location ────────────────────────────────────────────────────────

function Step2({ form, districts }: { form: ReturnType<typeof useForm<AllValues>>; districts: District[] }) {
  const { register, formState: { errors }, setValue, watch } = form;
  const lat = watch('lat');
  const lng = watch('lng');

  return (
    <div className="space-y-5">
      <Field label="District" error={errors.districtId?.message as string}>
        <select {...register('districtId')} className={selectCls}>
          <option value="">Select district</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City / Town" error={errors.city?.message as string}>
          <input {...register('city')} placeholder="e.g. Mysuru" className={inputCls} />
        </Field>
        <Field label="Taluk (optional)">
          <input {...register('taluk')} placeholder="e.g. Hunsur" className={inputCls} />
        </Field>
      </div>

      <Field label="Full Address (optional)">
        <textarea {...register('address')} placeholder="Door no, Street, Landmark…" rows={2} className={inputCls + ' resize-none'} />
      </Field>

      <div>
        <p className="text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">Pin Location on Map</p>
        <p className="text-xs text-zinc-500 mb-3">Enter latitude and longitude manually, or click on a map to get coordinates.</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude" error={errors.lat?.message as string}>
            <input
              value={lat ?? ''}
              onChange={(e) => setValue('lat', e.target.value, { shouldValidate: true })}
              placeholder="e.g. 12.9716"
              className={inputCls}
            />
          </Field>
          <Field label="Longitude" error={errors.lng?.message as string}>
            <input
              value={lng ?? ''}
              onChange={(e) => setValue('lng', e.target.value, { shouldValidate: true })}
              placeholder="e.g. 77.5946"
              className={inputCls}
            />
          </Field>
        </div>
        {lat && lng && (
          <p className="mt-2 text-xs text-emerald-400">Location set: {lat}, {lng}</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Pricing ─────────────────────────────────────────────────────────

function Step3({ form }: { form: ReturnType<typeof useForm<AllValues>> }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price Label" error={errors.priceLabel?.message as string}>
          <input {...register('priceLabel')} placeholder="e.g. ₹45 Lakhs" className={inputCls} />
        </Field>
        <Field label="Price Value (₹)" error={errors.priceValue?.message as string}>
          <input {...register('priceValue')} type="text" inputMode="numeric" placeholder="4500000" className={inputCls} />
        </Field>
      </div>

      <Field label="Expected Price (₹) — optional">
        <input {...register('expectedPrice')} type="text" inputMode="numeric" placeholder="Negotiable price" className={inputCls} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Size Label" error={errors.sizeLabel?.message as string}>
          <input {...register('sizeLabel')} placeholder="e.g. 1200 sqft" className={inputCls} />
        </Field>
        <Field label="Size Value" error={errors.sizeValue?.message as string}>
          <input {...register('sizeValue')} type="text" inputMode="numeric" placeholder="1200" className={inputCls} />
        </Field>
      </div>

      <Field label="Area Unit">
        <select {...register('areaUnit')} className={selectCls}>
          <option value="sqft">Square Feet (sqft)</option>
          <option value="acres">Acres</option>
          <option value="guntas">Guntas</option>
        </select>
      </Field>
    </div>
  );
}

// ─── Step 4: Details ─────────────────────────────────────────────────────────

function Step4({ form }: { form: ReturnType<typeof useForm<AllValues>> }) {
  const { register } = form;
  const type = form.watch('type');
  const isResidential = ['house', 'apartment', 'villa'].includes(type);
  const isSitePlot = ['site', 'plot', 'commercial_plot', 'commercial_space'].includes(type);
  const isAgriculture = type === 'agriculture';

  return (
    <div className="space-y-5">
      {isResidential && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="BHK">
              <select {...register('bhkLabel')} className={selectCls}>
                <option value="">Select BHK</option>
                {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Bedrooms">
              <input {...register('bedrooms')} type="number" min={1} max={20} placeholder="3" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Bathrooms">
              <input {...register('bathrooms')} type="number" min={1} max={10} placeholder="2" className={inputCls} />
            </Field>
            <Field label="Balconies">
              <input {...register('balconies')} type="number" min={0} max={10} placeholder="1" className={inputCls} />
            </Field>
            <Field label="Total Floors">
              <input {...register('floors')} type="number" min={1} max={100} placeholder="2" className={inputCls} />
            </Field>
          </div>
          {type === 'apartment' && (
            <Field label="Unit Floor Number">
              <input {...register('floorNumber')} type="number" min={0} max={100} placeholder="4" className={inputCls} />
            </Field>
          )}
          <Field label="Furnished Status">
            <select {...register('furnishedStatus')} className={selectCls}>
              <option value="">Select status</option>
              {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        </>
      )}

      {isSitePlot && (
        <>
          <Field label="Facing Direction">
            <select {...register('facing')} className={selectCls}>
              <option value="">Select facing</option>
              {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Site Dimensions (optional)">
            <input {...register('siteDimensions')} placeholder="e.g. 30x40 ft" className={inputCls} />
          </Field>
          <Field label="Land Use">
            <select {...register('landUse')} className={selectCls}>
              <option value="">Select land use</option>
              {['Residential', 'Commercial', 'Agricultural', 'Mixed'].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
        </>
      )}

      {isAgriculture && (
        <>
          <Field label="Water Source">
            <select {...register('waterSource')} className={selectCls}>
              <option value="">Select water source</option>
              {['Bore Well', 'Open Well', 'Canal', 'Rain Fed', 'River'].map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </Field>
          <Field label="Soil Type">
            <select {...register('soilType')} className={selectCls}>
              <option value="">Select soil type</option>
              {['Red Soil', 'Black Soil', 'Alluvial', 'Laterite', 'Sandy'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Survey Number (optional)">
            <input {...register('surveyNumber')} placeholder="e.g. 123/4" className={inputCls} />
          </Field>
        </>
      )}

      {!isResidential && !isSitePlot && !isAgriculture && (
        <div className="flex items-center justify-center py-12 text-zinc-500 text-sm">
          No additional details required for this property type.
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Road & Docs ─────────────────────────────────────────────────────

function Step5({ form }: { form: ReturnType<typeof useForm<AllValues>> }) {
  const { register, setValue, watch } = form;
  const roadAccess = watch('roadAccess');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-sm font-medium text-white">Road Access</p>
          <p className="text-xs text-zinc-500">Does the property have road access?</p>
        </div>
        <button
          type="button"
          onClick={() => setValue('roadAccess', !roadAccess, { shouldValidate: true })}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            roadAccess ? 'bg-emerald-500' : 'bg-white/20',
          )}
        >
          <span className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
            roadAccess ? 'left-6' : 'left-1',
          )} />
        </button>
      </div>

      {roadAccess && (
        <>
          <Field label="Road Width">
            <input {...register('roadWidth')} placeholder="e.g. 30 ft" className={inputCls} />
          </Field>
          <Field label="Road Type">
            <select {...register('roadType')} className={selectCls}>
              <option value="">Select type</option>
              {['CC Road', 'Tar Road', 'Mud Road', 'National Highway', 'State Highway'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white">Road Facing</p>
            <button
              type="button"
              onClick={() => setValue('roadFacing', !form.watch('roadFacing'))}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                form.watch('roadFacing') ? 'bg-emerald-500' : 'bg-white/20',
              )}
            >
              <span className={cn(
                'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                form.watch('roadFacing') ? 'left-6' : 'left-1',
              )} />
            </button>
          </div>
        </>
      )}

      <Field label="Document Status (optional)">
        <input {...register('documentStatus')} placeholder="e.g. A-Khata, Clear Title" className={inputCls} />
      </Field>
    </div>
  );
}

// ─── Step 6: Amenities ───────────────────────────────────────────────────────

function Step6({ form, amenities }: { form: ReturnType<typeof useForm<AllValues>>; amenities: Amenity[] }) {
  const { register, setValue, watch } = form;
  const selectedIds = watch('amenityIds') ?? [];

  function toggleAmenity(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setValue('amenityIds', next);
  }

  const grouped = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    const cat = a.category ?? 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 capitalize">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {items.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs transition-colors',
                  selectedIds.includes(a.id)
                    ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white',
                )}
              >
                {a.icon && <span className="mr-1">{a.icon}</span>}
                {a.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      {amenities.length === 0 && (
        <p className="text-sm text-zinc-500 py-4">No amenities available.</p>
      )}

      <Field label="Description (optional)">
        <textarea {...register('description')} placeholder="Describe the property…" rows={4} className={inputCls + ' resize-none'} />
      </Field>

      <Field label="Contact Number" error={form.formState.errors.contactNumber?.message as string}>
        <input {...register('contactNumber')} type="tel" placeholder="10-digit phone number" className={inputCls} maxLength={10} />
      </Field>
    </div>
  );
}

// ─── Step 7: Images ──────────────────────────────────────────────────────────

function Step7({ form }: { form: ReturnType<typeof useForm<AllValues>> }) {
  const { setValue, watch, formState: { errors } } = form;
  const imageUrls = watch('imageUrls') ?? [];
  const coverIndex = watch('coverIndex') ?? 0;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 10 - imageUrls.length;
    if (remaining <= 0) return;

    setUploading(true);
    setUploadError('');
    try {
      const toUpload = Array.from(files).slice(0, remaining);
      const uploaded = await Promise.all(toUpload.map((f) => uploadToCloudinary(f)));
      setValue('imageUrls', [...imageUrls, ...uploaded], { shouldValidate: true });
    } catch {
      setUploadError('Upload failed. Check Cloudinary configuration.');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    const next = imageUrls.filter((_, idx) => idx !== i);
    setValue('imageUrls', next, { shouldValidate: true });
    if (coverIndex >= next.length) setValue('coverIndex', 0);
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <label
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors',
          uploading ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/15 bg-white/3 hover:border-white/25',
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading || imageUrls.length >= 10}
        />
        {uploading ? (
          <Loader2 size={28} className="text-emerald-400 animate-spin mb-2" />
        ) : (
          <Upload size={28} className="text-zinc-400 mb-2" />
        )}
        <p className="text-sm text-zinc-400">{uploading ? 'Uploading…' : 'Click or drag images'}</p>
        <p className="text-xs text-zinc-600 mt-1">{imageUrls.length}/10 images • tap one to set as cover</p>
      </label>

      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      {errors.imageUrls && <p className="text-xs text-red-400">{errors.imageUrls.message as string}</p>}

      {/* Image grid */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer"
              onClick={() => setValue('coverIndex', i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {coverIndex === i && (
                <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">Cover</span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface SellFormModalProps {
  onClose: () => void;
}

const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema, step7Schema];

export function SellFormModal({ onClose }: SellFormModalProps) {
  const [step, setStep] = useState(0);
  const [districts, setDistricts] = useState<District[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openLoginModal = useStore((s) => s.openLoginModal);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);

  const form = useForm<AllValues>({
    defaultValues: {
      type: 'house',
      listingType: 'sale',
      areaUnit: 'sqft',
      roadAccess: false,
      amenityIds: [],
      imageUrls: [],
      coverIndex: 0,
      lat: '',
      lng: '',
    },
  });

  useEffect(() => {
    setMounted(true);
    Promise.all([getDistricts(), getAmenities()]).then(([d, a]) => {
      setDistricts(d);
      setAmenities(a);
    }).catch(() => {});
  }, []);

  async function validateStep() {
    const schema = STEP_SCHEMAS[step];
    const values = form.getValues();
    const result = await schema.safeParseAsync(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AllValues;
        form.setError(field, { message: issue.message });
      });
      return false;
    }
    return true;
  }

  async function handleNext() {
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleSubmit() {
    if (!isAuthenticated) {
      openLoginModal({ type: 'SAVE_PROPERTY', payload: {} });
      return;
    }
    const valid = await validateStep();
    if (!valid) return;

    setSubmitting(true);
    try {
      await createPropertyListing(form.getValues());
      setSubmitted(true);
    } catch {
      // apiService shows toast
    } finally {
      setSubmitting(false);
    }
  }

  const stepProps = { form };

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-zinc-950 rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">List Your Property</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="shrink-0 flex gap-1 px-6 py-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full flex-1 transition-colors',
                i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-400' : 'bg-white/10',
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40">
                <Check size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Property Listed!</h3>
              <p className="text-sm text-zinc-400 text-center">Your property has been submitted and is pending review.</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {step === 0 && <Step1 {...stepProps} />}
              {step === 1 && <Step2 {...stepProps} districts={districts} />}
              {step === 2 && <Step3 {...stepProps} />}
              {step === 3 && <Step4 {...stepProps} />}
              {step === 4 && <Step5 {...stepProps} />}
              {step === 5 && <Step6 {...stepProps} amenities={amenities} />}
              {step === 6 && <Step7 {...stepProps} />}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {isAuthenticated ? 'Submit Listing' : 'Login to Submit'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
