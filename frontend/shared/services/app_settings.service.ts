export type AppTheme = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'hi' | 'kn';

export interface AppSettings {
  theme: AppTheme;
  language: AppLanguage;
  notifications: boolean;
  marketingEmails: boolean;
}

export const APP_SETTINGS_KEY = 'app_settings';
export const APP_LANGUAGE_KEY = 'app_language';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'en',
  notifications: true,
  marketingEmails: false,
};

function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'hi' || value === 'kn';
}

export function applyAppSettings(settings: AppSettings): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);

  document.documentElement.classList.toggle('dark', useDark);
  document.documentElement.lang = settings.language;
  document.documentElement.dataset.language = settings.language;
}

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS;

  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    const storedLanguage = localStorage.getItem(APP_LANGUAGE_KEY);
    const language = isAppLanguage(storedLanguage)
      ? storedLanguage
      : DEFAULT_APP_SETTINGS.language;

    if (!raw) return { ...DEFAULT_APP_SETTINGS, language };

    const parsed = JSON.parse(raw) as Partial<AppSettings>;

    return {
      theme: isAppTheme(parsed.theme) ? parsed.theme : DEFAULT_APP_SETTINGS.theme,
      language: isAppLanguage(parsed.language) ? parsed.language : language,
      notifications:
        typeof parsed.notifications === 'boolean'
          ? parsed.notifications
          : DEFAULT_APP_SETTINGS.notifications,
      marketingEmails:
        typeof parsed.marketingEmails === 'boolean'
          ? parsed.marketingEmails
          : DEFAULT_APP_SETTINGS.marketingEmails,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  localStorage.setItem(APP_LANGUAGE_KEY, settings.language);
  applyAppSettings(settings);
}

export function saveAppLanguage(language: AppLanguage, settings: AppSettings): void {
  saveAppSettings({ ...settings, language });
}
