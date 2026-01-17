import { useEffect, useMemo, useState, useRef } from 'react';
import { StyleSheet, TextInput, View, Pressable, Text } from 'react-native';
import {
  Camera,
  FillExtrusionLayer,
  MapView,
  UserLocation,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnimatedPlaceholder } from '@/hooks/use-animated-placeholder';
import { ProfileColors } from '@/utils/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Svg, Path } from 'react-native-svg';

export default function HomeScreen() {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const initialCamera = useMemo(
    () => ({
      centerCoordinate: [-122.4324, 37.78825] as [number, number],
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
  const animatedPlaceholder = useAnimatedPlaceholder();
  const refLocation = useRef<Location.LocationObject>(null);

  const zalypa = (location: Location.LocationObject) => {
          cameraRef.current?.setCamera({
        centerCoordinate: [
          location.coords.longitude,
          location.coords.latitude,
        ],
        pitch: 60,
        heading: 0,
        zoomLevel: 18,
        animationDuration: 1000,
      });
  }

  // ебучая функция для центрирования карты
  const handleCenterMap = async () => {
    if (refLocation.current) {
      zalypa(refLocation.current);
    }

    try {
      console.log('centering map');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      refLocation.current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
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

    // FIX: setting the camera to the user's location
    cameraRef.current?.setCamera({
      centerCoordinate: [
        refLocation.current?.coords.longitude,
        refLocation.current?.coords.latitude,
      ],
      pitch: 60,
      heading: 0,
      zoomLevel: 18,
    });
  };

  useEffect(() => {
    void loadLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        compassEnabled
        pitchEnabled
      >
        <Camera
          ref={cameraRef}
          defaultSettings={initialCamera}
          followUserLocation={false}
          followUserMode={undefined}
        />
        <UserLocation visible />
        <FillExtrusionLayer
          id="3d-buildings"
          sourceID="openmaptiles"
          sourceLayerID="building"
          style={{
            fillExtrusionColor: '#9aa5b1',
            fillExtrusionHeight: ['get', 'render_height'],
            fillExtrusionBase: ['get', 'render_min_height'],
            fillExtrusionOpacity: 0.85,
          }}
        />
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
      <Pressable style={[styles.locationButton, { bottom: insets.bottom + 16 }]} onPress={handleCenterMap} >
        <IconSymbol name="location.fill" size={24} color={colors.textPrimary} />
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
  });
