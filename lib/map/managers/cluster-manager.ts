// Minimal ClusterManager skeleton
export class ClusterManager {
  private map: any | null = null;

  init(map: any) {
    this.map = map;
  }

  /**
   * Given a cluster feature, return the expansion zoom for that cluster.
   * This delegates to maplibre's getClusterExpansionZoom when available.
   */
  async getClusterExpansionZoom(sourceId: string, clusterId: number) {
    if (!this.map) return null;
    try {
      return await this.map.getSource(sourceId).getClusterExpansionZoom(clusterId);
    } catch {
      return null;
    }
  }

  /**
   * Returns leaves for a given cluster feature (first N members).
   */
  async getClusterLeaves(sourceId: string, clusterId: number, limit = 10) {
    if (!this.map) return [];
    try {
      return await this.map.getSource(sourceId).getClusterLeaves(clusterId, limit, 0);
    } catch {
      return [];
    }
  }

  /**
   * Adjust cluster parameters without removing source (best-effort)
   */
  rebuildClusters(options?: { clusterRadius?: number; clusterMaxZoom?: number }) {
    if (!this.map) return;
    try {
      const src = this.map.getSource("properties-source");
      if (!src) return;
      // MapLibre doesn't expose setOptions for cluster directly; best-effort: re-add source config
      const data = src.serialize ? src.serialize() : null;
      const current = data ?? { type: "FeatureCollection", features: [] };
      this.map.removeSource("properties-source");
      this.map.addSource("properties-source", {
        type: "geojson",
        data: current,
        cluster: true,
        clusterRadius: options?.clusterRadius ?? 50,
        clusterMaxZoom: options?.clusterMaxZoom ?? 14,
      });
    } catch (e) {
      // ignore — this operation is best-effort
    }
  }

  dispose() {
    this.map = null;
  }
}

