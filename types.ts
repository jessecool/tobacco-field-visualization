export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export interface TobaccoField {
  id: string;
  village: string;        // 村
  farmerName: string;     // 烟农姓名
  area: number;           // 种植面积 (亩)
  yieldPerMu: number;     // 亩产量 (公斤/亩)
  plantCount: number;     // 株数
  estimatedYield: number; // 预估产量 (公斤)
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon; // 地块形状
  center: [number, number]; // Lat, Lng for heatmap
}

export interface Stats {
  totalArea: number;
  totalYield: number;
  totalFarmers: number;
  totalFields: number;
  avgYieldPerMu: number;
}

export type SortField = 'area' | 'yieldPerMu' | 'plantCount' | 'estimatedYield' | 'village' | 'farmerName';
export type SortOrder = 'asc' | 'desc';

export enum ViewMode {
  POLYGON = 'POLYGON',
  HEATMAP = 'HEATMAP',
}

export enum VisualizationMetric {
  AREA = 'AREA',
  YIELD = 'YIELD',
}