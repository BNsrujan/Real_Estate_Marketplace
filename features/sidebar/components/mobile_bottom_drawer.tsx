"use client";

import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import {
  Map, Search, Bookmark, BookmarkCheck, Bell, Activity,
  TrendingUp, Inbox, MapPin, X, Phone, Lock, Send, CheckCircle,
} from "lucide-react";
import PropertyCard from "@/features/properties/components/property_card";
import { submitEnquiry } from "@/features/properties/api/enquiry_api";
import { getPropertyById } from "@/features/properties/api/property_api";
import { useSidebarStore } from "../store/sidebar_store";
import { useStore } from "@/shared/store";
import { useWatchlistSync } from "@/features/properties/hooks/use_watchlist_sync";
import { SidebarCard } from "@/shared/ui/sidebar_card";
import type { PropertyDetail } from "@/shared/types";
import { Drawer, DrawerContent } from "@/shared/components/ui/drawer";

type MenuContent = {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const MENU_CONTENT: Record<string, MenuContent> = {
  map:      { id: "map",      title: "Map Explorer",     description: "Explore Karnataka properties with interactive layers.", Icon: Map },
  search:   { id: "search",   title: "Smart Search",     description: "Search properties by filters, location, and landmarks.", Icon: Search },
  saved:    { id: "saved",    title: "Saved Properties", description: "Your bookmarked properties and recent views.", Icon: Bookmark },
  messages: { id: "messages", title: "Messages",         description: "Chat with agents and property owners.", Icon: Inbox },
};

export default function MobileBottomDrawer() {
  const activeMenu          = useSidebarStore((s) => s.activeMenu);
  const isPanelOpen         = useSidebarStore((s) => s.isPanelOpen);
  const closePanel          = useSidebarStore((s) => s.closePanel);
  const selectedProperty    = useSidebarStore((s) => s.selectedProperty);
  const setSelectedProperty = useSidebarStore((s) => s.setSelectedProperty);

  const saved           = useStore((s) => s.watchlist.saved);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal  = useStore((s) => s.openLoginModal);
  const { saveProperty, unsaveProperty } = useWatchlistSync();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const menuData = useMemo(() => (activeMenu ? MENU_CONTENT[activeMenu] ?? null : null), [activeMenu]);
  const isSaved  = selectedProperty ? saved.some((p) => p.id === selectedProperty.id) : false;

  const [showEnquiry,       setShowEnquiry]       = useState(false);
  const [enquiryMsg,        setEnquiryMsg]        = useState("");
  const [enquiryPhone,      setEnquiryPhone]      = useState("");
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySent,       setEnquirySent]       = useState(false);
  const [propertyDetail,    setPropertyDetail]    = useState<PropertyDetail | null>(null);

  useEffect(() => {
    if (!selectedProperty) { setPropertyDetail(null); return; }
    getPropertyById(selectedProperty.id)
      .then(setPropertyDetail)
      .catch(() => setPropertyDetail(null));
  }, [selectedProperty?.id]);

  const handleClose = () => {
    setSelectedProperty(null);
    closePanel();
    setShowEnquiry(false);
    setEnquiryMsg("");
    setEnquiryPhone("");
    setEnquirySent(false);
  };

  const handleSave = () => {
    if (!selectedProperty) return;
    if (!isAuthenticated) {
      openLoginModal({ type: "SAVE_PROPERTY", payload: { propertyId: selectedProperty.id } });
      return;
    }
    if (isSaved) unsaveProperty(selectedProperty.id);
    else saveProperty(selectedProperty);
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      openLoginModal({ type: "CONTACT_SELLER", payload: { propertyId: selectedProperty?.id ?? "" } });
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
        message:    enquiryMsg.trim(),
        phone:      enquiryPhone.trim() || undefined,
      });
      setEnquirySent(true);
      setTimeout(() => {
        setEnquirySent(false);
        setShowEnquiry(false);
        setEnquiryMsg("");
        setEnquiryPhone("");
      }, 2500);
    } catch {
      // error toast handled by apiService
    } finally {
      setEnquirySubmitting(false);
    }
  };

  return (
    <Drawer
      open={isMobile && isPanelOpen}
      onOpenChange={(open) => { if (!open) closePanel(); }}
      direction="bottom"
    >
      <DrawerContent
        className="bg-background border-t border-border rounded-t-3xl md:hidden max-h-[75vh] pb-20"
        style={{ bottom: "4rem" }}
      >
        {selectedProperty ? (
          /* ── Property detail ── */
          <div className="overflow-y-auto flex-1 p-3">
            {/* Hero image */}
            <div className="relative h-48 w-full shrink-0 mt-3 px-3 overflow-hidden rounded-t-2xl">
              <Image
                src={selectedProperty.thumbnailUrl || selectedProperty.imageUrls?.[0] || "/property/image.png"}
                alt={selectedProperty.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/70 flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors active:scale-95"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground capitalize">
                    For {selectedProperty.listingType}
                  </span>
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 transition-colors active:scale-95"
                  >
                    {isSaved
                      ? <BookmarkCheck size={16} className="text-primary" />
                      : <Bookmark size={16} className="text-white" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-4 pt-4 pb-2 space-y-3">
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">{selectedProperty.title}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={13} />
                  {[selectedProperty.city, selectedProperty.taluk, selectedProperty.districtName]
                    .filter(Boolean).join(", ") || "Karnataka"}
                </p>
              </div>

              {/* Price & Area */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-border bg-card p-3">
                  <p className="label mb-0.5">Price</p>
                  <p className="text-base font-bold text-foreground">{selectedProperty.priceLabel}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3">
                  <p className="label mb-0.5">Area</p>
                  <p className="text-base font-bold text-foreground">{selectedProperty.sizeLabel}</p>
                </div>
              </div>

              {/* CTAs */}
              {!showEnquiry && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleContact}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200"
                  >
                    <Phone size={15} />
                    {isAuthenticated ? "Contact" : "Login to Contact"}
                  </button>
                  <button
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      isSaved
                        ? "border-primary/40 bg-secondary text-primary"
                        : "border-border bg-muted text-foreground"
                    }`}
                  >
                    {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                    {isSaved ? "Saved" : "Save"}
                  </button>
                </div>
              )}

              {/* Enquiry form */}
              {showEnquiry && (
                <div className="pt-1 space-y-2">
                  {enquirySent ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-primary">
                      <CheckCircle size={24} />
                      <p className="text-sm font-semibold">Enquiry sent!</p>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={enquiryMsg}
                        onChange={(e) => setEnquiryMsg(e.target.value)}
                        placeholder="Hi, I'm interested in this property..."
                        rows={3}
                        className="w-full rounded-t-xl rounded-b-none border-0 border-b-2 border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none transition-colors"
                      />
                      <input
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="Phone number (optional)"
                        type="tel"
                        className="w-full rounded-t-xl rounded-b-none border-0 border-b-2 border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setShowEnquiry(false)}
                          className="flex-1 rounded-full border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted active:scale-95 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEnquirySubmit}
                          disabled={enquiryMsg.trim().length < 10 || enquirySubmitting}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all duration-200"
                        >
                          <Send size={14} />
                          {enquirySubmitting ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Extended details */}
              {propertyDetail?.residentialDetails && (() => {
                const r = propertyDetail.residentialDetails;
                const chips = [
                  r.bhkLabel,
                  r.bedrooms != null && `${r.bedrooms} Bed`,
                  r.bathrooms != null && `${r.bathrooms} Bath`,
                  r.furnishedStatus,
                ].filter(Boolean) as string[];
                return chips.length > 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-3">
                    <p className="label mb-2">Details</p>
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((c) => (
                        <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{c}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {propertyDetail?.amenities && propertyDetail.amenities.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-3">
                  <p className="label mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {propertyDetail.amenities.map((a) => (
                      <span key={a.id} className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs text-primary">{a.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProperty.contactNumber && (
                <a
                  href={`tel:${selectedProperty.contactNumber}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2.5 hover:bg-secondary/50 transition-colors active:scale-[0.99]"
                >
                  <div>
                    <p className="label">Contact</p>
                    <p className="text-sm font-semibold text-foreground">{selectedProperty.contactNumber}</p>
                  </div>
                  <Phone size={16} className="text-primary" />
                </a>
              )}
            </div>
          </div>
        ) : (
          /* ── Menu content ── */
          <div className="overflow-y-auto flex-1 px-4 pt-2 pb-4">
            {/* Hero */}
            <div className="mb-6">
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary border border-border">
                {menuData && <menuData.Icon size={26} className="text-primary" />}
              </div>
              <h2 className="mb-1.5 text-xl font-bold text-foreground tracking-tight">{menuData?.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{menuData?.description}</p>
            </div>

            <div className="space-y-3">
              {activeMenu === "map" && (
                <>
                  {["Live Property Layers", "Nearby Infrastructure", "Satellite Intelligence"].map((title) => (
                    <SidebarCard key={title} className="p-4">
                      <h3 className="mb-1.5 font-semibold text-foreground text-sm">{title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Advanced real estate visualization powered by Karnataka geo-spatial intelligence.
                      </p>
                    </SidebarCard>
                  ))}
                </>
              )}

              {activeMenu === "search" && (
                <>
                  <div className="flex items-center gap-3 rounded-t-xl rounded-b-none border-0 border-b-2 border-border bg-input px-4 py-3 focus-within:border-primary transition-colors">
                    <Search size={16} className="text-muted-foreground shrink-0" />
                    <input
                      placeholder="Search properties..."
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Under ₹50L", "Villa", "Apartment", "Commercial"].map((item) => (
                      <button
                        key={item}
                        className="rounded-full border border-border bg-muted px-3 py-2.5 text-xs text-foreground transition-all duration-200 hover:bg-secondary active:scale-95"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeMenu === "saved" && (
                <div className="space-y-3">
                  {!isAuthenticated ? (
                    <SidebarCard className="p-4 flex flex-col items-center gap-3 text-center">
                      <Lock size={24} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Login to view saved properties.</p>
                      <button
                        onClick={() => openLoginModal()}
                        className="w-full rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
                      >
                        Login
                      </button>
                    </SidebarCard>
                  ) : saved.length === 0 ? (
                    <SidebarCard className="p-4">
                      <p className="text-xs text-muted-foreground">No saved properties yet. Start exploring the map to bookmark listings.</p>
                    </SidebarCard>
                  ) : (
                    saved.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onOpen={(p) => { setSelectedProperty(p); }}
                      />
                    ))
                  )}
                </div>
              )}

              {activeMenu === "messages" && (
                <SidebarCard className="p-4">
                  {!isAuthenticated ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Lock size={24} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Login to see your messages.</p>
                      <button
                        onClick={() => openLoginModal()}
                        className="w-full rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
                      >
                        Login
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No messages yet.</p>
                  )}
                </SidebarCard>
              )}
            </div>

            {/* Quick actions */}
            <div className="mt-6 space-y-2 border-t border-border pt-4">
              <p className="label">Quick Access</p>
              {[
                { Icon: Bell,       label: "Notifications" },
                { Icon: Activity,   label: "Recent Activity" },
                { Icon: TrendingUp, label: "Trending Locations" },
              ].map(({ Icon, label }) => (
                <SidebarCard key={label} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/60 transition-colors duration-200">
                  <Icon size={16} className="text-primary shrink-0" />
                  <span className="text-xs text-foreground">{label}</span>
                </SidebarCard>
              ))}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
