import { TobaccoField, GeoJSONPolygon } from "./types";

// Helper to generate a simple polygon near a center point
const generatePolygon = (lat: number, lng: number, size: number): GeoJSONPolygon => {
  const d = size * 0.001;
  return {
    type: "Polygon",
    coordinates: [[
      [lng - d, lat - d],
      [lng + d, lat - d],
      [lng + d, lat + d],
      [lng - d, lat + d],
      [lng - d, lat - d]
    ]]
  };
};

export const MOCK_DATA: TobaccoField[] = [
  {
    id: "1",
    village: "和平村",
    farmerName: "张三",
    area: 15.5,
    yieldPerMu: 140,
    plantCount: 18000,
    estimatedYield: 2170,
    center: [25.04, 102.70],
    geometry: generatePolygon(25.04, 102.70, 1.2)
  },
  {
    id: "2",
    village: "和平村",
    farmerName: "李四",
    area: 8.2,
    yieldPerMu: 135,
    plantCount: 9500,
    estimatedYield: 1107,
    center: [25.045, 102.705],
    geometry: generatePolygon(25.045, 102.705, 0.8)
  },
  {
    id: "3",
    village: "建设村",
    farmerName: "王五",
    area: 22.0,
    yieldPerMu: 155,
    plantCount: 26000,
    estimatedYield: 3410,
    center: [25.035, 102.69],
    geometry: generatePolygon(25.035, 102.69, 1.5)
  },
  {
    id: "4",
    village: "建设村",
    farmerName: "赵六",
    area: 12.5,
    yieldPerMu: 145,
    plantCount: 14000,
    estimatedYield: 1812.5,
    center: [25.038, 102.695],
    geometry: generatePolygon(25.038, 102.695, 1.0)
  },
  {
    id: "5",
    village: "向阳村",
    farmerName: "孙七",
    area: 30.1,
    yieldPerMu: 160,
    plantCount: 35000,
    estimatedYield: 4816,
    center: [25.05, 102.71],
    geometry: generatePolygon(25.05, 102.71, 2.0)
  }
];

export const MAP_CENTER_DEFAULT: [number, number] = [25.04, 102.70]; // Kunming approx
export const MAP_ZOOM_DEFAULT = 13;