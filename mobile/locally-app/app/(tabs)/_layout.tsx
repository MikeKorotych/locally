import { Redirect, withLayoutContext } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const { isSignedIn } = useAuth();
  const colorScheme = useColorScheme();

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <MaterialTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarShowIcon: true,
        tabBarIndicatorStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].tint,
        },
        tabBarStyle: {
          height: 70,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      <MaterialTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <MaterialTabs.Screen
        name="explore"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </MaterialTabs>
  );
}
