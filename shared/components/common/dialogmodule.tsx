"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Switch } from "@/shared/components/ui/switch";

// ─── Field Types ────────────────────────────────────────────────────────────

export type FieldOption = { label: string; value: string };

export type FormField =
  | { type: "text" | "email" | "password" | "number" | "tel" | "url"; name: string; label: string; placeholder?: string; required?: boolean; defaultValue?: string }
  | { type: "textarea"; name: string; label: string; placeholder?: string; required?: boolean; rows?: number; defaultValue?: string }
  | { type: "select"; name: string; label: string; options: FieldOption[]; placeholder?: string; required?: boolean; defaultValue?: string }
  | { type: "checkbox"; name: string; label: string; defaultValue?: boolean }
  | { type: "radio"; name: string; label: string; options: FieldOption[]; required?: boolean; defaultValue?: string }
  | { type: "switch"; name: string; label: string; description?: string; defaultValue?: boolean };

export type DialogModuleProps = {
  // Trigger
  trigger?: React.ReactNode;

  // Dialog meta
  title: string;
  description?: string;

  // Form fields config
  fields: FormField[];

  // Submit
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;

  // Open state (optional controlled)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildDefaults(fields: FormField[]): Record<string, any> {
  return Object.fromEntries(
    fields.map((f) => [
      f.name,
      "defaultValue" in f && f.defaultValue !== undefined
        ? f.defaultValue
        : f.type === "checkbox" || f.type === "switch"
        ? false
        : "",
    ])
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DialogModule({
  trigger,
  title,
  description,
  fields,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onSubmit,
  open: controlledOpen,
  onOpenChange,
}: DialogModuleProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>(buildDefaults(fields));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    setInternalOpen(v);
    if (!v) {
      setValues(buildDefaults(fields));
      setErrors({});
    }
  };

  const set = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if ("required" in field && field.required) {
        const val = values[field.name];
        if (!val || (typeof val === "string" && !val.trim())) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(values);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">{title}</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">

              
              {["text", "email", "password", "number", "tel", "url"].includes(field.type) && (
                <>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {"required" in field && field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={"placeholder" in field ? field.placeholder : undefined}
                    value={values[field.name]}
                    onChange={(e) => set(field.name, e.target.value)}
                  />
                  {errors[field.name] && <p className="text-[12px] text-destructive">{errors[field.name]}</p>}
                </>
              )}

             
              {field.type === "textarea" && (
                <>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 3}
                    value={values[field.name]}
                    onChange={(e) => set(field.name, e.target.value)}
                  />
                  {errors[field.name] && <p className="text-[12px] text-destructive">{errors[field.name]}</p>}
                </>
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <>
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Select value={values[field.name]} onValueChange={(v) => set(field.name, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.name] && <p className="text-[12px] text-destructive">{errors[field.name]}</p>}
                </>
              )}

              {/* CHECKBOX */}
              {field.type === "checkbox" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={field.name}
                    checked={values[field.name]}
                    onCheckedChange={(v) => set(field.name, v)}
                  />
                  <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
                </div>
              )}

              {/* RADIO */}
              {field.type === "radio" && (
                <>
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <RadioGroup value={values[field.name]} onValueChange={(v) => set(field.name, v)} className="space-y-1">
                    {field.options.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem value={opt.value} id={`${field.name}-${opt.value}`} />
                        <Label htmlFor={`${field.name}-${opt.value}`} className="cursor-pointer font-normal">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors[field.name] && <p className="text-[12px] text-destructive">{errors[field.name]}</p>}
                </>
              )}

              {/* SWITCH */}
              {field.type === "switch" && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">{field.label}</Label>
                    {"description" in field && field.description && (
                      <p className="text-[12px] text-muted-foreground">{field.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={values[field.name]}
                    onCheckedChange={(v) => set(field.name, v)}
                  />
                </div>
              )}

            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ─── Usage Example ───────────────────────────────────────────────────────────
//
// import DialogModule, { FormField } from "@/components/DialogModule";
//
// const fields: FormField[] = [
//   { type: "text",     name: "name",        label: "Full Name",    required: true,  placeholder: "John Doe" },
//   { type: "email",    name: "email",        label: "Email",        required: true,  placeholder: "you@example.com" },
//   { type: "select",   name: "type",         label: "Property Type",required: true,
//     options: [{ label: "House", value: "house" }, { label: "Apartment", value: "apartment" }] },
//   { type: "textarea", name: "notes",        label: "Notes",        placeholder: "Any additional info..." },
//   { type: "radio",    name: "priority",     label: "Priority",
//     options: [{ label: "Low", value: "low" }, { label: "High", value: "high" }] },
//   { type: "switch",   name: "notifications",label: "Notifications", description: "Receive email alerts" },
//   { type: "checkbox", name: "agree",        label: "I agree to the terms", required: true },
// ];
//
// <DialogModule
//   title="Add Property"
//   description="Fill in the details below."
//   fields={fields}
//   submitLabel="Save"
//   trigger={<Button>Add Property</Button>}
//   onSubmit={(data) => console.log(data)}
// />