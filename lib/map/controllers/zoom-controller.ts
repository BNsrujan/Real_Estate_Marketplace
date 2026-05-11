// Minimal ZoomController skeleton
export enum ZoomState {
  WORLD = 'WORLD_VIEW',
  INDIA = 'INDIA_VIEW',
  KARNATAKA = 'KARNATAKA_VIEW',
  DISTRICT = 'DISTRICT_VIEW',
  CITY = 'CITY_VIEW',
  STREET = 'STREET_VIEW',
}

export type ZoomLevelCallback = (zoom: number) => void;
export type ZoomStateCallback = (state: ZoomState, from?: ZoomState, zoom?: number) => void;

import { ZOOM_RANGES } from "../config/zoom-ranges";

export class ZoomController {
  private map: any | null = null;
  private zoomLevelCbs: Set<ZoomLevelCallback> = new Set();
  private enterCbs: Set<ZoomStateCallback> = new Set();
  private exitCbs: Set<ZoomStateCallback> = new Set();
  private currentState: ZoomState | null = null;
  private rafId: number | null = null;
  private pendingFrame = false;

  constructor(map?: any) {
    if (map) this.init(map);
  }

  init(map: any) {
    this.dispose();
    this.map = map;

    // compute initial state
    const z = this.map.getZoom?.() ?? 0;
    this.currentState = this.getStateFromZoom(z);

    // Throttled zoom level updates via rAF for performance
    const onZoom = () => {
      if (this.pendingFrame) return;
      this.pendingFrame = true;
      this.rafId = requestAnimationFrame(() => {
        this.pendingFrame = false;
        if (!this.map) return;
        const zoom = this.map.getZoom();
        this.emitZoomLevel(zoom);
      });
    };

    const onZoomEnd = () => {
      if (!this.map) return;
      const zoom = this.map.getZoom();
      this.evaluateState(zoom);
    };

    // Attach light-weight handlers
    try {
      this.map.on("zoom", onZoom);
      this.map.on("zoomend", onZoomEnd);
      this.map.on("moveend", onZoomEnd);
    } catch (e) {
      // map may not support events in some contexts — ignore
    }
  }

  dispose() {
    if (this.map) {
      try {
        this.map.off("zoom");
        this.map.off("zoomend");
        this.map.off("moveend");
      } catch {}
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.zoomLevelCbs.clear();
    this.enterCbs.clear();
    this.exitCbs.clear();
    this.map = null;
    this.currentState = null;
    this.pendingFrame = false;
  }

  // Subscriptions
  onZoomLevel(cb: ZoomLevelCallback) {
    this.zoomLevelCbs.add(cb);
    return () => this.zoomLevelCbs.delete(cb);
  }

  onEnter(cb: ZoomStateCallback) {
    this.enterCbs.add(cb);
    return () => this.enterCbs.delete(cb);
  }

  onExit(cb: ZoomStateCallback) {
    this.exitCbs.add(cb);
    return () => this.exitCbs.delete(cb);
  }

  getState(): ZoomState | null {
    return this.currentState;
  }

  // Internal: determine state and emit enter/exit if changed
  private evaluateState(zoom: number) {
    const next = this.getStateFromZoom(zoom);
    const prev = this.currentState;
    if (next !== prev) {
      // exit prev
      if (prev) {
        this.exitCbs.forEach((cb) => cb(prev, next, zoom));
      }
      // enter next
      this.currentState = next;
      this.enterCbs.forEach((cb) => cb(next, prev ?? undefined, zoom));
    }
  }

  private emitZoomLevel(zoom: number) {
    this.zoomLevelCbs.forEach((cb) => cb(zoom));
  }

  getStateFromZoom(zoom: number): ZoomState {
    // use ZOOM_RANGES for thresholds
    if (zoom <= (ZOOM_RANGES.WORLD.max ?? 3)) return ZoomState.WORLD;
    if (zoom <= (ZOOM_RANGES.INDIA.max ?? 6)) return ZoomState.INDIA;
    if (zoom <= (ZOOM_RANGES.KARNATAKA.max ?? 9)) return ZoomState.KARNATAKA;
    if (zoom <= (ZOOM_RANGES.DISTRICT.max ?? 12)) return ZoomState.DISTRICT;
    if (zoom <= (ZOOM_RANGES.CITY.max ?? 15)) return ZoomState.CITY;
    return ZoomState.STREET;
  }
}

