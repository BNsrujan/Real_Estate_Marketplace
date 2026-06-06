"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Property,
  UserProfile,
  ApiError,
  Toast,
  FilterState,
  LayerType,
  MobilePanel,
  PendingAction,
  BlogPostCard,
  BlogPostDetail,
  DashboardStats,
  EnquiryWithProperty,
} from "@/shared/types";
import {
  clearLogoutMarker,
  logoutAuthSession,
} from "@/shared/services/auth_session.service";

// ─── Geo types (local, avoids maplibre-gl SSR issues) ────────────────────────

interface GeolocationCoords {
  lat: number;
  lng: number;
  altitude?: number;
}

interface GeoError {
  code: number;
  message: string;
}

// ─── Sidebar menu id — superset of SidebarTab for nav compatibility ────────

export type SidebarMenuId =
  | "map"
  | "search"
  | "saved"
  | "messages"
  | "blog"
  | "profile"
  | null;

// ─── Full store interface ─────────────────────────────────────────────────────

interface NammaDharaniStore {
  // ─── AUTH ────────────────────────────────────────────────────────────────
  auth: {
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null;
    isLoginModalOpen: boolean;
    pendingAction: PendingAction | null;
  };
  setAuth: (patch: Partial<NammaDharaniStore["auth"]>) => void;
  loginSuccess: (user: UserProfile, token: string) => void;
  logout: () => Promise<void>;
  openLoginModal: (pendingAction?: PendingAction) => void;
  closeLoginModal: () => void;

  // ─── SETTINGS ───────────────────────────────────────────────────────────
  settings: {
    theme: "light" | "dark" | "system";
    language: "en" | "hi" | "kn";
    notifications: boolean;
    marketingEmails: boolean;
  };
  setSettings: (patch: Partial<NammaDharaniStore["settings"]>) => void;

  // ─── MAP ─────────────────────────────────────────────────────────────────
  map: {
    instance: unknown | null; // maplibregl.Map — kept opaque to avoid SSR import
    isLoaded: boolean;
    currentZoom: number;
    currentBearing: number;
    viewportBounds: [number, number, number, number] | null;
    activeLayer: LayerType;
    isAnimating: boolean;
  };
  setMap: (patch: Partial<NammaDharaniStore["map"]>) => void;
  setMapInstance: (instance: unknown) => void;

  // ─── PROPERTIES ──────────────────────────────────────────────────────────
  properties: {
    all: Property[];
    filtered: Property[];
    selectedProperty: Property | null;
    hoveredProperty: Property | null;
    isLoading: boolean;
    error: ApiError | null;
    isSidebarOpen: boolean;
  };
  setProperties: (patch: Partial<NammaDharaniStore["properties"]>) => void;
  setSelectedProperty: (property: Property | null) => void;
  setHoveredProperty: (property: Property | null) => void;

  // ─── GEO ─────────────────────────────────────────────────────────────────
  geo: {
    isTracking: boolean;
    position: GeolocationCoords | null;
    accuracy: number | null;
    error: GeoError | null;
    watchId: number | null;
  };
  setGeo: (patch: Partial<NammaDharaniStore["geo"]>) => void;

  // ─── WATCHLIST ───────────────────────────────────────────────────────────
  watchlist: {
    saved: Property[];
    isSaving: boolean;
  };
  setWatchlist: (patch: Partial<NammaDharaniStore["watchlist"]>) => void;
  addToWatchlist: (property: Property) => void;
  removeFromWatchlist: (propertyId: string) => void;

  // ─── FILTERS ─────────────────────────────────────────────────────────────
  filters: FilterState;
  setFilters: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;

  // ─── BLOG ────────────────────────────────────────────────────────────────
  blog: {
    posts: BlogPostCard[];
    selectedPost: BlogPostDetail | null;
    isLoading: boolean;
  };
  setBlog: (patch: Partial<NammaDharaniStore["blog"]>) => void;

  // ─── DASHBOARD ───────────────────────────────────────────────────────────
  dashboard: {
    properties: Property[];
    enquiries: EnquiryWithProperty[];
    stats: DashboardStats | null;
    isLoading: boolean;
  };
  setDashboard: (patch: Partial<NammaDharaniStore["dashboard"]>) => void;

