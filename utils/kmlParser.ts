import { TobaccoField, GeoJSONPolygon, GeoJSONMultiPolygon } from "../types";

/**
 * Parses a KML string and extracts tobacco field data.
 * This is a simplified parser designed to look for standard KML structures
 * and specific ExtendedData names often used in agricultural shapefiles.
 */
export const parseKML = (kmlText: string): TobaccoField[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, "text/xml");
  const placemarks = xmlDoc.getElementsByTagName("Placemark");
  const results: TobaccoField[] = [];

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];
    
    // 1. Extract Geometry (Polygon)
    const polygon = placemark.getElementsByTagName("Polygon")[0];
    const multiGeometry = placemark.getElementsByTagName("MultiGeometry")[0];
    
    let geometry: GeoJSONPolygon | GeoJSONMultiPolygon | null = null;
    let center: [number, number] = [0, 0];

    // Helper to parse coordinate string "lon,lat,alt ..."
    const parseCoords = (str: string): number[][] => {
      return str.trim().split(/\s+/).map(coord => {
        const parts = coord.split(',');
        return [parseFloat(parts[0]), parseFloat(parts[1])]; // GeoJSON is [lon, lat]
      });
    };

    if (polygon) {
      const coordsText = polygon.getElementsByTagName("coordinates")[0]?.textContent || "";
      const ring = parseCoords(coordsText);
      if (ring.length > 0) {
        geometry = {
          type: "Polygon",
          coordinates: [ring]
        };
        // Calculate rough center
        const lats = ring.map(c => c[1]);
        const lngs = ring.map(c => c[0]);
        center = [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2
        ];
      }
    } 
    // Basic support for simple MultiGeometry if Polygon is missing, 
    // though for simplicity in this demo we primarily target Polygons.
    
    if (!geometry) continue;

    // 2. Extract Attributes
    // ExtendedData is the standard way, but sometimes it's in Description
    const extendedData = placemark.getElementsByTagName("SimpleData");
    const nameTag = placemark.getElementsByTagName("name")[0];
    
    let village = "未知村";
    let farmerName = nameTag?.textContent || "未知户";
    let area = 0;
    let yieldPerMu = 0;
    let plantCount = 0;
    let estimatedYield = 0;

    // Try to find attributes in ExtendedData -> SchemaData -> SimpleData
    for (let j = 0; j < extendedData.length; j++) {
      const item = extendedData[j];
      const name = item.getAttribute("name")?.toLowerCase() || "";
      const val = item.textContent || "";

      if (name.includes("村") || name.includes("village")) village = val;
      if (name.includes("姓名") || name.includes("owner") || name.includes("farmer")) farmerName = val;
      if (name.includes("面积") || name.includes("area")) area = parseFloat(val) || 0;
      if (name.includes("亩产") || name.includes("yield_unit")) yieldPerMu = parseFloat(val) || 0;
      if (name.includes("株数") || name.includes("count")) plantCount = parseFloat(val) || 0;
      if (name.includes("产量") && !name.includes("亩")) estimatedYield = parseFloat(val) || 0;
    }

    // Heuristics: if specific fields are missing, try to derive them or random fill for demo purposes 
    // (In a real app, we would just leave them 0 or error)
    if (yieldPerMu === 0 && estimatedYield > 0 && area > 0) yieldPerMu = estimatedYield / area;
    if (estimatedYield === 0 && area > 0 && yieldPerMu > 0) estimatedYield = area * yieldPerMu;

    // If still missing essential data, try searching the <description> HTML table
    const desc = placemark.getElementsByTagName("description")[0]?.textContent;
    if (desc) {
      // Very basic regex matching for description tables often exported by ArcGIS/QGIS
      if (village === "未知村") {
        const match = desc.match(/<td>(村.*?)<\/td>\s*<td>(.*?)<\/td>/);
        if (match) village = match[2];
      }
    }

    results.push({
      id: `field-${i}`,
      village,
      farmerName,
      area,
      yieldPerMu,
      plantCount,
      estimatedYield,
      geometry,
      center: center as [number, number]
    });
  }

  return results;
};