import { Redirect, withLayoutContext } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BottomNavBar from '../../components/ui/bottom-nav.island';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <MaterialTabs
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        swipeEnabled: route.name !== 'index',
        // headerShown: false,
      })}
      tabBar={(props) => (
        <BottomNavBar
          {...props}
          flipVariant="icon"
          interactionMode="tap"
          primaryIconName="person.fill"
          secondaryIconName="magnifyingglass"
        />
      )}
    >
      <MaterialTabs.Screen
        name="index"
        options={{ title: 'Profile', headerShown: false }}
      />
      <MaterialTabs.Screen name="profile" options={{ title: 'Profile' }} />
    </MaterialTabs>
  );
}
