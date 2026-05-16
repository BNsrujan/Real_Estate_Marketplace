/**
 * mapLayerService — Custom layer lifecycle manager (SERVICE-003)
 *
 * Solves the setStyle() layer-destruction problem:
 * After map.setStyle() is called (e.g. switching from standard → satellite),
 * ALL custom sources and layers are wiped. This service re-injects them.
 *
 * Usage:
 *   mapLayerService.init(map);
 *   mapLayerService.register({ id: 'my-layer', ... });
 *   // In your layer-switching code, after setStyle resolves:
 *   map.once('styledata', () => mapLayerService.rehydrateLayers());
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMap = any; // maplibregl.Map — typed as any to avoid SSR issues

export interface RegisteredSource {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec: any; // maplibregl.SourceSpecification
}

export interface RegisteredLayer {
  id: string;
  sourceId?: string;
  sourceSpec?: RegisteredSource['spec'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layerSpec: any; // maplibregl.LayerSpecification
}

class MapLayerService {
  private map: AnyMap | null = null;
  private layers: RegisteredLayer[] = [];

  init(map: AnyMap) {
    this.map = map;
  }

  register(layer: RegisteredLayer) {
    // Deduplicate by layer id
    if (!this.layers.find((l) => l.id === layer.id)) {
      this.layers.push(layer);
    }
  }

  unregister(layerId: string) {
    this.layers = this.layers.filter((l) => l.id !== layerId);
  }

  rehydrateLayers() {
    if (!this.map) return;
    for (const layer of this.layers) {
      try {
        // Add source if it has one and it doesn't exist yet
        if (layer.sourceId && layer.sourceSpec && !this.sourceExists(layer.sourceId)) {
          this.map.addSource(layer.sourceId, layer.sourceSpec);
        }
        // Add layer if it doesn't exist
        if (!this.layerExists(layer.id)) {
          this.map.addLayer(layer.layerSpec);
        }
      } catch {
        // Swallow — layer may have been removed or style not ready yet
      }
    }
  }

  sourceExists(sourceId: string): boolean {
    try {
      return !!this.map?.getSource(sourceId);
    } catch {
      return false;
    }
  }

  layerExists(layerId: string): boolean {
    try {
      return !!this.map?.getLayer(layerId);
    } catch {
      return false;
    }
  }

  /** Call after map.setStyle() to auto-rehydrate on next styledata event */
  bindStyleRehydration() {
    if (!this.map) return;
    this.map.once('styledata', () => this.rehydrateLayers());
  }
}

export const mapLayerService = new MapLayerService();
