'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Map, Search, MessageSquare, BookOpen,
  X, Lock, SlidersHorizontal, RotateCcw,
  Bookmark, BookmarkCheck,
  Phone, MapPin, Home, Wheat, MapPinned,
  Building2, Landmark, Factory,
  Send, CheckCircle, Clock, CheckCheck, Calendar, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarCard } from '@/shared/ui/sidebar_card';
import { useSidebarStore } from '../store/sidebar_store';
import { useStore } from '@/shared/store';
import { PropertyCard } from '@/features/properties/components/property_card';
import { useWatchlistSync } from '@/features/properties/hooks/use_watchlist_sync';
import { submitEnquiry, getMyEnquiries } from '@/features/properties/api/enquiry_api';
import { getProperties, getPropertyById } from '@/features/properties/api/property_api';
import { getBlogPosts } from '@/features/blog/api/blog_api';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ALL_PROPERTY_TYPES, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_ICONS } from '@/features/properties/constants/property_types';
import type { Property, PropertyDetail, PropertyType, EnquiryWithProperty, BlogPostCard } from '@/shared/types';

// ─── Menu metadata ──────────────────────────────────────────────────────────

type MenuMeta = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const MENU_META: Record<string, MenuMeta> = {
  map:      { title: 'Map Explorer',      description: 'Explore properties with interactive layers.', Icon: Map },
  search:   { title: 'Browse Properties', description: 'Filter and discover listings across Karnataka.',         Icon: Search },
  saved:    { title: 'Saved Properties',  description: 'Your bookmarked properties.',                           Icon: Bookmark },
  messages: { title: 'My Enquiries',      description: 'Enquiries you have submitted to sellers.',              Icon: MessageSquare },
  blog:     { title: 'Blog',              description: 'Real estate insights, news and guides.',                 Icon: BookOpen },
};

// ─── Property type icons ─────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  house: Home, apartment: Landmark, villa: Home,
  site: MapPinned, plot: MapPinned,
  agriculture: Wheat,
  commercial_space: Building2, commercial_plot: Factory,
};

// ─── Enquiry status ───────────────────────────────────────────────────────────

