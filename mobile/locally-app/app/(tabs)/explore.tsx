import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const email = user?.primaryEmailAddress?.emailAddress;
  const name = user?.fullName || user?.firstName || 'User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>{email ?? 'No email available'}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await signOut();
            router.replace('/sign-in');
          }}
        >
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#14141A',
    borderWidth: 1,
    borderColor: '#24242A',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F5F5F7',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9A9AA0',
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  buttonText: {
    color: '#0B0B0E',
    fontSize: 16,
    fontWeight: '600',
  },
});
