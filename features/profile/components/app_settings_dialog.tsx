"use client";

import { useState } from "react";
import { Globe, Sun, Moon, Monitor, Bell, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/shared/components/ui/label";

interface Props {
  children: React.ReactNode;
}

type Theme = "light" | "dark" | "system";
type Language = "en" | "hi" | "kn";

const THEMES: { value: Theme; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: "light",  label: "Light",  icon: Sun },
  { value: "dark",   label: "Dark",   icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "hi", label: "Hindi",   native: "हिन्दी" },
  { value: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

function SectionLabel({ icon: Icon, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
  return (
    <Label className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold tracking-wide uppercase">
      <Icon size={11} className="text-zinc-400" />
      {children}
    </Label>
  );
}

export default function AppSettingsDialog({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
    } finally {
      setSaving(false);
    }
  }

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
          <DialogTitle className="text-2xl font-bold tracking-tight">App Settings</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            Customize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <form onSubmit={handleSave} className="space-y-5 mt-2">

            {/* Language */}
            <div className="space-y-2">
              <SectionLabel icon={Globe}>Language</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setLanguage(lang.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border py-3 px-2 text-center transition-all duration-150",
                      language === lang.value
                        ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                        : "border-white/10 bg-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300",
                    )}
                  >
                    <span className="text-sm font-semibold">{lang.native}</span>
                    <span className="text-[10px] text-zinc-500">{lang.label}</span>
                    {language === lang.value && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 mt-0.5">
                        <Check size={9} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <SectionLabel icon={Moon}>Theme</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border py-3.5 transition-all duration-150",
                      theme === value
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300",
                    )}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-2">
              <SectionLabel icon={Bell}>Notifications</SectionLabel>
              <div className="space-y-2">
                <ToggleRow
                  label="Property Alerts"
                  description="Updates on saved properties and new listings"
                  value={notifications}
                  onChange={setNotifications}
                />
                <ToggleRow
                  label="Marketing Emails"
                  description="News, tips and market insights"
                  value={marketingEmails}
                  onChange={setMarketingEmails}
                />
              </div>
            </div>

            {/* Actions */}
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
              ) : "Save Settings"}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-600 mt-0.5 leading-snug">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          value ? "bg-emerald-500" : "bg-white/15",
        )}
      >
        <span className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          value ? "left-6" : "left-1",
        )} />
      </button>
    </div>
  );
}
