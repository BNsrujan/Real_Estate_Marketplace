"use client";

import { useState } from "react";
import { AlertCircle, Camera, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/shared/types";
import { updateProfile } from "@/features/profile/api/auth_api";
import { useStore } from "@/shared/store";

interface Props {
  user?: { name?: string; email?: string; avatar?: string };
  fullUser?: UserProfile | null;
  children: React.ReactNode;
}

function FormFieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-zinc-300 text-xs font-semibold tracking-wide uppercase">
        {label}
        {required && <span className="text-emerald-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-400 ml-0.5 mt-1">{error}</p>}
    </div>
  );
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
      <DialogContent
        className={cn(
          "sm:max-w-md bg-[#0a0a0a]/90 border-white/10 text-white backdrop-blur-2xl",
          "rounded-[2rem] p-6 shadow-2xl overflow-hidden transition-all duration-300",
        )}
      >
        
        <DialogHeader className="mb-1">
          <DialogTitle className="text-2xl font-bold tracking-tight">Profile Details</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            Update your personal information.
          </DialogDescription>
        </DialogHeader>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <form onSubmit={handleSave} className="space-y-4 mt-2">

            {generalError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={15} />
                <span>{generalError}</span>
              </div>
            )}

            {/* Avatar row */}
            <div className="flex items-center gap-4 py-1">
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-lg font-bold text-white overflow-hidden">
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    : initials}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <Camera size={10} />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name ?? "User"}</p>
                <p className="text-xs text-zinc-500 mt-0.5 capitalize">{fullUser?.role ?? "buyer"}</p>
              </div>
            </div>

            {/* Email — read only */}
            <FormFieldWrapper label="Email">
              <div className="flex items-center h-11 rounded-xl border border-white/10 bg-white/5 px-3 gap-2">
                <span className="flex-1 text-sm text-zinc-500 truncate">
                  {user?.email ?? "—"}
                </span>
                <span className="shrink-0 text-[10px] text-zinc-600 border border-white/8 rounded-md px-1.5 py-0.5">
                  read-only
                </span>
              </div>
            </FormFieldWrapper>

            <FormFieldWrapper label="Full Name" required error={errors.name}>
              <Input
                value={values.name}
                onChange={set("name")}
                placeholder="Your full name"
                className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-emerald-500/50 placeholder:text-zinc-600 transition-all"
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-2 gap-3">
              <FormFieldWrapper label="Username">
                <Input
                  value={values.username}
                  onChange={set("username")}
                  placeholder="username"
                  className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-emerald-500/50 placeholder:text-zinc-600 transition-all"
                />
              </FormFieldWrapper>
              <FormFieldWrapper label="Phone" error={errors.phone}>
                <Input
                  value={values.phone}
                  onChange={set("phone")}
                  placeholder="10-digit number"
                  type="tel"
                  maxLength={10}
                  className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-emerald-500/50 placeholder:text-zinc-600 transition-all"
                />
              </FormFieldWrapper>
            </div>

            <button
              type="submit"
              disabled={saving || saved}
              className="w-full h-11 rounded-xl bg-white text-black hover:bg-zinc-100 font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.08)] active:scale-[0.98] transition-all mt-1 disabled:opacity-70"
            >
              {saved ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={15} /> Saved
                </span>
              ) : saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
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
