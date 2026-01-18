import { useCallback, useState } from 'react';
import type { Feature } from 'geojson';
import { getPolygonCenter } from '@/utils/map/geometry';

type MapRef = {
  queryRenderedFeaturesAtPoint?: (
    point: any,
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
    (feature as any).sourceLayer;
  if (typeof layerId === 'string' && layerId.includes('building')) {
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
      onDebug?.('tap: raw event', {
        hasEventFeatures: eventFeatures.length > 0,
        screenPoint,
        layerIds: layerIds ?? [],
      });
      const queryAtPoint = async (
        point: [number, number],
        attempt: number
      ) => {
        if (!map?.queryRenderedFeaturesAtPoint) {
          return [] as Feature[];
        }
        const result = await map.queryRenderedFeaturesAtPoint(
          point,
          undefined,
          layerIds
        );
        const list = result?.features ?? result?.features?.features ?? [];
        onDebug?.('tap: query at point', {
          attempt,
          count: list.length,
          point,
        });
        return list as Feature[];
      };
      if (eventFeatures.length) {
        features = eventFeatures;
        onDebug?.('tap: using event features', {
          count: features.length,
          firstLayerId: (features[0] as any)?.layer?.id,
        });
      } else if (map?.queryRenderedFeaturesAtPoint && screenPoint) {
        features = await queryAtPoint(screenPoint, 0);
        onDebug?.('tap: using queryRenderedFeaturesAtPoint', {
          count: features.length,
          firstLayerId: (features[0] as any)?.layer?.id,
        });
      } else {
        onDebug?.('tap: no features source', {
          hasMap: Boolean(map),
          hasQueryAtPoint: Boolean(map?.queryRenderedFeaturesAtPoint),
          hasScreenPoint: Boolean(screenPoint),
        });
      }
      if (!features.length && screenPoint) {
        const offsets = [-10, 0, 10];
        const samples: Feature[] = [];
        let attempt = 1;
        for (const dx of offsets) {
          for (const dy of offsets) {
            if (dx === 0 && dy === 0) {
              continue;
            }
            const list = await queryAtPoint(
              [screenPoint[0] + dx, screenPoint[1] + dy],
              attempt
            );
            attempt += 1;
            if (list.length) {
              samples.push(...list);
            }
          }
        }
        if (samples.length) {
          features = samples;
          onDebug?.('tap: using offset samples', {
            count: features.length,
          });
        }
      }
      const building = features.find(isBuildingFeature) ?? null;
      onDebug?.('tap: building selection', {
        found: Boolean(building),
        firstFeatureLayerId: (features[0] as any)?.layer?.id,
        firstFeatureProps: (features[0] as any)?.properties,
      });
      setSelectedFeature(building);
      if (!building) {
        return;
      }
      const center = getFeatureCenter(building);
      if (center) {
        onFocus(center);
        return;
      }
      const tapCoord = event?.geometry?.coordinates;
      if (Array.isArray(tapCoord) && tapCoord.length >= 2) {
        onFocus([tapCoord[0], tapCoord[1]]);
      }
    },
    [layerIds, mapRef, onFocus]
  );

  return { selectedFeature, onMapPress: handlePress };
};
