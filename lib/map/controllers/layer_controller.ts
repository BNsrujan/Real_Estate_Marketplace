// Minimal LayerController skeleton
export class LayerController {
  private map: any | null = null;

  init(map: any) {
    this.map = map;
  }

  showLayer(id: string) {
    if (!this.map) return;
    try {
      this.map.setLayoutProperty(id, 'visibility', 'visible');
    } catch (e) {
      // noop
    }
  }

  hideLayer(id: string) {
    if (!this.map) return;
    try {
      this.map.setLayoutProperty(id, 'visibility', 'none');
    } catch (e) {
      // noop
    }
  }

  dispose() {
    this.map = null;
  }
}
