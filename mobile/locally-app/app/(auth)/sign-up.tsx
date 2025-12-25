import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '@clerk/clerk-expo';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(email.trim() && password.trim()) && !submitting,
    [email, password, submitting]
  );

  const canVerify = useMemo(
    () => Boolean(code.trim()) && !submitting,
    [code, submitting]
  );

  const onSignUp = async () => {
    if (!isLoaded || !canSubmit) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || 'Sign-up failed. Try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded || !canVerify) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Verification requires additional steps.');
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.message || 'Verification failed. Try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join your local community</Text>
        </View>

        <View style={styles.form}>
          {!verifying ? (
            <>
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
                onPress={onSignUp}
                disabled={!canSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {submitting ? 'Creating...' : 'Create account'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  placeholder="Enter code"
                  placeholderTextColor="#6F6F6F"
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, !canVerify && styles.buttonDisabled]}
                onPress={onVerify}
                disabled={!canVerify}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {submitting ? 'Verifying...' : 'Verify email'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/sign-in" style={styles.link}>
              Sign in
            </Link>
          </View>
        </View>
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
