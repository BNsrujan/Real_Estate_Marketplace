"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, Check, Mail } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/shared/types";
import { updateProfile } from "@/features/profile/api/auth_api";
import { uploadToCloudinary } from "@/features/sell/api/sell_api";
import { useStore } from "@/shared/store";
import { UserAvatar } from '@/shared/ui/user_avatar';

interface Props {
  user?: { name?: string; email?: string; avatar?: string };
  fullUser?: UserProfile | null;
  children: React.ReactNode;
}

export default function ProfileDetailsDialog({ user, fullUser, children }: Props) {
  const setAuth = useStore((s) => s.setAuth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(fullUser?.avatarUrl ?? user?.avatar ?? null);
  const [values, setValues] = useState({
    name: fullUser?.name ?? user?.name ?? "",
    phone: fullUser?.phone ?? "",
    username: fullUser?.username ?? "",
  });
  const [errors, setErrors] = useState<Partial<typeof values>>({});

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && !open) {
      setAvatarPreview(null);
      setAvatarUrl(fullUser?.avatarUrl ?? user?.avatar ?? null);
      setGeneralError(null);
    }
    setOpen(nextOpen);
  }

  function set(key: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      setErrors((v) => ({ ...v, [key]: undefined }));
      setGeneralError(null);
    };
  }

  function validate() {
    const e: Partial<typeof values> = {};
    if (!values.name.trim()) e.name = "Name is required";
    if (values.phone && !/^\d{10}$/.test(values.phone)) e.phone = "Enter a valid 10-digit number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || uploadingAvatar) return;
    setSaving(true);
    setGeneralError(null);
    try {
      const updated = await updateProfile({
        name: values.name.trim(),
        phone: values.phone.trim() || undefined,
        username: values.username.trim() || undefined,
        avatarUrl: avatarUrl ?? undefined,
      });
      setAuth({ user: updated });
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setGeneralError("Please choose an image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return previewUrl;
    });
    setUploadingAvatar(true);
    setGeneralError(null);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setAvatarUrl(uploadedUrl);
    } catch {
      setGeneralError("Image upload failed. Check Cloudinary configuration.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div
        onClick={(event) => {
          event.stopPropagation();
          handleOpenChange(true);
        }}
        className="cursor-pointer"
      >
        {children}
      </div>

      <DialogContent className={cn(
        "sm:max-w-md overflow-hidden rounded-none border-border bg-background p-6 shadow-xl z-[10000]",
      )}>
        {/* Atmospheric blurs */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-none bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-none bg-secondary/60 blur-3xl" />

        <DialogHeader className="relative mb-1 flex-col gap-1 pr-10">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Profile Details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update your personal information.
          </DialogDescription>
        </DialogHeader>

        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-200">
          <form onSubmit={handleSave} className="space-y-4 mt-3">

            {/* General error */}
            {generalError && (
              <div className="flex items-center gap-2 p-3 rounded-none bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={15} className="shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <div className="flex items-center gap-4 py-1">
              <div className="relative shrink-0">
                <UserAvatar
                  src={avatarPreview ?? avatarUrl}
                  name={values.name}
                  size={56}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handleAvatarFile(event.target.files?.[0])}
                  disabled={uploadingAvatar || saving}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar || saving}
                  className="absolute -bottom-2 -right-1 flex p-2 h-3 items-center justify-center rounded-none bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all duration-200"
                  aria-label="Upload profile image"
                >
                  {uploadingAvatar ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Camera size={11} />
                  )}
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{fullUser?.role ?? "buyer"}</p>
                {uploadingAvatar && (
                  <p className="text-[11px] text-muted-foreground mt-1">Uploading image…</p>
                )}
              </div>
            </div>

            {/* Email — read only */}
            <div className="flex items-center h-12 rounded-none border border-border bg-muted px-3 gap-2">
              <Mail size={14} className="text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm text-muted-foreground truncate">
                {user?.email ?? "—"}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground border border-border rounded-none px-1.5 py-0.5">
                read-only
              </span>
            </div>

            <Input
              label="Full Name"
              required
              value={values.name}
              onChange={set("name")}
              error={errors.name}
              id="profile-name"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Username"
                value={values.username}
                onChange={set("username")}
                id="profile-username"
              />
              <Input
                label="Phone"
                value={values.phone}
                onChange={set("phone")}
                error={errors.phone}
                type="tel"
                maxLength={10}
                id="profile-phone"
              />
            </div>

            <button
              type="submit"
              disabled={saving || saved || uploadingAvatar}
              className="w-full h-11 rounded-none bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/90 active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] disabled:opacity-70 mt-1"
            >
              {saved ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={15} /> Saved
                </span>
              ) : saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving…
                </span>
              ) : "Save Changes"}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
