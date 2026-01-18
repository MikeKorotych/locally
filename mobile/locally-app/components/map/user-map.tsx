import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Mapbox, {
  Camera,
  FillExtrusionLayer,
  MapView,
  ShapeSource,
  UserLocation,
  type Location as MapboxLocation,
} from '@rnmapbox/maps';
import type { EdgeInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ProfileColors } from '@/utils/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMapCamera } from '@/utils/map/camera';
import { useCurrentAddress } from '@/utils/map/current-address';
import { useUserLocation } from '@/utils/map/location';
import { useMapLogger } from '@/utils/map/logger';
import { useBuildingFocus } from '@/utils/map/building-focus';

const ZOOM_LEVEL = 18;
const PITCH_ANGLE = 60;

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (mapboxToken) {
  Mapbox.setAccessToken(mapboxToken);
}

type UserMapProps = {
  colors: typeof ProfileColors.light | typeof ProfileColors.dark;
  insets: EdgeInsets;
};

export const UserMap = ({ colors, insets }: UserMapProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const styleLoadedRef = useRef(false);
  const { locationRef, requestAndLoadLocation } = useUserLocation();
  const { address, addressDetails, resolveAddress } = useCurrentAddress();
  const mapLogger = useMapLogger('UserMap');
  const lastLoggedAddressRef = useRef<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const [buildingLayerIds, setBuildingLayerIds] = useState<string[]>([]);
  const fallbackBuildingLayerIds = useMemo(
    () => ['building', 'building-3d', '3d-buildings', 'building-extrusion'],
    []
  );
  const {
    cameraRef,
    cameraSettings,
    initialCamera,
    setCameraToLocation,
    onCameraChanged,
    setCameraToCoordinate,
  } = useMapCamera({
    initialCenter: [34.4949, 49.5440],
    initialZoom: ZOOM_LEVEL,
    pitch: PITCH_ANGLE,
  });
  const activeBuildingLayerIds =
    buildingLayerIds.length > 0
      ? buildingLayerIds
      : fallbackBuildingLayerIds;
  const { selectedFeature, onMapPress } = useBuildingFocus({
    mapRef,
    onFocus: (center) => setCameraToCoordinate(center, 800, ZOOM_LEVEL),
    layerIds: activeBuildingLayerIds,
    onDebug: (message, payload) => mapLogger.debug(message, payload),
  });

  // Стабильные данные для подсветки: если ничего не выбрано, передаем пустую коллекцию
  const highlightShape = useMemo(
    () =>
      (selectedFeature || {
        type: 'FeatureCollection',
        features: [],
      }) as any,
    [selectedFeature]
  );

  useEffect(() => {
    mapLogger.debug('map style loaded state', {
      loaded: styleLoadedRef.current,
    });
  }, [mapLogger]);

  const handleCenterMap = async () => {
    if (locationRef.current) {
      setCameraToLocation(locationRef.current);
    }

    try {
      mapLogger.debug('centering map');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = await requestAndLoadLocation();
      if (current) {
        setCameraToLocation(current);
        void resolveAddress({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      }
    } catch (error) {
      console.log('error centering map', error);
    }
  };

  const loadLocation = useCallback(async () => {
    const current = await requestAndLoadLocation();
    if (current) {
      setCameraToLocation(current, 0);
      void resolveAddress({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    }
  }, [requestAndLoadLocation, setCameraToLocation, resolveAddress]);

  useEffect(() => {
    void loadLocation();
  }, [loadLocation]);

  const handleUserLocationUpdate = async (location: MapboxLocation) => {
    const coordinate = [
      location.coords.longitude,
      location.coords.latitude,
    ];
    mapLogger.debug('userLocationUpdate', {
      coordinate,
      styleLoaded: styleLoadedRef.current,
    });
  };

  useEffect(() => {
    if (!address && !addressDetails) {
      return;
    }
    if (address && address !== lastLoggedAddressRef.current) {
      lastLoggedAddressRef.current = address;
      mapLogger.debug('current address', {
        address,
        addressDetails,
      });
    }
  }, [address, addressDetails, mapLogger]);

  return (
    <>
      <MapView
        ref={mapRef}
        style={styles.map}
        styleURL="https://tiles.openfreemap.org/styles/liberty"
        compassEnabled
        compassViewPosition={3}
        compassViewMargins={{
          x: 16,
          y: insets.bottom + 16 + 48 + 12,
        }}
        pitchEnabled
        // @ts-expect-error: interactiveLayerIds supported by Mapbox SDK but missing in types
        interactiveLayerIds={activeBuildingLayerIds}
        onPress={onMapPress}
        onCameraChanged={onCameraChanged}
        onDidFinishLoadingStyle={async () => {
          styleLoadedRef.current = true;
          mapLogger.debug('map style loaded');
          
          // Пробуем получить слои с небольшой задержкой, так как натив не всегда готов сразу
          setTimeout(async () => {
            try {
              const style = await (mapRef.current as any)?.getStyle?.();
              const layers = style?.layers ?? [];
              
              if (layers.length > 0) {
                console.log('--- ALL MAP LAYERS START ---');
                console.log(layers.map((l: any) => `${l.id} (${l.type})`).join('\n'));
                console.log('--- ALL MAP LAYERS END ---');

                const buildingLayers = layers
                  .filter((layer: any) => {
                    const id = String(layer?.id ?? '');
                    const type = String(layer?.type ?? '');
                    return id.includes('building') || type.includes('fill-extrusion');
                  })
                  .map((layer: any) => String(layer.id))
                  .filter(Boolean);

                if (buildingLayers.length) {
                  setBuildingLayerIds(buildingLayers);
                  mapLogger.debug('building layers detected', {
                    count: buildingLayers.length,
                    ids: buildingLayers,
                  });
                }
              } else {
                mapLogger.debug('style layers still empty after delay');
              }
            } catch (err) {
              mapLogger.debug('error getting style layers', { error: String(err) });
            }
          }, 500);
        }}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={initialCamera}
          centerCoordinate={cameraSettings?.centerCoordinate}
          zoomLevel={cameraSettings?.zoomLevel}
          pitch={cameraSettings?.pitch}
          heading={cameraSettings?.heading}
          animationMode={cameraSettings?.animationMode}
          animationDuration={cameraSettings?.animationDuration}
          followUserLocation={false}
          followUserMode={undefined}
        />
        <UserLocation visible onUpdate={handleUserLocationUpdate} />
        <ShapeSource id="focused-building" shape={highlightShape}>
          <FillExtrusionLayer
            id="focused-building-fill"
            minZoomLevel={0}
            maxZoomLevel={24}
            style={{
              fillExtrusionColor: '#2b7cff',
              // Добавляем 0.2 метра к высоте, чтобы крыша не мерцала (Z-fighting)
              fillExtrusionHeight: ['+', ['get', 'render_height'], 0.2],
              fillExtrusionBase: ['get', 'render_min_height'],
              fillExtrusionOpacity: 0.6,
            }}
          />
        </ShapeSource>
      </MapView>
      <Pressable
        style={[styles.locationButton, { bottom: insets.bottom + 16 }]}
        onPress={handleCenterMap}
      >
        <IconSymbol
          name="location.fill"
          size={24}
          color={colors.textPrimary}
        />
      </Pressable>
    </>
  );
};

const createStyles = (
  colors: typeof ProfileColors.light | typeof ProfileColors.dark
) =>
  StyleSheet.create({
    map: {
      flex: 1,
    },
    locationButton: {
      position: 'absolute',
      right: 18,
      width: 44,
      height: 44,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
  });
