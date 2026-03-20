export function enableDistrictClick(map: any, onClick: (name: string) => void) {
  if (!map) return;

  map.on("click", (e: any) => {
    if (!map.getLayer("cities-fill")) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["cities-fill"],
    });

    if (!features.length) return;

    const name = features[0].properties?.NAME_2;

    if (name) {
      onClick(name);
    }
  });
}
