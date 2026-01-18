import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function AuthRoutesLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
