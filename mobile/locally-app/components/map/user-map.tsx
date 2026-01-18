import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Mapbox, {
  Camera,
  MapView,
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
  const {
    cameraRef,
    cameraSettings,
    initialCamera,
    setCameraToLocation,
    onCameraChanged,
  } = useMapCamera({
    initialCenter: [34.4949, 49.5440],
    initialZoom: ZOOM_LEVEL,
    pitch: PITCH_ANGLE,
  });

  useEffect(() => {
    mapLogger.debug('map style loaded state', {
      loaded: styleLoadedRef.current,
    });
  }, []);

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

  const loadLocation = async () => {
    const current = await requestAndLoadLocation();
    if (current) {
      setCameraToLocation(current, 0);
      void resolveAddress({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    }
  };

  useEffect(() => {
    void loadLocation();
  }, []);

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
        style={styles.map}
        styleURL="https://tiles.openfreemap.org/styles/liberty"
        compassEnabled
        compassViewPosition={3}
        compassViewMargins={{
          x: 16,
          y: insets.bottom + 16 + 48 + 12,
        }}
        pitchEnabled
        onCameraChanged={onCameraChanged}
        onDidFinishLoadingStyle={() => {
          styleLoadedRef.current = true;
          mapLogger.debug('map style loaded');
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
