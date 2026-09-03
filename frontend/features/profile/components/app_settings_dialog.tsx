"use client";

import { useEffect, useState } from "react";
import { Globe, Sun, Moon, Monitor, Bell, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/lib/utils";
import { useStore } from "@/shared/store";
import {
  applyAppSettings,
  loadAppSettings,
  saveAppLanguage,
  saveAppSettings,
  type AppSettings,
  type AppLanguage as Language,
  type AppTheme as Theme,
} from "@/shared/services/app_settings.service";
import { toastService } from "@/shared/services/toast.service";

interface Props {
  children: React.ReactNode;
}

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

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
      <Icon size={11} className="text-muted-foreground" />
      {children}
    </p>
  );
}

export default function AppSettingsDialog({ children }: Props) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const commitSettings = (nextSettings: AppSettings) => {
    setSettings(nextSettings);
    saveAppSettings(nextSettings);
  };

  const commitLanguage = (nextLanguage: Language) => {
    const currentSettings = useStore.getState().settings;
    const nextSettings = { ...currentSettings, language: nextLanguage };
    setLanguage(nextLanguage);
    setSettings({ language: nextLanguage });
    saveAppLanguage(nextLanguage, nextSettings);
  };

  useEffect(() => {
    const stored = loadAppSettings();
    setSettings(stored);
    applyAppSettings(stored);
  }, [setSettings]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !open) {
      setTheme(settings.theme);
      setLanguage(settings.language);
      setNotifications(settings.notifications);
      setMarketingEmails(settings.marketingEmails);
      setSaved(false);
    }
    setOpen(nextOpen);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const nextSettings = { theme, language, notifications, marketingEmails };
      commitSettings(nextSettings);
      await new Promise((r) => setTimeout(r, 300));
      setSaved(true);
      toastService.success("Settings saved.");
      setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
    } finally {
      setSaving(false);
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

      <DialogContent className="sm:max-w-md overflow-hidden rounded-none border-border bg-background p-6 shadow-xl">
        {/* Atmospheric blurs */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-none bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-none bg-secondary/60 blur-3xl" />

        <DialogHeader className="relative mb-1 flex-col gap-1 pr-10">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            App Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Customize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-200">
          <form onSubmit={handleSave} className="space-y-5 mt-3">

            {/* Language */}
            <div className="space-y-2">
              <SectionLabel icon={Globe}>Language</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => commitLanguage(lang.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-none border py-3 px-2 text-center transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95",
                      language === lang.value
                        ? "border-primary/40 bg-secondary text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="text-sm font-semibold">{lang.native}</span>
                    <span className="text-[10px] text-muted-foreground">{lang.label}</span>
                    {language === lang.value && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-none bg-primary mt-0.5">
                        <Check size={9} className="text-primary-foreground" strokeWidth={3} />
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
                    onClick={() => {
                      const nextSettings = {
                        theme: value,
                        language,
                        notifications,
                        marketingEmails,
                      };
                      setTheme(value);
                      commitSettings(nextSettings);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-none border py-3.5 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95",
                      theme === value
                        ? "border-primary/40 bg-secondary text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
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
                  onChange={(value) => {
                    const nextSettings = {
                      theme,
                      language,
                      notifications: value,
                      marketingEmails,
                    };
                    setNotifications(value);
                    commitSettings(nextSettings);
                  }}
                />
                <ToggleRow
                  label="Marketing Emails"
                  description="News, tips and market insights"
                  value={marketingEmails}
                  onChange={(value) => {
                    const nextSettings = {
                      theme,
                      language,
                      notifications,
                      marketingEmails: value,
                    };
                    setMarketingEmails(value);
                    commitSettings(nextSettings);
                  }}
                />
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving || saved}
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
    <div className="flex items-center justify-between rounded-none border border-border bg-card px-4 py-3 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  );
}
