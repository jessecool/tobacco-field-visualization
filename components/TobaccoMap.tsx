import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { TobaccoField, ViewMode, VisualizationMetric } from '../types';

// Fix for default Leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle heatmaps (Leaflet.heat needs imperative manipulation)
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore - leaflet-heat adds 'heatLayer' to L
    if (!L.heatLayer) return;

    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

// Component to handle auto-centering
const MapRefocus = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
};

interface TobaccoMapProps {
  data: TobaccoField[];
  viewMode: ViewMode;
  metric: VisualizationMetric;
  selectedFieldId?: string;
  onFieldSelect: (field: TobaccoField) => void;
}

export const TobaccoMap: React.FC<TobaccoMapProps> = ({ 
  data, 
  viewMode, 
  metric, 
  selectedFieldId, 
  onFieldSelect 
}) => {
  const mapRef = useRef<L.Map>(null);

  // Calculate center of all data
  const center: [number, number] = data.length > 0 
    ? data[0].center 
    : [25.04, 102.70];

  // Get color based on metric value
  const getColor = (field: TobaccoField) => {
    if (selectedFieldId === field.id) return '#f59e0b'; // Amber for selected

    if (metric === VisualizationMetric.AREA) {
      // Area based coloring (Light Green -> Dark Green)
      return field.area > 20 ? '#14532d' :
             field.area > 15 ? '#166534' :
             field.area > 10 ? '#15803d' :
             field.area > 5  ? '#22c55e' :
                               '#86efac';
    } else {
      // Yield based coloring (Yellow -> Red)
      return field.yieldPerMu > 160 ? '#7f1d1d' :
             field.yieldPerMu > 150 ? '#991b1b' :
             field.yieldPerMu > 140 ? '#b91c1c' :
             field.yieldPerMu > 130 ? '#ef4444' :
                                      '#fca5a5';
    }
  };

  // Prepare heatmap points: [lat, lng, intensity]
  const heatmapPoints = React.useMemo(() => {
    if (viewMode !== ViewMode.HEATMAP) return [];
    
    // Find max value to normalize intensity
    const maxVal = Math.max(...data.map(d => metric === VisualizationMetric.AREA ? d.area : d.estimatedYield));
    
    return data.map(d => [
      d.center[0], 
      d.center[1], 
      (metric === VisualizationMetric.AREA ? d.area : d.estimatedYield) / maxVal
    ] as [number, number, number]);
  }, [data, viewMode, metric]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="h-full w-full"
        ref={mapRef}
      >
        <MapRefocus center={center} />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="卫星地图 (Satellite)">
             <TileLayer
              attribution='&copy; Google Maps'
              url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="标准地图 (Standard)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {viewMode === ViewMode.POLYGON && data.map((field) => (
          <Polygon
            key={field.id}
            positions={(field.geometry as any).coordinates[0].map((c: any) => [c[1], c[0]])}
            pathOptions={{
              color: getColor(field),
              fillColor: getColor(field),
              fillOpacity: selectedFieldId === field.id ? 0.8 : 0.6,
              weight: selectedFieldId === field.id ? 3 : 1
            }}
            eventHandlers={{
              click: () => onFieldSelect(field)
            }}
          >
             <Popup className="font-sans">
              <div className="p-1">
                <h3 className="font-bold text-lg text-tobacco-700">{field.village} - {field.farmerName}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                  <span>种植面积:</span> <span className="font-medium">{field.area.toFixed(2)} 亩</span>
                  <span>亩产量:</span> <span className="font-medium">{field.yieldPerMu.toFixed(1)} kg</span>
                  <span>总株数:</span> <span className="font-medium">{field.plantCount} 株</span>
                  <span>预估产量:</span> <span className="font-medium">{field.estimatedYield.toFixed(1)} kg</span>
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        {viewMode === ViewMode.HEATMAP && (
          <HeatmapLayer points={heatmapPoints} />
        )}
      </MapContainer>
    </div>
  );
};
