import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
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
        style={styles.map}
        provider="google"
        region={region}
        showsUserLocation
        showsMyLocationButton
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
  });
