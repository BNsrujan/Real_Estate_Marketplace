"use client";

import { useState } from "react";
import { AlertCircle, Camera, Check, Mail } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/shared/types";
import { updateProfile } from "@/features/profile/api/auth_api";
import { useStore } from "@/shared/store";

interface Props {
  user?: { name?: string; email?: string; avatar?: string };
  fullUser?: UserProfile | null;
  children: React.ReactNode;
}

export default function ProfileDetailsDialog({ user, fullUser, children }: Props) {
  const setAuth = useStore((s) => s.setAuth);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: fullUser?.name ?? user?.name ?? "",
    phone: fullUser?.phone ?? "",
    username: fullUser?.username ?? "",
  });
  const [errors, setErrors] = useState<Partial<typeof values>>({});

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
    if (!validate()) return;
    setSaving(true);
    setGeneralError(null);
    try {
      const updated = await updateProfile({
        name: values.name.trim(),
        phone: values.phone.trim() || undefined,
        username: values.username.trim() || undefined,
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

  const initials = (user?.name ?? "U")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <DialogContent className={cn(
        "sm:max-w-md overflow-hidden rounded-3xl border-border bg-background p-6 shadow-xl",
      )}>
        {/* Atmospheric blurs */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-secondary/60 blur-3xl" />

        <DialogHeader className="relative mb-1">
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
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={15} className="shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Avatar row */}
            <div className="flex items-center gap-4 py-1">
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary text-lg font-bold overflow-hidden ring-2 ring-primary/20">
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    : initials}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all duration-200"
                >
                  <Camera size={11} />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{fullUser?.role ?? "buyer"}</p>
              </div>
            </div>

            {/* Email — read only */}
            <div className="flex items-center h-12 rounded-2xl border border-border bg-muted px-3 gap-2">
              <Mail size={14} className="text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm text-muted-foreground truncate">
                {user?.email ?? "—"}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground border border-border rounded-md px-1.5 py-0.5">
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
              disabled={saving || saved}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/90 active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] disabled:opacity-70 mt-1"
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
