import { useEffect, useMemo, useState, useRef } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProfileColors } from '@/utils/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useColorScheme();
  const colors = ProfileColors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const handleCenterMap = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const location = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        1000
      );
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
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    };

    void loadLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Marker coordinate={region} title="You are here" />
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
            placeholder="Search for neighbors, skills, or items"
            placeholderTextColor={colors.textSubtle}
            style={styles.searchInput}
            returnKeyType="search"
          />
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
