export function enableDistrictClick(map: any, onClick: (name: string) => void) {
  map.on("click", (e: any) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["cities-fill"],
    });

    if (!features.length) return;

    const feature = features[0];
    const district = feature?.properties?.NAME_2;

    if (!district) return;

    console.log("Clicked district:", district);

    onClick(district);
  });
}