function EnquiryStatusIcon({ status }: { status: string }) {
  if (status === 'replied') return <CheckCheck size={12} className="text-primary" />;
  if (status === 'closed')  return <CheckCheck size={12} className="text-muted-foreground" />;
  return <Clock size={12} className="text-amber-500" />;
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function AuthGate({
  icon: Icon,
  message,
  onLogin,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  message: string;
  onLogin: () => void;
}) {
  return (
    <div className="p-5">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="relative">
          <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-primary/15 blur-lg" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
            <Icon size={24} className="text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          onClick={onLogin}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-95"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// ─── Browse Panel ─────────────────────────────────────────────────────────────

const BROWSE_PROPERTY_LIMIT = 200;

function matchesBrowseSearch(property: Property, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    property.title,
    property.districtName,
    property.city,
    property.taluk,
    property.address,
    property.description,
  ].some((value) => value?.toLowerCase().includes(normalizedQuery));
}

function BrowsePanel({ onOpen }: { onOpen: (p: Property) => void }) {
  const [results, setResults]             = useState<Property[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [search, setSearch]               = useState('');
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>([]);
  const [listingType, setListingType]     = useState<'all' | 'sale' | 'rent'>('all');
  const [showFilters, setShowFilters]     = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Parameters<typeof getProperties>[0] = { limit: BROWSE_PROPERTY_LIMIT };
      if (selectedTypes.length === 1) params.type    = selectedTypes[0];
      if (listingType !== 'all')      params.listing = listingType;
      const properties = await getProperties(params);
      setResults(properties.filter((property) => matchesBrowseSearch(property, search)));
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedTypes, listingType]);

  useEffect(() => { load(); }, []);

  function toggleType(type: PropertyType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  const hasFilters = selectedTypes.length > 0 || listingType !== 'all';

  return (
    <div className="flex flex-col h-full">
      {/* MD3 filled search bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); load(); }}
        className="shrink-0 px-4 pt-4 pb-2"
      >
        <div className="group flex items-center gap-2 rounded-t-xl rounded-b-none border-b-2 border-border bg-input px-4 py-3 transition-colors duration-200 focus-within:border-primary">
          <Search size={15} className="shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0"
          >
            <SlidersHorizontal
              size={15}
              className={cn(
                'transition-colors duration-200',
                showFilters ? 'text-primary' : 'text-muted-foreground hover:text-primary',
              )}
            />
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="shrink-0 space-y-3 px-4 pb-3">
          {/* Listing type */}
          <div className="flex gap-2">
            {(['all', 'sale', 'rent'] as const).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => setListingType(lt)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs capitalize transition-all duration-200 active:scale-95',
                  listingType === lt
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-muted text-foreground hover:bg-secondary hover:border-primary/20',
                )}
              >
                {lt === 'all' ? 'All' : `For ${lt}`}
              </button>
            ))}
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setSelectedTypes([]); setListingType('all'); }}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw size={10} /> Reset
              </button>
            )}
          </div>

          {/* Property types */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all duration-200 active:scale-95',
                  selectedTypes.includes(type)
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-muted text-foreground hover:bg-secondary hover:border-primary/20',
                )}
              >
                <span>{PROPERTY_TYPE_ICONS[type]}</span>
                <span>{PROPERTY_TYPE_LABELS[type]}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={load}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Result count */}
      <div className="shrink-0 px-4 pb-1">
        <p className="text-[11px] text-muted-foreground">
          {isLoading ? 'Loading…' : `${results.length} listings`}
        </p>
      </div>

      {/* Results grid */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-2xl border border-border bg-card p-2">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">No properties found</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setSelectedTypes([]); setListingType('all'); load(); }}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {results.map((p) => (
              <PropertyCard key={p.id} property={p} variant="grid" onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Enquiries Panel ──────────────────────────────────────────────────────────

function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState<EnquiryWithProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyEnquiries()
      .then(setEnquiries)
      .catch(() => setEnquiries([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!enquiries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
          <MessageSquare size={24} className="text-primary opacity-60" />
        </div>
        <p className="text-sm">No enquiries yet.</p>
        <p className="text-xs text-muted-foreground">Browse properties and contact sellers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {enquiries.map((eq) => (
        <div
          key={eq.id}
          className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground line-clamp-1">
              {eq.propertyTitle}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <EnquiryStatusIcon status={eq.status} />
              <span className="text-[10px] capitalize text-muted-foreground">{eq.status}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{eq.message}</p>
          <p className="text-[10px] text-muted-foreground/60">
            {new Date(eq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Blog Panel ───────────────────────────────────────────────────────────────

function BlogPanel() {
  const [posts, setPosts]       = useState<BlogPostCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<BlogPostCard | null>(null);

  useEffect(() => {
    getBlogPosts({ limit: 20 })
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="shrink-0 flex items-center gap-1.5 px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors border-b border-border"
        >
          ← Back to posts
        </button>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {selected.coverImage && (
            <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.coverImage} alt={selected.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(selected.publishedAt ?? selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {selected.authorName && (
              <span className="flex items-center gap-1">
                <User size={11} />{selected.authorName}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground leading-snug">{selected.title}</h2>
          {selected.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed">{selected.excerpt}</p>
          )}
          {selected.categoryName && (
            <span className="inline-block rounded-full bg-secondary border border-border px-3 py-1 text-xs font-medium text-primary">
              {selected.categoryName}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
          <BookOpen size={24} className="text-primary opacity-60" />
        </div>
        <p className="text-sm">No blog posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {posts.map((post) => (
        <button
          key={post.id}
          type="button"
          onClick={() => setSelected(post)}
          className={cn(
            'group w-full text-left rounded-2xl border border-border bg-card overflow-hidden',
            'shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
            'transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
          )}
        >
          {post.coverImage && (
            <div className="relative h-36 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              {post.categoryName && (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  {post.categoryName}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">
                {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

export function DetailPanel() {
  const activeMenu          = useSidebarStore((s) => s.activeMenu);
  const isPanelOpen         = useSidebarStore((s) => s.isPanelOpen);
  const setActiveMenu       = useSidebarStore((s) => s.setActiveMenu);
  const closePanel          = useSidebarStore((s) => s.closePanel);
  const savedProperties     = useSidebarStore((s) => s.savedProperties);
  const selectedProperty    = useSidebarStore((s) => s.selectedProperty);
  const setSelectedProperty = useSidebarStore((s) => s.setSelectedProperty);

  const saved           = useStore((s) => s.watchlist.saved);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal  = useStore((s) => s.openLoginModal);
  const { saveProperty, unsaveProperty } = useWatchlistSync();

  const [showEnquiry,       setShowEnquiry]       = useState(false);
  const [enquiryMsg,        setEnquiryMsg]        = useState('');
  const [enquiryPhone,      setEnquiryPhone]      = useState('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySent,       setEnquirySent]       = useState(false);
  const [propertyDetail,    setPropertyDetail]    = useState<PropertyDetail | null>(null);

  useEffect(() => {
    if (!selectedProperty) { setPropertyDetail(null); return; }
    getPropertyById(selectedProperty.id)
      .then(setPropertyDetail)
      .catch(() => setPropertyDetail(null));
  }, [selectedProperty?.id]);

  const isSaved     = selectedProperty ? saved.some((p) => p.id === selectedProperty.id) : false;
  const menuContent = activeMenu ? MENU_META[activeMenu] ?? null : null;

  const handleClose = () => {
    setSelectedProperty(null);
    setShowEnquiry(false);
    setEnquiryMsg('');
    setEnquiryPhone('');
    setEnquirySent(false);
  };

  const handlePanelClose = () => {
    closePanel();
    setActiveMenu(null);
  };

  const handleSave = () => {
    if (!selectedProperty) return;
    if (!isAuthenticated) {
      openLoginModal({ type: 'SAVE_PROPERTY', payload: { propertyId: selectedProperty.id } });
      return;
    }
    if (isSaved) unsaveProperty(selectedProperty.id);
    else saveProperty(selectedProperty);
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      openLoginModal({ type: 'CONTACT_SELLER', payload: { propertyId: selectedProperty?.id ?? '' } });
      return;
    }
    setShowEnquiry(true);
  };

  const handleEnquirySubmit = async () => {
    if (!selectedProperty || enquiryMsg.trim().length < 10 || enquirySubmitting) return;
    setEnquirySubmitting(true);
    try {
      await submitEnquiry({
        propertyId: selectedProperty.id,
        message: enquiryMsg.trim(),
        phone: enquiryPhone.trim() || undefined,
      });
      setEnquirySent(true);
      setTimeout(() => {
        setEnquirySent(false);
        setShowEnquiry(false);
        setEnquiryMsg('');
        setEnquiryPhone('');
      }, 2500);
    } catch {
      // apiService shows toast
    } finally {
      setEnquirySubmitting(false);
    }
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col',
        'fixed left-16 md:left-22 top-0 h-screen',
        'w-105 md:w-125 lg:w-140 z-50',
        'border-r border-border bg-background/98 backdrop-blur-sm',
        'transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
        isPanelOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Atmospheric blur shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 -left-16 h-48 w-48 rounded-full bg-secondary/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-20 right-0 h-36 w-36 rounded-full bg-[#7D5260]/8 blur-3xl" />

      <div className="relative z-10 flex flex-col h-full">

        {/* ── Property detail view ─────────────────────────────────────────── */}
        {selectedProperty ? (
          <>
            {/* Hero image — keeps dark overlay since it's over a photo */}
            <div className="relative h-52 w-full shrink-0">
              <Image
                src={selectedProperty.thumbnailUrl || selectedProperty.imageUrls?.[0] || '/property/image.png'}
                alt={selectedProperty.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/70" />

              <button
                onClick={handleClose}
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors active:scale-95"
              >
                <X size={16} />
              </button>

              {/* Listing type badge — MD3 primary */}
              <span className="absolute bottom-3 left-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground capitalize">
                For {selectedProperty.listingType}
              </span>

              <button
                onClick={handleSave}
                className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 transition-colors active:scale-95"
              >
                {isSaved
                  ? <BookmarkCheck size={16} className="text-primary-foreground" />
                  : <Bookmark size={16} className="text-white" />}
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">

              {/* Title + location */}
              <div>
                {(() => {
                  const Icon = TYPE_ICON[selectedProperty.type] ?? Home;
                  return (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-secondary border border-border px-2.5 py-1">
                        <Icon size={12} className="text-primary" />
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {selectedProperty.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {selectedProperty.title}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={13} />
                  {[selectedProperty.city, selectedProperty.taluk, selectedProperty.districtName]
                    .filter(Boolean)
                    .join(', ') || 'Karnataka'}
                </p>
              </div>

              {/* Price & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <SectionLabel>Price</SectionLabel>
                  <p className="text-lg font-bold text-foreground">{selectedProperty.priceLabel}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <SectionLabel>Area</SectionLabel>
                  <p className="text-lg font-bold text-foreground">{selectedProperty.sizeLabel}</p>
                </div>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <SectionLabel>About</SectionLabel>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <SectionLabel>Features</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.map((f, i) => (
                      <span key={i} className="rounded-full bg-secondary border border-border px-3 py-1 text-xs text-foreground">
                        {f.key}: {f.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Residential details */}
              {propertyDetail?.residentialDetails && (() => {
                const r = propertyDetail.residentialDetails;
                const chips = [
                  r.bhkLabel,
                  r.bedrooms  != null && `${r.bedrooms} Bed`,
                  r.bathrooms != null && `${r.bathrooms} Bath`,
                  r.balconies != null && r.balconies > 0 && `${r.balconies} Balcon${r.balconies > 1 ? 'ies' : 'y'}`,
                  r.furnishedStatus,
                  r.floors      != null && `${r.floors} Floor${r.floors > 1 ? 's' : ''}`,
                  r.floorNumber != null && `Floor ${r.floorNumber}`,
                ].filter(Boolean) as string[];
                return chips.length > 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <SectionLabel>Residential Details</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {chips.map((c) => (
                        <span key={c} className="rounded-full bg-secondary border border-border px-3 py-1 text-xs text-foreground">{c}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Agriculture details */}
              {propertyDetail?.agricultureDetails && (() => {
                const a = propertyDetail.agricultureDetails;
                const rows = [
                  a.waterSource  && ['Water Source', a.waterSource],
                  a.soilType     && ['Soil Type',    a.soilType],
                  a.surveyNumber && ['Survey No.',   a.surveyNumber],
                ].filter(Boolean) as [string, string][];
                return rows.length > 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <SectionLabel>Agriculture Details</SectionLabel>
                    <div className="space-y-2">
                      {rows.map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-foreground capitalize">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Road info */}
              {selectedProperty.roadAccess && propertyDetail?.roadInfo && (() => {
                const ri = propertyDetail.roadInfo;
                const rows = [
                  ri.roadWidth  && ['Road Width',  ri.roadWidth],
                  ri.roadType   && ['Road Type',   ri.roadType],
                  ri.roadFacing != null && ['Road Facing', ri.roadFacing ? 'Yes' : 'No'],
                ].filter(Boolean) as [string, string][];
                return (
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <SectionLabel>Road Access</SectionLabel>
                    {rows.length > 0 ? (
                      <div className="space-y-2">
                        {rows.map(([label, val]) => (
                          <div key={label} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="text-foreground capitalize">{val}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Road access available</p>
                    )}
                  </div>
                );
              })()}

              {/* Amenities */}
              {propertyDetail?.amenities && propertyDetail.amenities.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <SectionLabel>Amenities</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {propertyDetail.amenities.map((a) => (
                      <span
                        key={a.id}
                        className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Property info */}
              {(() => {
                const p = selectedProperty;
                const rows = [
                  p.facing         && ['Facing',      p.facing],
                  p.condition      && ['Condition',   p.condition],
                  p.landUse        && ['Land Use',    p.landUse],
                  p.siteDimensions && ['Dimensions',  p.siteDimensions],
                  p.documentStatus && ['Documents',   p.documentStatus],
                  p.address        && ['Address',     p.address],
                ].filter(Boolean) as [string, string][];
                return rows.length > 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <SectionLabel>Property Info</SectionLabel>
                    <div className="space-y-2">
                      {rows.map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-foreground capitalize text-right max-w-[60%]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Contact */}
              {selectedProperty.contactNumber && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <SectionLabel>Contact</SectionLabel>
                    <p className="text-sm font-semibold text-foreground">{selectedProperty.contactNumber}</p>
                  </div>
                  <a
                    href={`tel:${selectedProperty.contactNumber}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors active:scale-95"
                  >
                    <Phone size={16} />
                  </a>
                </div>
              )}
            </div>

            {/* Enquiry form */}
            {showEnquiry && (
              <div className="shrink-0 px-4 pb-3 space-y-2 border-t border-border pt-3">
                {enquirySent ? (
                  <div className="flex flex-col items-center gap-2 py-5 text-primary">
                    <CheckCircle size={28} />
                    <p className="text-sm font-semibold text-foreground">Enquiry sent!</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={enquiryMsg}
                      onChange={(e) => setEnquiryMsg(e.target.value)}
                      placeholder="Hi, I'm interested in this property…"
                      rows={3}
                      className="w-full rounded-t-xl rounded-b-none border-b-2 border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                    />
                    <input
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      type="tel"
                      className="w-full rounded-t-xl rounded-b-none border-b-2 border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowEnquiry(false)}
                        className="flex-1 rounded-full border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted transition-all duration-200 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEnquirySubmit}
                        disabled={enquiryMsg.trim().length < 10 || enquirySubmitting}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 active:scale-95"
                      >
                        <Send size={14} />
                        {enquirySubmitting ? 'Sending…' : 'Send Enquiry'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="shrink-0 p-4 pt-2 space-y-2">
              {!showEnquiry && (
                <button
                  onClick={handleContact}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200 active:scale-95"
                >
                  <Phone size={16} />
                  {isAuthenticated ? 'Contact Seller' : 'Login to Contact'}
                </button>
              )}
              <button
                onClick={handleSave}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-full border py-3.5 font-semibold transition-all duration-200 active:scale-95',
                  isSaved
                    ? 'border-primary/30 bg-secondary text-primary hover:bg-primary/10'
                    : 'border-border bg-muted text-foreground hover:bg-secondary',
                )}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? 'Saved' : 'Save Property'}
              </button>
            </div>
          </>
        ) : (

          // ── Menu content (no property selected) ──────────────────────────
          <>
            {/* Header */}
            <div className="relative shrink-0 border-b border-border/60 px-6 pt-6 pb-5">
              <button
                type="button"
                aria-label="Close panel"
                onClick={handlePanelClose}
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors active:scale-95"
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-primary/20 blur-md opacity-60" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary shadow-sm">
                    {menuContent && <menuContent.Icon size={26} className="text-primary" />}
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground">
                    {menuContent?.title}
                  </h1>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {menuContent?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Map tab */}
            {activeMenu === 'map' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-5">
                <SidebarCard className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
                    <Map size={24} className="text-primary opacity-60" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-52">
                    Click any property marker on the map to view its details here.
                  </p>
                </SidebarCard>
              </div>
            )}

            {/* Browse / Search tab */}
            {activeMenu === 'search' && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <BrowsePanel onOpen={(p) => setSelectedProperty(p)} />
              </div>
            )}

            {/* Saved tab */}
            {activeMenu === 'saved' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {!isAuthenticated ? (
                  <AuthGate
                    icon={Lock}
                    message="Sign in to view your saved properties."
                    onLogin={() => openLoginModal()}
                  />
                ) : savedProperties.length === 0 ? (
                  <SidebarCard className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
                      <Bookmark size={24} className="text-primary opacity-60" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No saved properties yet. Start exploring the map to bookmark listings.
                    </p>
                  </SidebarCard>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {savedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        variant="grid"
                        onOpen={(p) => setSelectedProperty(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enquiries tab */}
            {activeMenu === 'messages' && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                {!isAuthenticated ? (
                  <AuthGate
                    icon={Lock}
                    message="Sign in to see your enquiries."
                    onLogin={() => openLoginModal()}
                  />
                ) : (
                  <EnquiriesPanel />
                )}
              </div>
            )}

            {/* Blog tab */}
            {activeMenu === 'blog' && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <BlogPanel />
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

export default DetailPanel;
