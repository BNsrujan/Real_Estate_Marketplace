import { FormField } from "@/shared/components/common/dialogmodule";

export const PROFILE_FORM_FIELDS = (user?: { name?: string; email?: string; avatar?: string }): FormField[] => [
  {
    type: "text",
    name: "name",
    label: "Full Name",
    placeholder: "Enter your name",
    defaultValue: user?.name,
    required: true,
  },
  {
    type: "email",
    name: "email",
    label: "Email Address",
    placeholder: "Enter your email",
    defaultValue: user?.email,
    required: true,
  },
  {
    type: "url",
    name: "avatar",
    label: "Avatar URL",
    placeholder: "https://example.com/avatar.jpg",
    defaultValue: user?.avatar,
  },
];

export const SETTINGS_FORM_FIELDS: FormField[] = [
  {
    type: "select",
    name: "language",
    label: "Language",
    options: [
      { label: "English", value: "en" },
      { label: "Hindi", value: "hi" },
      { label: "Kannada", value: "kn" },
    ],
    defaultValue: "en",
  },
  {
    type: "radio",
    name: "theme",
    label: "Theme Preference",
    options: [
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
      { label: "System", value: "system" },
    ],
    defaultValue: "dark",
  },
  {
    type: "switch",
    name: "notifications",
    label: "Email Notifications",
    description: "Receive updates about your saved properties",
    defaultValue: true,
  },
];
