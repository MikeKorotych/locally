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
import { useSignUp } from '@clerk/clerk-expo';
import { AuthColors } from '../../utils/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const theme = useColorScheme();
  const colors = AuthColors[theme];
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
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
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Create account
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  Join your local community
                </Text>
              </View>

              <View style={styles.form}>
                {!verifying ? (
                  <>
                    <View>
                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        Email
                      </Text>
                      <TextInput
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder="you@example.com"
                        placeholderTextColor={colors.placeholder}
                        style={[
                          styles.input,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.inputBackground,
                            color: colors.textPrimary,
                          },
                        ]}
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>

                    <View>
                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        Password
                      </Text>
                      <TextInput
                        autoCapitalize="none"
                        autoComplete="password"
                        placeholder="••••••••"
                        placeholderTextColor={colors.placeholder}
                        secureTextEntry
                        style={[
                          styles.input,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.inputBackground,
                            color: colors.textPrimary,
                          },
                        ]}
                        value={password}
                        onChangeText={setPassword}
                      />
                    </View>

                    {error ? (
                      <Text style={[styles.error, { color: colors.error }]}>
                        {error}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.button,
                        { backgroundColor: colors.buttonBackground },
                        !canSubmit && styles.buttonDisabled,
                      ]}
                      onPress={onSignUp}
                      disabled={!canSubmit}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          { color: colors.buttonText },
                        ]}
                      >
                        {submitting ? 'Creating...' : 'Create account'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View>
                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        Verification code
                      </Text>
                      <TextInput
                        autoCapitalize="none"
                        keyboardType="number-pad"
                        placeholder="Enter code"
                        placeholderTextColor={colors.placeholder}
                        style={[
                          styles.input,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.inputBackground,
                            color: colors.textPrimary,
                          },
                        ]}
                        value={code}
                        onChangeText={setCode}
                      />
                    </View>

                    {error ? (
                      <Text style={[styles.error, { color: colors.error }]}>
                        {error}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.button,
                        { backgroundColor: colors.buttonBackground },
                        !canVerify && styles.buttonDisabled,
                      ]}
                      onPress={onVerify}
                      disabled={!canVerify}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          { color: colors.buttonText },
                        ]}
                      >
                        {submitting ? 'Verifying...' : 'Verify email'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.footer}>
                  <Text
                    style={[styles.footerText, { color: colors.textSubtle }]}
                  >
                    Already have an account?
                  </Text>
                  <Link
                    href="/sign-in"
                    style={[styles.link, { color: colors.textPrimary }]}
                  >
                    Sign in
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
    backgroundColor: AuthColors.dark.background,
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
    color: AuthColors.dark.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: AuthColors.dark.textSecondary,
  },
  form: {
    gap: 16,
  },
  label: {
    color: AuthColors.dark.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AuthColors.dark.border,
    backgroundColor: AuthColors.dark.inputBackground,
    paddingHorizontal: 14,
    color: AuthColors.dark.textPrimary,
  },
  button: {
    marginTop: 20,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AuthColors.dark.buttonBackground,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AuthColors.dark.buttonText,
  },
  error: {
    color: AuthColors.dark.error,
    fontSize: 13,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    color: AuthColors.dark.textSubtle,
    marginBottom: 8,
  },
  link: {
    color: AuthColors.dark.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
