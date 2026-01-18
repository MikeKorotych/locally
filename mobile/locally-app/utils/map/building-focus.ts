import { useCallback, useState } from 'react';
import type { Feature, Polygon } from 'geojson';
import { buffer } from '@turf/buffer';
import { getPolygonCenter, getDistance } from '@/utils/map/geometry';

type MapRef = {
  queryRenderedFeaturesAtPoint?: (
    point: any,
    filter?: any,
    layerIDs?: string[]
  ) => Promise<any>;
  queryRenderedFeaturesInRect?: (
    rect: any,
    filter?: any,
    layerIDs?: string[]
  ) => Promise<any>;
};

type UseBuildingFocusParams = {
  mapRef: React.RefObject<MapRef | null>;
  onFocus: (center: [number, number]) => void;
  layerIds?: string[];
  onDebug?: (message: string, payload?: Record<string, unknown>) => void;
};

const isBuildingFeature = (feature: Feature) => {
  const geometry = feature.geometry;
  if (
    geometry?.type !== 'Polygon' &&
    geometry?.type !== 'MultiPolygon'
  ) {
    return false;
  }
  const layerId =
    (feature as any).layer?.id ??
    (feature as any).sourceLayerID ??
    (feature as any).sourceLayer ??
    feature.properties?.layer;
  if (typeof layerId === 'string' && (layerId.includes('building') || layerId.includes('extrusion'))) {
    return true;
  }
  const props = feature.properties as any;
  if (typeof props?.render_height === 'number') {
    return true;
  }
  if (props?.extrude === 'true' || props?.extrude === true) {
    return true;
  }
  return props?.class === 'building' || props?.type === 'building';
};

const getFeatureCenter = (feature: Feature): [number, number] | null => {
  const geometry = feature.geometry;
  if (geometry?.type === 'Polygon') {
    return getPolygonCenter(geometry.coordinates as any) ?? null;
  }
  if (geometry?.type === 'MultiPolygon') {
    const polygons = geometry.coordinates as any;
    if (polygons.length > 0) {
      return getPolygonCenter(polygons[0]) ?? null;
    }
  }
  return null;
};

export const useBuildingFocus = ({
  mapRef,
  onFocus,
  layerIds,
  onDebug,
}: UseBuildingFocusParams) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const handlePress = useCallback(
    async (event: any) => {
      const map = mapRef.current;
      const eventFeatures = (event?.features ?? []) as Feature[];
      const tapLngLat = event?.geometry?.coordinates as [number, number];
      const screenPoint =
        (Array.isArray(event?.point) ? event.point : undefined) ??
        (event?.point?.x !== undefined && event?.point?.y !== undefined
          ? [event.point.x, event.point.y]
          : undefined) ??
        (event?.properties?.screenPointX !== undefined &&
        event?.properties?.screenPointY !== undefined
          ? [event.properties.screenPointX, event.properties.screenPointY]
          : undefined);

      let features: Feature[] = [];
      
      const queryInRect = async (point: [number, number]) => {
        if (!map?.queryRenderedFeaturesInRect) return [];
        // Создаем квадрат 30x30 пикселей вокруг точки тапа
        const size = 15;
        const rect = [point[1] + size, point[0] + size, point[1] - size, point[0] - size];
        const result = await map.queryRenderedFeaturesInRect(rect, undefined, layerIds);
        return (result?.features ?? result?.features?.features ?? []) as Feature[];
      };

      if (eventFeatures.length) {
        features = eventFeatures;
      } else if (screenPoint) {
        features = await queryInRect(screenPoint);
      }

      let building = features.find(isBuildingFeature) ?? null;

      // КЛЮЧЕВОЙ МОМЕНТ: Если это MultiPolygon (целый район), выбираем только ближайший кусочек
      if (building && building.geometry.type === 'MultiPolygon' && tapLngLat) {
        onDebug?.('tap: exploding MultiPolygon', { parts: (building.geometry as any).coordinates.length });
        
        const parts = (building.geometry as any).coordinates;
        let bestPart = parts[0];
        let minDistance = Infinity;

        for (const part of parts) {
          const center = getPolygonCenter(part);
          if (center) {
            const dist = getDistance(center, tapLngLat);
            if (dist < minDistance) {
              minDistance = dist;
              bestPart = part;
            }
          }
        }

        // Превращаем MultiPolygon в обычный Polygon из одной части
        building = {
          ...building,
          geometry: {
            type: 'Polygon',
            coordinates: bestPart
          } as Polygon
        };
      }
      
      // "Одеваем объемный чехол": расширяем геометрию на 20 см во все стороны
      // чтобы убрать мерцание (Z-fighting) на стенах здания
      if (building) {
        try {
          const buffered = buffer(building, 0.2, { units: 'meters' });
          if (buffered) {
            building = buffered as Feature<Polygon>;
          }
        } catch (err) {
          console.log('Error buffering building geometry:', err);
        }
      }
      
      if (building) {
        console.log('--- SELECTED BUILDING DATA (FIXED & BUFFERED) ---');
        console.log('ID:', building.id);
        console.log('Geometry Type:', building.geometry.type);
        console.log('------------------------------');
      }

      setSelectedFeature(building);
      if (!building) return;

      const center = getFeatureCenter(building);
      if (center) {
        onFocus(center);
      } else if (tapLngLat) {
        onFocus(tapLngLat);
      }
    },
    [layerIds, mapRef, onFocus, onDebug]
  );

  return { selectedFeature, onMapPress: handlePress };
};
