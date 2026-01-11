import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBar,
} from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { Navigator, Screen } = createMaterialTopTabNavigator();
const MaterialTabs = withLayoutContext(Navigator);

export default function BottomNav() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <MaterialTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarShowIcon: true,
        // single-color: black background + white UI elements
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.65)',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', color: '#fff' },
        tabBarIndicatorStyle: {
          backgroundColor: '#fff',
          height: 3,
          borderRadius: 5,
          marginHorizontal: 16,
        },
        tabBarPressColor: 'rgb(0, 0, 0)',
      }}
      tabBar={(props) => {
        // limit rendered tabs to first two routes
        const limitedRoutes = props.state.routes.slice(0, 2);
        const limitedState = {
          ...props.state,
          routes: limitedRoutes,
          index: Math.min(props.state.index, limitedRoutes.length - 1),
        };
        const limitedDescriptors = limitedRoutes.reduce<Record<string, any>>(
          (acc, r) => {
            if (props.descriptors[r.key]) acc[r.key] = props.descriptors[r.key];
            return acc;
          },
          {}
        );

        const limitedProps = {
          ...props,
          state: limitedState,
          descriptors: limitedDescriptors,
        };

        return (
          <View
            pointerEvents="box-none"
            style={[styles.safeArea, { bottom: insets.bottom + 12 }]}
          >
            {/* single color island — black background */}
            <View
              style={[
                styles.container,
                {
                  backgroundColor: '#000',
                  shadowColor: '#000',
                  borderWidth: 0,
                },
              ]}
            >
              <MaterialTopTabBar
                {...(limitedProps as any)}
                style={[styles.tabBar, { backgroundColor: 'transparent' }]}
                pressOpacity={0.85}
              />
            </View>
          </View>
        );
      }}
    >
      <Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
        component={() => null}
      />
      <Screen
        name="explore"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
        component={() => null}
      />
    </MaterialTabs>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 16,
    right: 16,
    // bottom set dynamically using insets
    zIndex: 100,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: Platform.select({ ios: 10, android: 6 }),
    paddingHorizontal: 8,
    // shadow for iOS
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden', // clip indicator and ensure a single-color island
  },
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
});
