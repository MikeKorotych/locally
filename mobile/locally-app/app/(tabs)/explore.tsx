import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';

const fallbackAvatar =
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop';
const mapPreview =
  'https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=800&auto=format&fit=crop';

const items = [
  {
    id: '1',
    title: 'Canon AE-1 Vintage',
    subtitle: 'Electronics - Used',
    price: '$150',
    image:
      'https://images.unsplash.com/photo-1452784444945-3f422708fe5e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Handmade Oak Table',
    subtitle: 'Furniture - New',
    price: '$200',
    image:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Sony Headphones',
    subtitle: 'Audio - Like New',
    price: '$80',
    image:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Monstera Deliciosa',
    subtitle: 'Plants - Healthy',
    price: '$35',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop',
  },
];

const services = [
  {
    id: '1',
    title: 'Web Design & Dev',
    description:
      'Modern landing pages and e-commerce sites. Specializing in Tailwind CSS.',
    price: 'Starts at $50/hr',
    icon: 'W',
  },
  {
    id: '2',
    title: 'Dog Walking',
    description:
      'Reliable dog walking in the downtown area. Experience with large breeds.',
    price: '$20/hr',
    icon: 'D',
  },
];

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const name = user?.fullName || user?.firstName || 'Alex Rivera';
  const avatar = user?.imageUrl || fallbackAvatar;

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

          <Text style={styles.subtitle}>Local artisan & tech enthusiast</Text>

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
              <Text style={styles.locationSubtitle}>Active within 5km radius</Text>
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
                <Text style={styles.serviceDescription}>{service.description}</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#14141A',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14141A',
  },
  iconText: {
    color: '#F5F5F7',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#F5F5F7',
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
    backgroundColor: '#14141A',
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
    backgroundColor: '#3BD671',
    borderWidth: 2,
    borderColor: '#0B0B0E',
  },
  nameRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#F5F5F7',
    fontSize: 22,
    fontWeight: '700',
  },
  verifiedBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#0B0B0E',
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#9A9AA0',
    fontSize: 13,
  },
  statsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    color: '#F5F5F7',
    fontWeight: '700',
  },
  ratingStar: {
    color: '#F5F5F7',
    marginHorizontal: 4,
  },
  statText: {
    color: '#9A9AA0',
    fontSize: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9A9AA0',
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
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#0B0B0E',
    fontWeight: '700',
  },
  secondaryIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#24242A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14141A',
  },
  secondaryIconText: {
    color: '#F5F5F7',
    fontWeight: '700',
  },
  locationCard: {
    marginTop: 24,
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#14141A',
    borderWidth: 1,
    borderColor: '#24242A',
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
    borderColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,245,247,0.1)',
  },
  radiusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5F5F7',
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(20,20,26,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mapBadgeText: {
    color: '#F5F5F7',
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
    backgroundColor: '#0B0B0E',
    borderWidth: 1,
    borderColor: '#24242A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationIconText: {
    color: '#F5F5F7',
    fontWeight: '700',
  },
  locationTitle: {
    color: '#F5F5F7',
    fontWeight: '600',
  },
  locationSubtitle: {
    color: '#9A9AA0',
    fontSize: 12,
    marginTop: 2,
  },
  tabsWrap: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#24242A',
    backgroundColor: '#14141A',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activeTab: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTabText: {
    color: '#0B0B0E',
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
    color: '#9A9AA0',
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
    backgroundColor: 'rgba(11,11,14,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceText: {
    color: '#F5F5F7',
    fontSize: 12,
    fontWeight: '700',
  },
  itemTitle: {
    color: '#F5F5F7',
    fontWeight: '600',
    marginTop: 8,
  },
  itemSubtitle: {
    color: '#9A9AA0',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#9A9AA0',
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
    backgroundColor: '#14141A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24242A',
    padding: 14,
    marginBottom: 12,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0B0B0E',
    borderWidth: 1,
    borderColor: '#24242A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceIconText: {
    color: '#F5F5F7',
    fontWeight: '700',
  },
  serviceBody: {
    flex: 1,
  },
  serviceTitle: {
    color: '#F5F5F7',
    fontWeight: '700',
  },
  serviceDescription: {
    color: '#9A9AA0',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  servicePrice: {
    color: '#F5F5F7',
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
    borderColor: '#24242A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#F5F5F7',
    fontWeight: '600',
  },
});
