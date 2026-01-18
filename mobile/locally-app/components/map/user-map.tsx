import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Mapbox, {
  Camera,
  MapView,
  UserLocation,
  type Location as MapboxLocation,
} from '@rnmapbox/maps';
import type { EdgeInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { ProfileColors } from '@/utils/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

Mapbox.setAccessToken(
  'pk.eyJ1IjoieXJvdmNoYW5lbiIsImEiOiJjbWtqbXZiYWkwem41M2RzYW9manlkOHAxIn0.sG6tgUtWUOYKc5MrYZnYyg'
);

type UserMapProps = {
  colors: typeof ProfileColors.light | typeof ProfileColors.dark;
  insets: EdgeInsets;
};

export const UserMap = ({ colors, insets }: UserMapProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const styleLoadedRef = useRef(false);
  const refLocation = useRef<Location.LocationObject>(null);
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

  const initialCamera = useMemo(
    () => ({
      centerCoordinate: [34.4949, 49.5440] as [number, number],
      zoomLevel: 18,
      pitch: 60,
    }),
    []
  );

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
  };

  const loadLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    refLocation.current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
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

  const handleUserLocationUpdate = async (location: MapboxLocation) => {
    const coordinate = [
      location.coords.longitude,
      location.coords.latitude,
    ];
    console.log('userLocationUpdate coordinate', coordinate);
    console.log('map style loaded?', styleLoadedRef.current);
  };

  return (
    <>
      <MapView
        style={styles.map}
        styleURL="https://tiles.openfreemap.org/styles/liberty"
        compassEnabled
        pitchEnabled
        onRegionIsChanging={(event) => {
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
  });
