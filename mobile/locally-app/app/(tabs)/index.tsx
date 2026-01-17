import { useEffect, useMemo, useState, useRef } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProfileColors } from '@/utils/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Svg, Path } from 'react-native-svg';

export default function HomeScreen() {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useColorScheme();
  const colors = ProfileColors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');

  useEffect(() => {
    MapLibreGL.setAccessToken(null);
    let isMounted = true;
    const words = ['neighbors', 'skills', 'items'];
    const prefix = 'Search for ';

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const animate = async () => {
      while (isMounted) {
        // 1. Type "Search for "
        let currentText = '';
        for (let i = 0; i <= prefix.length; i++) {
          if (!isMounted) return;
          currentText = prefix.slice(0, i);
          setAnimatedPlaceholder(currentText);
          await sleep(60);
        }

        // 2. Cycle through words
        for (let index = 0; index < words.length; index++) {
          const word = words[index];

          // Type the word
          for (let i = 1; i <= word.length; i++) {
            if (!isMounted) return;
            setAnimatedPlaceholder(prefix + word.slice(0, i));
            await sleep(60);
          }

          await sleep(1500); // Pause to read

          // If not the last word, erase only the word
          if (index < words.length - 1) {
            for (let i = word.length - 1; i >= 0; i--) {
              if (!isMounted) return;
              setAnimatedPlaceholder(prefix + word.slice(0, i));
              await sleep(30);
            }
            await sleep(150);
          }
        }

        // 3. Erase everything after the last word
        const fullText = prefix + words[words.length - 1];
        for (let i = fullText.length - 1; i >= 0; i--) {
          if (!isMounted) return;
          setAnimatedPlaceholder(fullText.slice(0, i));
          await sleep(30);
        }

        await sleep(400); // Small pause before restarting
      }
    };

    void animate();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCenterMap = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const location = await Location.getCurrentPositionAsync({});
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
    } catch (error) {
      console.error('Error centering map:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (!isMounted) {
        return;
      }

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      cameraRef.current?.setCamera({
        centerCoordinate: [
          location.coords.longitude,
          location.coords.latitude,
        ],
        pitch: 60,
        heading: 0,
        zoomLevel: 18,
      });
    };

    void loadLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        compassEnabled
        pitchEnabled
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={18}
          pitch={60}
          centerCoordinate={[region.longitude, region.latitude]}
        />
        <MapLibreGL.UserLocation visible />
        <MapLibreGL.FillExtrusionLayer
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
      </MapLibreGL.MapView>
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
      <Pressable
        style={[styles.locationButton, { bottom: insets.bottom + 16 }]}
        onPress={handleCenterMap}
      >
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
