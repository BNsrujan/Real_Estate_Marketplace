"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

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

  // Custom styling
  className?: string;
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
  className,
}: DialogModuleProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>(buildDefaults(fields));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    setInternalOpen(v);
    if (!v) {
      setValues(buildDefaults(fields));
      setErrors({});
      setGeneralError(null);
    }
  };

  const set = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError(null);
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
    setGeneralError(null);
    try {
      await onSubmit(values);
      setOpen(false);
    } catch (err: any) {
      setGeneralError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}

      <DialogContent className={cn(
        "sm:max-w-md bg-[#0a0a0a]/90 border-white/10 text-white backdrop-blur-2xl rounded-[2rem] p-6 shadow-2xl",
        className
      )}>
        <DialogHeader className="">
          <DialogTitle className="text-2xl font-bold tracking-tight">{title}</DialogTitle>
          {description && <DialogDescription className="text-zinc-400">{description}</DialogDescription>}
          
        </DialogHeader>
        
 

        <div className="space-y-5 py-2">
          {generalError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} />
              <span>{generalError}</span>
            </div>
          )}

          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              
              {["text", "email", "password", "number", "tel", "url"].includes(field.type) && (
                <>
                  <Label htmlFor={field.name} className="text-zinc-300 ml-1 font-medium">
                    {field.label}
                    {"required" in field && field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={"placeholder" in field ? field.placeholder : undefined}
                    value={values[field.name]}
                    onChange={(e) => set(field.name, e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-emerald-500/50 transition-all"
                  />
                  {errors[field.name] && <p className="text-[11px] text-red-400 ml-1">{errors[field.name]}</p>}
                </>
              )}

             
              {field.type === "textarea" && (
                <>
                  <Label htmlFor={field.name} className="text-zinc-300 ml-1 font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 3}
                    value={values[field.name]}
                    onChange={(e) => set(field.name, e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-emerald-500/50 transition-all min-h-[100px]"
                  />
                  {errors[field.name] && <p className="text-[11px] text-red-400 ml-1">{errors[field.name]}</p>}
                </>
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <>
                  <Label className="text-zinc-300 ml-1 font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Select value={values[field.name]} onValueChange={(v) => set(field.name, v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-emerald-500/50">
                      <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="focus:bg-white/10 focus:text-white">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.name] && <p className="text-[11px] text-red-400 ml-1">{errors[field.name]}</p>}
                </>
              )}

              {/* CHECKBOX */}
              {field.type === "checkbox" && (
                <div className="flex items-center gap-3 ml-1 p-1">
                  <Checkbox
                    id={field.name}
                    checked={values[field.name]}
                    onCheckedChange={(v) => set(field.name, v)}
                    className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <Label htmlFor={field.name} className="cursor-pointer text-sm text-zinc-300">{field.label}</Label>
                </div>
              )}

              {/* RADIO */}
              {field.type === "radio" && (
                <>
                  <Label className="text-zinc-300 ml-1 font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <RadioGroup value={values[field.name]} onValueChange={(v) => set(field.name, v)} className="flex flex-wrap gap-4 ml-1">
                    {field.options.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem value={opt.value} id={`${field.name}-${opt.value}`} className="border-white/20 text-emerald-500" />
                        <Label htmlFor={`${field.name}-${opt.value}`} className="cursor-pointer font-normal text-sm text-zinc-400">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors[field.name] && <p className="text-[11px] text-red-400 ml-1">{errors[field.name]}</p>}
                </>
              )}

              {/* SWITCH */}
              {field.type === "switch" && (
                <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 p-4 transition-colors hover:bg-white/[0.07]">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer text-sm font-semibold text-zinc-200">{field.label}</Label>
                    {"description" in field && field.description && (
                      <p className="text-[11px] text-zinc-500">{field.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={values[field.name]}
                    onCheckedChange={(v) => set(field.name, v)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              )}

            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 ">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)} 
            disabled={loading}
            className="text-zinc-400 hover:text-white hover:bg-white/5 h-11 rounded-xl px-6"
          >
            {cancelLabel}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-white text-black hover:bg-zinc-200 h-11 rounded-xl font-bold px-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
