import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import React from 'react';
import BottomNav from '../../components/ui/bottom-nav.island';

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <BottomNav />;
}
