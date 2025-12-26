import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(email.trim() && password.trim()) && !submitting,
    [email, password, submitting]
  );

  const onSignIn = async () => {
    if (!isLoaded || !canSubmit) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Sign-in requires additional steps.');
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const rawMessage = clerkError?.message;
      const code = clerkError?.code;
      const message =
        rawMessage === 'Identifier is invalid' || code === 'form_identifier_not_found'
          ? 'Email or password is incorrect.'
          : rawMessage || 'Invalid email or password.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.flex} onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
              </View>

              <View style={styles.form}>
                <View>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="#6F6F6F"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="password"
                    placeholder="••••••••"
                    placeholderTextColor="#6F6F6F"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, !canSubmit && styles.buttonDisabled]}
                  onPress={onSignIn}
                  disabled={!canSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>
                    {submitting ? 'Signing in...' : 'Sign in'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>No account yet?</Text>
                  <Link href="/sign-up" style={styles.link}>
                    Sign up
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F5F5F7',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#9A9AA0',
  },
  form: {
    gap: 16,
  },
  label: {
    color: '#B8B8BD',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#24242A',
    backgroundColor: '#14141A',
    paddingHorizontal: 14,
    color: '#F5F5F7',
  },
  button: {
    marginTop: 20,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0B0E',
  },
  error: {
    color: '#F36A6A',
    fontSize: 13,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#8B8B92',
    marginBottom: 8,
  },
  link: {
    color: '#F5F5F7',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
