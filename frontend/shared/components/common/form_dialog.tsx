"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/shared/components/ui/dialog";

export type FormField = {
  type: "text" | "email" | "password" | "url" | "tel" | "number" | "textarea" | "select" | "radio" | "switch";
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string | boolean;
  required?: boolean;
  description?: string;
  options?: { label: string; value: string }[];
};

interface FormDialogProps {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  trigger: React.ReactElement;
}

export default function FormDialog({ title, description, fields, onSubmit, trigger }: FormDialogProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]))
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-[#0a0a0a] border border-hairline text-ink">
        <DialogHeader>
          <DialogTitle className="text-ink">{title}</DialogTitle>
          {description && <DialogDescription className="text-ink-muted">{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-xs font-medium text-ink-muted">{field.label}</label>
              {field.type === "select" ? (
                <select
                  value={values[field.name] as string}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  className="w-full rounded-none border border-hairline bg-parchment-deep/60 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-survey"
                >
                  {field.options?.map((o) => (
                    <option key={o.value} value={o.value} className="bg-parchment-deep">
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "switch" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values[field.name] as boolean}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.checked }))}
                    className="accent-emerald-500"
                  />
                  {field.description && <span className="text-xs text-ink-muted">{field.description}</span>}
                </div>
              ) : field.type === "radio" ? (
                <div className="flex gap-3">
                  {field.options?.map((o) => (
                    <label key={o.value} className="flex items-center gap-1.5 text-sm text-ink-muted cursor-pointer">
                      <input
                        type="radio"
                        name={field.name}
                        value={o.value}
                        checked={values[field.name] === o.value}
                        onChange={() => setValues((v) => ({ ...v, [field.name]: o.value }))}
                        className="accent-emerald-500"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type={field.type}
                  value={values[field.name] as string}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full rounded-none border border-hairline bg-parchment-deep/60 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-survey"
                />
              )}
            </div>
          ))}
          <DialogFooter className="mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-none bg-survey px-5 py-2 text-sm font-semibold text-ink hover:bg-survey disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
