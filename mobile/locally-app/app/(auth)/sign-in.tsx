import React, { useMemo, useState } from 'react';
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
import { useAuth, useSignIn } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const { getToken } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [signInAttempt, setSignInAttempt] = useState<any>(null);
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      Boolean(email.trim() && password.trim()) &&
      !submitting &&
      !needsSecondFactor,
    [email, password, submitting, needsSecondFactor]
  );

  const canVerify = useMemo(
    () => Boolean(verificationCode.trim()) && !submitting,
    [verificationCode, submitting]
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

      if (result.status === 'needs_second_factor') {
        const emailFactor = result.supportedSecondFactors?.find(
          (factor: any) => factor.strategy === 'email_code'
        );

        if (!emailFactor) {
          setError('Second-factor email code is not available.');
          return;
        }

        await result.prepareSecondFactor({
          strategy: 'email_code',
          emailAddressId: emailFactor.emailAddressId,
        });

        setSignInAttempt(result);
        setNeedsSecondFactor(true);
        setVerificationCode('');
        return;
      }

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        const token = await getToken();
        console.log('clerk.jwt', token);

        if (backendUrl) {
          try {
            const response = await fetch(backendUrl, {
              method: 'GET',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            console.log('backend.status', response.status);
          } catch (requestError) {
            console.log('backend.error', requestError);
          }
        } else {
          console.log('backend.error', 'Missing EXPO_PUBLIC_BACKEND_URL');
        }
      } else {
        setError('Sign-in requires additional steps.');
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const rawMessage = clerkError?.message;
      const code = clerkError?.code;
      const message =
        rawMessage === 'Identifier is invalid' ||
        code === 'form_identifier_not_found'
          ? 'Email or password is incorrect.'
          : rawMessage || 'Invalid email or password.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyCode = async () => {
    if (!isLoaded || !canVerify || !signInAttempt) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const updatedSignIn = await signInAttempt.attemptSecondFactor({
        strategy: 'email_code',
        code: verificationCode.trim(),
      });

      if (updatedSignIn.status === 'complete') {
        await setActive({ session: updatedSignIn.createdSessionId });
        const token = await getToken();
        console.log('clerk.jwt', token);
        if (backendUrl) {
          try {
            const response = await fetch(backendUrl, {
              method: 'GET',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            console.log('backend.status', response.status);
          } catch (requestError) {
            console.log('backend.error', requestError);
          }
        } else {
          console.log('backend.error', 'Missing EXPO_PUBLIC_BACKEND_URL');
        }
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={styles.flex}
          onPress={Keyboard.dismiss}
          accessible={false}
        >
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
                {!needsSecondFactor && (
                  <React.Fragment>
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
                        editable={!needsSecondFactor && !submitting}
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
                        editable={!needsSecondFactor && !submitting}
                      />
                    </View>
                  </React.Fragment>
                )}

                {needsSecondFactor ? (
                  <View>
                    <Text style={styles.label}>Verification code</Text>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      placeholder="Enter code"
                      placeholderTextColor="#6F6F6F"
                      style={styles.input}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                    />
                  </View>
                ) : null}

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                  style={[
                    styles.button,
                    !(needsSecondFactor ? canVerify : canSubmit) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={needsSecondFactor ? onVerifyCode : onSignIn}
                  disabled={!(needsSecondFactor ? canVerify : canSubmit)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>
                    {submitting
                      ? needsSecondFactor
                        ? 'Verifying...'
                        : 'Signing in...'
                      : needsSecondFactor
                      ? 'Verify code'
                      : 'Sign in'}
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
