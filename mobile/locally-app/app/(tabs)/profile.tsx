import React, { useMemo } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemePreference } from '@/hooks/use-theme-preference';
import { ProfileColors } from '@/utils/colors';

const avatar =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=200&h=200&q=80';
const mapPreview =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80';

const items = [
  {
    id: '1',
    title: 'Handmade Mug',
    subtitle: 'Stoneware · 12oz',
    price: '$28',
    image:
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Woven Tote',
    subtitle: 'Natural fiber',
    price: '$42',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    title: 'Desk Lamp',
    subtitle: 'Brushed brass',
    price: '$64',
    image:
      'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    title: 'Leather Journal',
    subtitle: 'Hand stitched',
    price: '$35',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
  },
];

const services = [
  {
    id: 's1',
    title: 'Custom Repair',
    description: 'Hand stitching and restoration for worn favorites.',
    price: 'From $18',
    icon: 'R',
  },
  {
    id: 's2',
    title: 'At-home Styling',
    description: 'Personalized decor styling session for small spaces.',
    price: '$65 / session',
    icon: 'H',
  },
  {
    id: 's3',
    title: 'Gift Wrap',
    description: 'Seasonal wrap and handwritten notes for orders.',
    price: '$6 add-on',
    icon: 'G',
  },
];

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const theme = useColorScheme();
  const toggleTheme = useThemePreference((state) => state.toggleTheme);
  const colors = ProfileColors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const email = user?.primaryEmailAddress?.emailAddress;
  const name = user?.fullName || user?.firstName || 'User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Text style={styles.iconText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.statusDot} />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>V</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            {email ?? 'Local artisan & tech enthusiast'}
          </Text>

          <View style={styles.statsRow}>
            <Text style={styles.ratingValue}>4.9</Text>
            <Text style={styles.ratingStar}>*</Text>
            <Text style={styles.statText}>(120 reviews)</Text>
            <View style={styles.dot} />
            <Text style={styles.statText}>Member since 2021</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryIconButton}>
              <Text style={styles.secondaryIconText}>S</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.themeRow}>
            <View>
              <Text style={styles.themeLabel}>Theme</Text>
              <Text style={styles.themeValue}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{
                false: colors.switchTrack,
                true: colors.switchTrackActive,
              }}
              thumbColor={
                theme === 'dark' ? colors.switchThumbActive : colors.switchThumb
              }
            />
          </View>
        </View>

        <View style={styles.locationCard}>
          <ImageBackground
            source={{ uri: mapPreview }}
            style={styles.mapPreview}
            imageStyle={styles.mapImage}
          >
            <View style={styles.mapOverlay}>
              <View style={styles.radiusRing}>
                <View style={styles.radiusDot} />
              </View>
            </View>
            <View style={styles.mapBadge}>
              <Text style={styles.mapBadgeText}>Approximate Location</Text>
            </View>
          </ImageBackground>
          <View style={styles.locationInfo}>
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>O</Text>
            </View>
            <View>
              <Text style={styles.locationTitle}>Downtown District</Text>
              <Text style={styles.locationSubtitle}>
                Active within 5km radius
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsWrap}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>Selling</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Buying</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Requests</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.itemImage}
                imageStyle={styles.itemImageStyle}
              >
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </ImageBackground>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
        </View>

        <View style={styles.servicesWrap}>
          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceIconText}>{service.icon}</Text>
              </View>
              <View style={styles.serviceBody}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
                <Text style={styles.servicePrice}>{service.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={async () => {
            await signOut();
            router.replace('/sign-in');
          }}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (
  colors: typeof ProfileColors.light | typeof ProfileColors.dark
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    iconText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '600',
    },
    scrollContent: {
      paddingBottom: 32,
    },
    profileSection: {
      paddingTop: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    avatarWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 86,
      height: 86,
      borderRadius: 43,
    },
    statusDot: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.status,
      borderWidth: 2,
      borderColor: colors.background,
    },
    nameRow: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
    },
    verifiedBadge: {
      marginLeft: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.badgeBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verifiedText: {
      color: colors.badgeText,
      fontSize: 12,
      fontWeight: '700',
    },
    subtitle: {
      marginTop: 6,
      color: colors.textSecondary,
      fontSize: 13,
    },
    statsRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingValue: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    ratingStar: {
      color: colors.textPrimary,
      marginHorizontal: 4,
    },
    statText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.textMuted,
      marginHorizontal: 8,
    },
    actionRow: {
      marginTop: 16,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    primaryButton: {
      flex: 1,
      backgroundColor: colors.buttonPrimary,
      borderRadius: 12,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    primaryButtonText: {
      color: colors.buttonPrimaryText,
      fontWeight: '700',
    },
    secondaryIconButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonSecondary,
    },
    secondaryIconText: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    themeRow: {
      marginTop: 18,
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    themeLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    themeValue: {
      color: colors.textPrimary,
      marginTop: 4,
      fontSize: 14,
      fontWeight: '600',
    },
    locationCard: {
      marginTop: 24,
      marginHorizontal: 20,
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapPreview: {
      height: 140,
      justifyContent: 'center',
    },
    mapImage: {
      opacity: 0.45,
    },
    mapOverlay: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    radiusRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 1,
      borderColor: colors.textPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.mapOverlayBackground,
    },
    radiusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.textPrimary,
    },
    mapBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: colors.mapBadgeBackground,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    mapBadgeText: {
      color: colors.textPrimary,
      fontSize: 10,
      fontWeight: '600',
    },
    locationInfo: {
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    locationIconText: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    locationTitle: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    locationSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    tabsWrap: {
      marginTop: 20,
      marginHorizontal: 20,
      padding: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    activeTab: {
      flex: 1,
      borderRadius: 10,
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 8,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    activeTabText: {
      color: colors.buttonPrimaryText,
      fontWeight: '700',
      fontSize: 12,
    },
    inactiveTab: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    inactiveTabText: {
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 12,
    },
    grid: {
      marginTop: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridItem: {
      width: '48%',
      marginBottom: 16,
    },
    itemImage: {
      height: 180,
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'flex-start',
    },
    itemImageStyle: {
      borderRadius: 16,
    },
    priceTag: {
      alignSelf: 'flex-end',
      margin: 10,
      backgroundColor: colors.priceTagBackground,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    priceText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
    itemTitle: {
      color: colors.textPrimary,
      fontWeight: '600',
      marginTop: 8,
    },
    itemSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      marginTop: 8,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    servicesWrap: {
      paddingHorizontal: 20,
      marginTop: 12,
    },
    serviceCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 12,
    },
    serviceIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    serviceIconText: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    serviceBody: {
      flex: 1,
    },
    serviceTitle: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    serviceDescription: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
      lineHeight: 16,
    },
    servicePrice: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 8,
    },
    signOutButton: {
      marginTop: 20,
      marginHorizontal: 20,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signOutText: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
  });
