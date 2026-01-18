import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnimatedPlaceholder } from '@/hooks/use-animated-placeholder';
import { ProfileColors } from '@/utils/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserMap } from '@/components/map/user-map';
import { Svg, Path } from 'react-native-svg';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useColorScheme();
  const colors = ProfileColors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const animatedPlaceholder = useAnimatedPlaceholder();

  return (
    <View style={styles.container}>
      <UserMap colors={colors} insets={insets} />
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
  });
