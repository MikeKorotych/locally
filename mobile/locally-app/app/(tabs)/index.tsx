import { useEffect, useMemo, useState, useRef } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import {
  Camera,
  FillExtrusionLayer,
  LineLayer,
  MapView,
  ShapeSource,
  UserLocation,
  VectorSource,
  type CameraRef,
  type MapViewRef,
  type Location as MapLibreLocation,
} from '@maplibre/maplibre-react-native';
import type { Feature } from 'geojson';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnimatedPlaceholder } from '@/hooks/use-animated-placeholder';
import { ProfileColors } from '@/utils/colors';
import {
  distancePointToRingMeters,
  polygonAreaMeters,
  ringKey,
  toRadians,
} from '@/utils/map-geometry';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Svg, Path } from 'react-native-svg';

export default function HomeScreen() {
  const [region, setRegion] = useState({
    latitude: 49.5440,
    longitude: 34.4949,
  });
  const initialCamera = useMemo(
    () => ({
      centerCoordinate: [34.4949, 49.5440] as [number, number],
      zoomLevel: 18,
      pitch: 60,
    }),
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useColorScheme();
  const colors = ProfileColors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const mapRef = useRef<MapViewRef>(null);
  const animatedPlaceholder = useAnimatedPlaceholder();
  const [cameraSettings, setCameraSettings] = useState<{
    centerCoordinate: [number, number];
    zoomLevel: number;
    pitch: number;
    heading: number;
    animationMode?: 'flyTo';
    animationDuration?: number;
  } | null>(null);
  const hasSetInitialCamera = useRef(false);
  const cameraClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const refLocation = useRef<Location.LocationObject>(null);
  const lastNearestUpdateRef = useRef(0);
  const [nearestBuildingId, setNearestBuildingId] = useState<
    number | string | null
  >(null);
  const selectedBuildingId =
    nearestBuildingId === null ? null : String(nearestBuildingId);
  const [paintNearestInOrange, setPaintNearestInOrange] = useState(false);
  const nearestBuildingIdRef = useRef<number | string | null>(null);
  const styleLoadedRef = useRef(false);
  const [nearestBuildingFeature, setNearestBuildingFeature] =
    useState<Feature | null>(null);
  const lastUserLocationRef = useRef<MapLibreLocation | null>(null);

  useEffect(() => {
    nearestBuildingIdRef.current = nearestBuildingId;
    console.log('nearestBuildingId state', nearestBuildingId);
  }, [nearestBuildingId]);

  useEffect(() => {
    console.log('paintNearestInOrange state', paintNearestInOrange);
  }, [paintNearestInOrange]);

  useEffect(() => {
    console.log('map style loaded state', styleLoadedRef.current);
  }, []);

  const setCameraToLocation = (
    location: Location.LocationObject,
    animationDuration = 800
  ) => {
    if (cameraClearTimeoutRef.current) {
      clearTimeout(cameraClearTimeoutRef.current);
      cameraClearTimeoutRef.current = null;
    }
    setCameraSettings({
      centerCoordinate: [
        location.coords.longitude,
        location.coords.latitude,
      ],
      zoomLevel: 18,
      pitch: 60,
      heading: 0,
      animationMode: animationDuration > 0 ? 'flyTo' : undefined,
      animationDuration: animationDuration > 0 ? animationDuration : undefined,
    });
    if (!hasSetInitialCamera.current) {
      hasSetInitialCamera.current = true;
    }
    const resetDelay = animationDuration > 0 ? animationDuration + 200 : 200;
    cameraClearTimeoutRef.current = setTimeout(() => {
      setCameraSettings(null);
      cameraClearTimeoutRef.current = null;
    }, resetDelay);
  };

  // ебучая функция для центрирования карты
  const handleCenterMap = async () => {
    if (refLocation.current) {
      setCameraToLocation(refLocation.current);
    }

    try {
      console.log('centering map');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      refLocation.current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (refLocation.current) {
        setCameraToLocation(refLocation.current);
      }
      console.log('location', location);
    } catch (error) {
      console.log('error centering map', error);
    }

    // setTimeout(() => {
    // if (refLocation.current) {
    // zalypa(refLocation.current);
    // }
    // }, 10);
  };

  const loadLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    refLocation.current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setRegion({
      latitude: refLocation.current?.coords.latitude,
      longitude: refLocation.current?.coords.longitude,
    });

    if (refLocation.current && !hasSetInitialCamera.current) {
      setCameraToLocation(refLocation.current, 0);
    }
  };

  useEffect(() => {
    void loadLocation();
  }, []);

  useEffect(() => {
    return () => {
      if (cameraClearTimeoutRef.current) {
        clearTimeout(cameraClearTimeoutRef.current);
        cameraClearTimeoutRef.current = null;
      }
    };
  }, []);

  const handleUserLocationUpdate = async (location: MapLibreLocation) => {
    lastUserLocationRef.current = location;
    const now = Date.now();
    if (now - lastNearestUpdateRef.current < 1000) {
      return;
    }
    lastNearestUpdateRef.current = now;

    const coordinate = [
      location.coords.longitude,
      location.coords.latitude,
    ];
    console.log('userLocationUpdate coordinate', coordinate);
    console.log('map style loaded?', styleLoadedRef.current);
  };

  const logBuildingsInRadius = async (radiusMeters: number) => {
    const map = mapRef.current;
    if (!map) {
      console.log('logBuildingsInRadius: map not ready');
      return;
    }
    const lastLocation = lastUserLocationRef.current;
    const fallbackLocation = refLocation.current
      ? {
          coords: {
            latitude: refLocation.current.coords.latitude,
            longitude: refLocation.current.coords.longitude,
          },
        }
      : null;
    const activeLocation = lastLocation ?? (fallbackLocation as any);
    if (!activeLocation) {
      console.log('logBuildingsInRadius: no user location yet');
      return;
    }
    const center: [number, number] = [
      activeLocation.coords.longitude,
      activeLocation.coords.latitude,
    ];
    const metersPerDegreeLat = 111320;
    const latRad = toRadians(center[1]);
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(latRad);
    const deltaLat = radiusMeters / metersPerDegreeLat;
    const deltaLng =
      metersPerDegreeLng === 0 ? 0 : radiusMeters / metersPerDegreeLng;
    const nw: [number, number] = [
      center[0] - deltaLng,
      center[1] + deltaLat,
    ];
    const se: [number, number] = [
      center[0] + deltaLng,
      center[1] - deltaLat,
    ];
    try {
      const nwPoint = await map.getPointInView(nw);
      const sePoint = await map.getPointInView(se);
      const rect = [
        Math.min(nwPoint[0], sePoint[0]),
        Math.min(nwPoint[1], sePoint[1]),
        Math.max(nwPoint[0], sePoint[0]),
        Math.max(nwPoint[1], sePoint[1]),
      ] as [number, number, number, number];
      const features = await map.queryRenderedFeaturesInRect(
        rect,
        undefined,
        ['openfreemap-3d-buildings', '3d-buildings', 'building-3d', 'building']
      );
      const distances: number[] = [];
      const seenRings = new Set<string>();
      let closestId: number | string | null = null;
      let closestFeature: Feature | null = null;
      let closestArea = Number.POSITIVE_INFINITY;
      let closestKey = '';
      let minDistance = Number.POSITIVE_INFINITY;
      for (const feature of features.features) {
        const rawId = feature.id;
        const propId =
          (feature.properties as any)?.osm_id ??
          (feature.properties as any)?.id;
        const geometry = feature.geometry;
        if (
          geometry?.type !== 'Polygon' &&
          geometry?.type !== 'MultiPolygon'
        ) {
          continue;
        }
        const polygons =
          geometry.type === 'Polygon'
            ? [geometry.coordinates]
            : geometry.coordinates;

        for (const polygon of polygons) {
          const ring = polygon?.[0];
          if (!ring || ring.length === 0) {
            continue;
          }
          const key = ringKey(ring);
          if (seenRings.has(key)) {
            continue;
          }
          seenRings.add(key);
          const d = distancePointToRingMeters(center, ring);
          if (d <= radiusMeters) {
            distances.push(d);
          }
          const area = polygonAreaMeters(center, ring);
          const isCloser = d < minDistance - 0.5;
          const isTie = Math.abs(d - minDistance) <= 0.5;
          const isSmallerArea = area < closestArea - 1;
          const isSameArea = Math.abs(area - closestArea) <= 1;
          const isKeyBetter = key < closestKey;
          if (
            isCloser ||
            (isTie && (isSmallerArea || (isSameArea && isKeyBetter)))
          ) {
            minDistance = d;
            closestArea = area;
            closestKey = key;
            closestId = rawId ?? propId ?? null;
            closestFeature = {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: polygon,
              },
              properties: feature.properties ?? {},
              id: closestId ?? undefined,
            };
          }
        }
      }
      distances.sort((a, b) => a - b);
      console.log(
        `buildings within ${radiusMeters}m count`,
        distances.length
      );
      console.log('distances meters', distances);
      if (closestFeature) {
        console.log('radius nearest distance meters', minDistance);
        console.log('radius nearest area meters', closestArea);
        setNearestBuildingId(closestId);
        setNearestBuildingFeature(closestFeature);
      } else {
        setNearestBuildingFeature(null);
      }
    } catch (error) {
      console.log('logBuildingsInRadius error', error);
    }
  };

  const handleMapPress = async (event: any) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const screenPointX = event?.properties?.screenPointX;
    const screenPointY = event?.properties?.screenPointY;
    if (
      typeof screenPointX !== 'number' ||
      typeof screenPointY !== 'number'
    ) {
      return;
    }
    const hitSlop = 10;
    const rect: [number, number, number, number] = [
      screenPointX - hitSlop,
      screenPointY - hitSlop,
      screenPointX + hitSlop,
      screenPointY + hitSlop,
    ];
    try {
      const featureCollection = await map.queryRenderedFeaturesInRect(
        rect,
        undefined,
        ['openfreemap-3d-buildings']
      );
      if (!featureCollection.features.length) {
        setNearestBuildingId(null);
        setNearestBuildingFeature(null);
        return;
      }
      const tapCoord = event?.geometry?.coordinates as
        | [number, number]
        | undefined;
      let closestFeature: Feature | null = null;
      let closestId: number | string | null = null;
      let minDistance = Number.POSITIVE_INFINITY;
      for (const feature of featureCollection.features) {
        const geometry = feature.geometry;
        if (
          geometry?.type !== 'Polygon' &&
          geometry?.type !== 'MultiPolygon'
        ) {
          continue;
        }
        const polygons =
          geometry.type === 'Polygon'
            ? [geometry.coordinates]
            : geometry.coordinates;
        let featureDistance = Number.POSITIVE_INFINITY;
        if (tapCoord) {
          for (const polygon of polygons) {
            const ring = polygon?.[0];
            if (!ring || ring.length === 0) {
              continue;
            }
            const d = distancePointToRingMeters(tapCoord, ring);
            if (d < featureDistance) {
              featureDistance = d;
            }
          }
        } else {
          featureDistance = 0;
        }
        if (featureDistance < minDistance) {
          minDistance = featureDistance;
          closestFeature = feature as Feature;
          closestId =
            (feature as any).id ??
            (feature.properties as any)?.osm_id ??
            (feature.properties as any)?.id ??
            null;
        }
      }
      if (closestFeature) {
        setNearestBuildingId(closestId);
        setNearestBuildingFeature(closestFeature);
      }
    } catch (error) {
      console.log('handleMapPress error', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        compassEnabled
        pitchEnabled
        onPress={handleMapPress}
        onRegionWillChange={(event) => {
          const isUserInteraction = event?.properties?.isUserInteraction;
          if (isUserInteraction) {
            if (cameraClearTimeoutRef.current) {
              clearTimeout(cameraClearTimeoutRef.current);
              cameraClearTimeoutRef.current = null;
            }
            setCameraSettings(null);
          }
        }}
        onDidFinishLoadingStyle={() => {
          styleLoadedRef.current = true;
          console.log('map style loaded');
          try {
            const style = (mapRef.current as any)?.getStyle?.();
            const layerIds = style?.layers?.map((l: any) => l.id);
            console.log('style layer ids', layerIds);
            console.log('style sources', Object.keys(style?.sources ?? {}));
          } catch (error) {
            console.log('failed to read style', error);
          }
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
        <VectorSource
          id="openfreemap"
          url="https://tiles.openfreemap.org/planet"
          // promoteId="osm_id"
        >
          <FillExtrusionLayer
            id="openfreemap-3d-buildings"
            sourceLayerID="building"
            style={{
              fillExtrusionColor:
                paintNearestInOrange && selectedBuildingId
                  ? [
                      'case',
                      ['==', ['to-string', ['id']], selectedBuildingId],
                      '#ff7a00',
                      '#9aa5b1',
                    ]
                  : '#9aa5b1',
              fillExtrusionHeight: ['get', 'render_height'],
              fillExtrusionBase: ['get', 'render_min_height'],
              fillExtrusionOpacity: 0.85,
            }}
          />
        </VectorSource>
        {paintNearestInOrange && nearestBuildingFeature ? (
          <ShapeSource id="nearest-building" shape={nearestBuildingFeature}>
            <FillExtrusionLayer
              id="nearest-building-layer"
              style={{
                fillExtrusionColor: '#ff7a0090',
                fillExtrusionHeight: [
                  '+',
                  ['get', 'render_height'],
                  0.21,
                ],
                fillExtrusionBase: ['+', ['get', 'render_height'], 0.01],
                fillExtrusionOpacity: 0.9,
              }}
            />

          </ShapeSource>
        ) : null}
      </MapView>
      <View style={[styles.searchWrap, { top: insets.top + 12 }]}>
        <View style={styles.searchField}>
          <IconSymbol
            name="magnifyingglass"
            size={20}
            color={colors.textSubtle}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={animatedPlaceholder}
            placeholderTextColor={colors.textSubtle}
            style={styles.searchInput}
            returnKeyType="search"
          />
          <Svg
            fill="none"
            viewBox="0 0 24 24"
            width={20}
            height={20}
            strokeWidth={1.5}
            stroke={colors.textSubtle}
            style={styles.searchIconRight}
          >
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </Svg>
        </View>
      </View>
      {/* ебучая кнопка для центрирования карты */}
      <Pressable
        style={[styles.locationButton, { bottom: insets.bottom + 16 }]}
        onPress={handleCenterMap}
      >
        <IconSymbol name="location.fill" size={24} color={colors.textPrimary} />
      </Pressable>
      <Pressable
        style={[styles.highlightButton, { bottom: insets.bottom + 76 }]}
        onPress={() => {
          console.log('paintNearestBuildingInOrange');
          setPaintNearestInOrange((value) => !value);
          void logBuildingsInRadius(100);
        }}
      >
        <IconSymbol
          name="paintpalette"
          size={20}
          color={paintNearestInOrange ? '#ff7a00' : colors.textPrimary}
        />
      </Pressable>
    </View>
  );
}

const createStyles = (
  colors: typeof ProfileColors.light | typeof ProfileColors.dark
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    map: {
      flex: 1,
    },
    searchWrap: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 10,
    },
    searchField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 99,
      paddingHorizontal: 14,
      height: 50,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchIconRight: {
      marginLeft: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 15,
    },
    locationButton: {
      position: 'absolute',
      right: 16,
      width: 48,
      height: 48,
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
    highlightButton: {
      position: 'absolute',
      right: 16,
      width: 44,
      height: 44,
      borderRadius: 22,
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
