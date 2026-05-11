// Minimal InteractionController skeleton
export class InteractionController {
  private map: any | null = null;

  init(map: any) {
    this.map = map;
  }

  enable() {
    // toggle interaction handling (placeholder)
  }

  disable() {
    // toggle interaction handling (placeholder)
  }

  dispose() {
    this.map = null;
  }
}