  // ─── UI ──────────────────────────────────────────────────────────────────
  ui: {
    activeSidebarTab: SidebarMenuId;
    isPanelOpen: boolean;
    isProfileModalOpen: boolean;
    isEditProfileOpen: boolean;
    isSettingsOpen: boolean;
    toasts: Toast[];
    mobilePanel: MobilePanel;
    isBottomSheetOpen: boolean;
    bottomSheetExpanded: boolean;
    savedPropertiesDistrictFilter: string | null;
  };
  setUI: (patch: Partial<NammaDharaniStore["ui"]>) => void;
  setActiveSidebarTab: (tab: SidebarMenuId) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// ─── Default filter state ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = {
  types: [],
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  listingType: "all",
  activeDistrict: null,
  searchQuery: "",
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create<NammaDharaniStore>()(
  devtools(
    (set, get) => ({
      // ─── AUTH ──────────────────────────────────────────────────────────
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        isLoginModalOpen: false,
        pendingAction: null,
      },
      setAuth: (patch) =>
        set((s) => ({ auth: { ...s.auth, ...patch } }), false, "auth/set"),
      loginSuccess: (user, token) => {
        if (typeof window !== "undefined") {
          clearLogoutMarker();
          if (token) localStorage.setItem("auth_token", token);
          else localStorage.removeItem("auth_token");
        }
        set(
          (s) => ({
            auth: {
              ...s.auth,
              isAuthenticated: true,
              user,
              token,
              isLoginModalOpen: false,
              pendingAction: null,
            },
          }),
          false,
          "auth/loginSuccess",
        );
      },
      logout: async () => {
        let logoutError: unknown;

        try {
          await logoutAuthSession();
        } catch (error) {
          logoutError = error;
        } finally {
          set(
            (s) => ({
              auth: {
                ...s.auth,
                isAuthenticated: false,
                user: null,
                token: null,
                isLoginModalOpen: false,
                pendingAction: null,
              },
              watchlist: { ...s.watchlist, saved: [] },
            }),
            false,
            "auth/logout",
          );
        }

        if (logoutError) throw logoutError;
      },
      openLoginModal: (pendingAction) =>
        set(
          (s) => ({
            auth: {
              ...s.auth,
              isLoginModalOpen: true,
              pendingAction: pendingAction ?? s.auth.pendingAction,
            },
            ui: { ...s.ui, isPanelOpen: false },
          }),
          false,
          "auth/openLoginModal",
        ),
      closeLoginModal: () =>
        set(
          (s) => ({
            auth: { ...s.auth, isLoginModalOpen: false, pendingAction: null },
          }),
          false,
          "auth/closeLoginModal",
        ),

      // ─── SETTINGS ───────────────────────────────────────────────────────
      settings: {
        theme: "light",
        language: "en",
        notifications: true,
        marketingEmails: false,
      },
      setSettings: (patch) =>
        set(
          (s) => ({ settings: { ...s.settings, ...patch } }),
          false,
          "settings/set",
        ),

      // ─── MAP ────────────────────────────────────────────────────────────
      map: {
        instance: null,
        isLoaded: false,
        currentZoom: 4,
        currentBearing: 0,
        viewportBounds: null,
        activeLayer: "satellite",
        isAnimating: false,
      },
      setMap: (patch) =>
        set((s) => ({ map: { ...s.map, ...patch } }), false, "map/set"),
      setMapInstance: (instance) =>
        set((s) => ({ map: { ...s.map, instance } }), false, "map/setInstance"),

      // ─── PROPERTIES ─────────────────────────────────────────────────────
      properties: {
        all: [],
        filtered: [],
        selectedProperty: null,
        hoveredProperty: null,
        isLoading: false,
        error: null,
        isSidebarOpen: false,
      },
      setProperties: (patch) =>
        set(
          (s) => ({ properties: { ...s.properties, ...patch } }),
          false,
          "properties/set",
        ),
      setSelectedProperty: (property) =>
        set(
          (s) => ({
            properties: {
              ...s.properties,
              selectedProperty: property,
              isSidebarOpen: property !== null,
            },
          }),
          false,
          "properties/setSelected",
        ),
      setHoveredProperty: (property) =>
        set(
          (s) => ({
            properties: { ...s.properties, hoveredProperty: property },
          }),
          false,
          "properties/setHovered",
        ),

      // ─── GEO ────────────────────────────────────────────────────────────
      geo: {
        isTracking: false,
        position: null,
        accuracy: null,
        error: null,
        watchId: null,
      },
      setGeo: (patch) =>
        set((s) => ({ geo: { ...s.geo, ...patch } }), false, "geo/set"),

      // ─── WATCHLIST ───────────────────────────────────────────────────────
      watchlist: { saved: [], isSaving: false },
      setWatchlist: (patch) =>
        set(
          (s) => ({ watchlist: { ...s.watchlist, ...patch } }),
          false,
          "watchlist/set",
        ),
      addToWatchlist: (property) =>
        set(
          (s) => ({
            watchlist: {
              ...s.watchlist,
              saved: s.watchlist.saved.some((p) => p.id === property.id)
                ? s.watchlist.saved
                : [...s.watchlist.saved, property],
            },
          }),
          false,
          "watchlist/add",
        ),
      removeFromWatchlist: (propertyId) =>
        set(
          (s) => ({
            watchlist: {
              ...s.watchlist,
              saved: s.watchlist.saved.filter((p) => p.id !== propertyId),
            },
          }),
          false,
          "watchlist/remove",
        ),

      // ─── FILTERS ─────────────────────────────────────────────────────────
      filters: DEFAULT_FILTERS,
      setFilters: (patch) =>
        set(
          (s) => ({ filters: { ...s.filters, ...patch } }),
          false,
          "filters/set",
        ),
      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, "filters/reset"),

      // ─── BLOG ────────────────────────────────────────────────────────────
      blog: { posts: [], selectedPost: null, isLoading: false },
      setBlog: (patch) =>
        set((s) => ({ blog: { ...s.blog, ...patch } }), false, "blog/set"),

      // ─── DASHBOARD ───────────────────────────────────────────────────────
      dashboard: {
        properties: [],
        enquiries: [],
        stats: null,
        isLoading: false,
      },
      setDashboard: (patch) =>
        set(
          (s) => ({ dashboard: { ...s.dashboard, ...patch } }),
          false,
          "dashboard/set",
        ),

      // ─── UI ──────────────────────────────────────────────────────────────
      ui: {
        activeSidebarTab: null,
        isPanelOpen: false,
        isProfileModalOpen: false,
        isEditProfileOpen: false,
        isSettingsOpen: false,
        toasts: [],
        mobilePanel: "map",
        isBottomSheetOpen: false,
        bottomSheetExpanded: false,
        savedPropertiesDistrictFilter: null,
      },
      setUI: (patch) =>
        set((s) => ({ ui: { ...s.ui, ...patch } }), false, "ui/set"),
      setActiveSidebarTab: (tab) =>
        set(
          (s) => ({ ui: { ...s.ui, activeSidebarTab: tab } }),
          false,
          "ui/setActiveTab",
        ),
      addToast: (toast) => {
        const id = Math.random().toString(36).slice(2);
        const full: Toast = { ...toast, id };
        const delay = full.duration ?? 4000;
        set(
          (s) => ({ ui: { ...s.ui, toasts: [...s.ui.toasts, full] } }),
          false,
          "ui/addToast",
        );
        // auto-dismiss
        setTimeout(() => get().removeToast(id), delay);
      },
      removeToast: (id) =>
        set(
          (s) => ({
            ui: { ...s.ui, toasts: s.ui.toasts.filter((t) => t.id !== id) },
          }),
          false,
          "ui/removeToast",
        ),
    }),
    {
      name: "NammaDharaniStore",
      serialize: {
        replacer: (_key: string, value: unknown) => {
          // MapLibre Map instance is not serializable and contains DOM refs
          // that cause Next.js searchParams Proxy warnings during JSON.stringify
          if (
            value !== null &&
            typeof value === "object" &&
            "getCanvas" in (value as object) &&
            "getZoom" in (value as object)
          ) {
            return "[MapInstance]";
          }
          return value;
        },
      },
    },
  ),
);

// ─── Convenience selectors ────────────────────────────────────────────────────

export const selectAuth = (s: NammaDharaniStore) => s.auth;
export const selectMap = (s: NammaDharaniStore) => s.map;
export const selectProperties = (s: NammaDharaniStore) => s.properties;
export const selectFilters = (s: NammaDharaniStore) => s.filters;
export const selectWatchlist = (s: NammaDharaniStore) => s.watchlist;
export const selectSettings = (s: NammaDharaniStore) => s.settings;
export const selectUI = (s: NammaDharaniStore) => s.ui;
export const selectBlog = (s: NammaDharaniStore) => s.blog;
export const selectDashboard = (s: NammaDharaniStore) => s.dashboard;

// ─── Token helper (usable outside React) ─────────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}
