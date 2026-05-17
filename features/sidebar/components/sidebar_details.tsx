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
  map:      { title: 'Map Explorer',     description: 'Explore Karnataka properties with interactive layers.', Icon: Map },
  search:   { title: 'Browse Properties', description: 'Filter and discover listings across Karnataka.',         Icon: Search },
  saved:    { title: 'Saved Properties', description: 'Your bookmarked properties.',                             Icon: Bookmark },
  messages: { title: 'My Enquiries',     description: 'Enquiries you have submitted to sellers.',                Icon: MessageSquare },
  blog:     { title: 'Blog',             description: 'Real estate insights, news and guides.',                  Icon: BookOpen },
};

// ─── Property type icons ─────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  house: Home, apartment: Landmark, villa: Home,
  site: MapPinned, plot: MapPinned,
  agriculture: Wheat,
  commercial_space: Building2, commercial_plot: Factory,
};

// ─── Enquiry status helpers ───────────────────────────────────────────────────

function EnquiryStatusIcon({ status }: { status: string }) {
  if (status === 'replied') return <CheckCheck size={12} className="text-emerald-400" />;
  if (status === 'closed')  return <CheckCheck size={12} className="text-zinc-500" />;
  return <Clock size={12} className="text-yellow-400" />;
}

// ─── Properties Browse Panel ─────────────────────────────────────────────────

function BrowsePanel({ onOpen }: { onOpen: (p: Property) => void }) {
  const all = useStore((s) => s.properties.all);

  const [results, setResults]         = useState<Property[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [search, setSearch]           = useState('');
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>([]);
  const [listingType, setListingType] = useState<'all' | 'sale' | 'rent'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Parameters<typeof getProperties>[0] = { limit: 40 };
      if (search.trim())             params.search = search.trim();
      if (selectedTypes.length === 1) params.type = selectedTypes[0];
      if (listingType !== 'all')     params.listing = listingType;
      const data = await getProperties(params);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedTypes, listingType]);

  // initial load
  useEffect(() => { load(); }, []);

  function toggleType(type: PropertyType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  const hasFilters = selectedTypes.length > 0 || listingType !== 'all';

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
          <Search size={15} className="text-white/40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          <button type="button" onClick={() => setShowFilters((v) => !v)} className="shrink-0">
            <SlidersHorizontal
              size={15}
              className={cn('transition-colors', showFilters ? 'text-white' : 'text-white/40 hover:text-white/70')}
            />
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 pb-3 space-y-3 shrink-0">
          {/* Listing type */}
          <div className="flex gap-2">
            {(['all', 'sale', 'rent'] as const).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => setListingType(lt)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs capitalize transition-colors',
                  listingType === lt
                    ? 'border-white/30 bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white',
                )}
              >
                {lt === 'all' ? 'All' : `For ${lt}`}
              </button>
            ))}
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setSelectedTypes([]); setListingType('all'); }}
                className="ml-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
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
                  'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                  selectedTypes.includes(type)
                    ? 'border-white/30 bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white',
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
            className="w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}

      <div className="px-3 pb-1 shrink-0">
        <p className="text-[11px] text-zinc-500">
          {isLoading ? 'Loading…' : `${results.length} listings`}
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-white/10 p-2">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <p className="text-sm">No properties found</p>
            <button type="button" onClick={() => { setSearch(''); setSelectedTypes([]); setListingType('all'); load(); }} className="mt-2 text-xs text-zinc-400 hover:text-white">
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
          <div key={i} className="space-y-2 rounded-xl border border-white/10 p-3">
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
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <MessageSquare size={32} className="mb-3 opacity-30" />
        <p className="text-sm">No enquiries yet.</p>
        <p className="mt-1 text-xs text-zinc-600">Browse properties and contact sellers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {enquiries.map((eq) => (
        <div key={eq.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white line-clamp-1">{eq.propertyTitle}</p>
            <div className="flex items-center gap-1 shrink-0">
              <EnquiryStatusIcon status={eq.status} />
              <span className="text-[10px] capitalize text-zinc-500">{eq.status}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-2">{eq.message}</p>
          <p className="text-[10px] text-zinc-600">
            {new Date(eq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Blog Panel ──────────────────────────────────────────────────────────────

function BlogPanel() {
  const [posts, setPosts] = useState<BlogPostCard[]>([]);
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
          className="shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs text-zinc-400 hover:text-white transition-colors border-b border-white/10"
        >
          ← Back to posts
        </button>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {selected.coverImage && (
            <div className="relative h-44 w-full rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.coverImage} alt={selected.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Calendar size={11} />{new Date(selected.publishedAt ?? selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {selected.authorName && <span className="flex items-center gap-1"><User size={11} />{selected.authorName}</span>}
          </div>
          <h2 className="text-xl font-bold text-white leading-snug">{selected.title}</h2>
          {selected.excerpt && <p className="text-sm text-zinc-400 leading-relaxed">{selected.excerpt}</p>}
          {selected.categoryName && (
            <span className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400">{selected.categoryName}</span>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-white/10 p-4">
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
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <BookOpen size={32} className="mb-3 opacity-30" />
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
          className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors overflow-hidden"
        >
          {post.coverImage && (
            <div className="relative h-36 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              {post.categoryName && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">{post.categoryName}</span>
              )}
              <span className="text-[10px] text-zinc-600">
                {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">{post.title}</h3>
            {post.excerpt && <p className="text-xs text-zinc-500 line-clamp-2">{post.excerpt}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Main DetailPanel ─────────────────────────────────────────────────────────

export function DetailPanel() {
  const activeMenu          = useSidebarStore((s) => s.activeMenu);
  const isPanelOpen         = useSidebarStore((s) => s.isPanelOpen);
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

  // Fetch full detail (child tables + amenities) whenever a property is selected
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
      await submitEnquiry({ propertyId: selectedProperty.id, message: enquiryMsg.trim(), phone: enquiryPhone.trim() || undefined });
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
        'fixed left-16 md:left-22.5 top-0 h-screen',
        'w-105 md:w-125 lg:w-140 z-50',
        'border-r border-white/10 backdrop-blur-3xl',
        'transition-transform duration-300 ease-in-out ',
        isPanelOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      style={{ backgroundColor: 'rgba(20,20,20,0.88)' }}
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative z-10 flex flex-col h-full">

        {/* ── Property detail view (when a property is selected) ── */}
        {selectedProperty ? (
          <>
            {/* Hero image */}
            <div className="relative h-52 w-full shrink-0">
              <Image
                src={selectedProperty.thumbnailUrl || selectedProperty.imageUrls?.[0] || '/property/image.png'}
                alt={selectedProperty.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />

              <button
                onClick={handleClose}
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X size={16} />
              </button>

              <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white capitalize">
                For {selectedProperty.listingType}
              </span>

              <button
                onClick={handleSave}
                className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 transition"
              >
                {isSaved
                  ? <BookmarkCheck size={16} className="text-emerald-400" />
                  : <Bookmark size={16} className="text-white" />}
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div>
                {(() => {
                  const Icon = TYPE_ICON[selectedProperty.type] ?? Home;
                  return (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                        <Icon size={12} className="text-white/70" />
                        <span className="text-[11px] text-white/70 capitalize">
                          {selectedProperty.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                <h2 className="text-xl font-bold text-white leading-tight">{selectedProperty.title}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                  <MapPin size={13} />
                  {[selectedProperty.city, selectedProperty.taluk, selectedProperty.districtName]
                    .filter(Boolean)
                    .join(', ') || 'Karnataka'}
                </p>
              </div>

              {/* Price & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Price</p>
                  <p className="text-lg font-bold text-white">{selectedProperty.priceLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Area</p>
                  <p className="text-lg font-bold text-white">{selectedProperty.sizeLabel}</p>
                </div>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">About</p>
                  <p className="text-sm text-white/70 leading-relaxed line-clamp-4">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.map((f, i) => (
                      <span key={i} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                        {f.key}: {f.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Extended details from PropertyDetail ── */}

              {/* Residential details */}
              {propertyDetail?.residentialDetails && (() => {
                const r = propertyDetail.residentialDetails;
                const chips = [
                  r.bhkLabel,
                  r.bedrooms != null && `${r.bedrooms} Bed`,
                  r.bathrooms != null && `${r.bathrooms} Bath`,
                  r.balconies != null && r.balconies > 0 && `${r.balconies} Balcon${r.balconies > 1 ? 'ies' : 'y'}`,
                  r.furnishedStatus,
                  r.floors != null && `${r.floors} Floor${r.floors > 1 ? 's' : ''}`,
                  r.floorNumber != null && `Floor ${r.floorNumber}`,
                ].filter(Boolean) as string[];
                return chips.length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Residential Details</p>
                    <div className="flex flex-wrap gap-2">
                      {chips.map((c) => (
                        <span key={c} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{c}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Agriculture details */}
              {propertyDetail?.agricultureDetails && (() => {
                const a = propertyDetail.agricultureDetails;
                const rows = [
                  a.waterSource && ['Water Source', a.waterSource],
                  a.soilType    && ['Soil Type',    a.soilType],
                  a.surveyNumber && ['Survey No.',  a.surveyNumber],
                ].filter(Boolean) as [string, string][];
                return rows.length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Agriculture Details</p>
                    <div className="space-y-2">
                      {rows.map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-white/40">{label}</span>
                          <span className="text-white/80 capitalize">{val}</span>
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
                  ri.roadWidth && ['Road Width', ri.roadWidth],
                  ri.roadType  && ['Road Type',  ri.roadType],
                  ri.roadFacing != null && ['Road Facing', ri.roadFacing ? 'Yes' : 'No'],
                ].filter(Boolean) as [string, string][];
                return (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Road Access</p>
                    {rows.length > 0 ? (
                      <div className="space-y-2">
                        {rows.map(([label, val]) => (
                          <div key={label} className="flex justify-between text-xs">
                            <span className="text-white/40">{label}</span>
                            <span className="text-white/80 capitalize">{val}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/50">Road access available</p>
                    )}
                  </div>
                );
              })()}

              {/* Amenities */}
              {propertyDetail?.amenities && propertyDetail.amenities.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {propertyDetail.amenities.map((a) => (
                      <span key={a.id} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Property details grid: facing, condition, land use, document status */}
              {(() => {
                const p = selectedProperty;
                const rows = [
                  p.facing         && ['Facing',          p.facing],
                  p.condition      && ['Condition',        p.condition],
                  p.landUse        && ['Land Use',         p.landUse],
                  p.siteDimensions && ['Dimensions',       p.siteDimensions],
                  p.documentStatus && ['Documents',        p.documentStatus],
                  p.address        && ['Address',          p.address],
                ].filter(Boolean) as [string, string][];
                return rows.length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Property Info</p>
                    <div className="space-y-2">
                      {rows.map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-white/40">{label}</span>
                          <span className="text-white/80 capitalize text-right max-w-[60%]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Contact number */}
              {selectedProperty.contactNumber && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">Contact</p>
                    <p className="text-sm font-semibold text-white">{selectedProperty.contactNumber}</p>
                  </div>
                  <a
                    href={`tel:${selectedProperty.contactNumber}`}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition"
                  >
                    <Phone size={15} />
                  </a>
                </div>
              )}
            </div>

            {/* Enquiry form */}
            {showEnquiry && (
              <div className="shrink-0 px-4 pb-3 space-y-2">
                {enquirySent ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-emerald-400">
                    <CheckCircle size={28} />
                    <p className="text-sm font-semibold">Enquiry sent!</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={enquiryMsg}
                      onChange={(e) => setEnquiryMsg(e.target.value)}
                      placeholder="Hi, I'm interested in this property..."
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                    <input
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      type="tel"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowEnquiry(false)}
                        className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm text-white/60 hover:bg-white/5 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEnquirySubmit}
                        disabled={enquiryMsg.trim().length < 10 || enquirySubmitting}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                      >
                        <Send size={14} />
                        {enquirySubmitting ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="shrink-0 p-4 pt-0 space-y-2">
              {!showEnquiry && (
                <button
                  onClick={handleContact}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white hover:bg-emerald-600 transition"
                >
                  <Phone size={16} />
                  {isAuthenticated ? 'Contact Seller' : 'Login to Contact'}
                </button>
              )}
              <button
                onClick={handleSave}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-2xl border py-3.5 font-semibold transition',
                  isSaved
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'border-white/20 bg-white/5 text-white hover:bg-white/10',
                )}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? 'Saved' : 'Save Property'}
              </button>
            </div>
          </>
        ) : (

          // ── Menu content (no property selected) ──
          <>
            {/* Header */}
            <div className="shrink-0 px-6 pt-6 pb-4 border-b border-white/10">
              <div
                className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                {menuContent && <menuContent.Icon size={26} className="text-white" />}
              </div>
              <h1 className="text-2xl font-bold text-white">{menuContent?.title}</h1>
              <p className="mt-1 text-sm text-white/50">{menuContent?.description}</p>
            </div>

            {/* Tab-specific content */}
            {activeMenu === 'map' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-5">
                <SidebarCard className="p-5 flex flex-col items-center gap-3 text-center">
                  <Map size={28} className="text-white/30" />
                  <p className="text-sm text-white/50 leading-relaxed">
                    Click any property marker on the map to view its details here.
                  </p>
                </SidebarCard>
              </div>
            )}

            {/* ── Browse Properties (search tab) ── */}
            {activeMenu === 'search' && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <BrowsePanel onOpen={(p) => setSelectedProperty(p)} />
              </div>
            )}

            {/* ── Saved Properties ── */}
            {activeMenu === 'saved' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {!isAuthenticated ? (
                  <SidebarCard className="p-5 flex flex-col items-center gap-3 text-center">
                    <Lock size={28} className="text-white/30" />
                    <p className="text-sm text-white/50">Login to view your saved properties.</p>
                    <button
                      onClick={() => openLoginModal()}
                      className="mt-1 w-full rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30 transition"
                    >
                      Login
                    </button>
                  </SidebarCard>
                ) : savedProperties.length === 0 ? (
                  <SidebarCard className="p-5">
                    <p className="text-sm text-white/50">
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

            {/* ── Enquiries ── */}
            {activeMenu === 'messages' && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                {!isAuthenticated ? (
                  <div className="p-5">
                    <SidebarCard className="p-5 flex flex-col items-center gap-3 text-center">
                      <Lock size={28} className="text-white/30" />
                      <p className="text-sm text-white/50">Login to see your enquiries.</p>
                      <button
                        onClick={() => openLoginModal()}
                        className="w-full rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30 transition"
                      >
                        Login
                      </button>
                    </SidebarCard>
                  </div>
                ) : (
                  <EnquiriesPanel />
                )}
              </div>
            )}

            {/* ── Blog ── */}
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
