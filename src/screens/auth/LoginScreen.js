import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../../theme/theme';
import {useAuth} from '../../context/AuthContext';

export default function LoginScreen({navigation}) {
  const {login, continueAsGuest} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onLogin() {
    setError('');
    setBusy(true);
    try {
      await login({email, password});
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <LinearGradient colors={[colors.gradientTop, colors.gradientBottom]} style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.logo}>
              <Ionicons name="musical-notes" size={34} color={colors.text} />
            </LinearGradient>
            <Text style={styles.brand}>Dhun</Text>
            <Text style={styles.tagline}>Hindi · English · Punjabi · Bhojpuri · Marathi</Text>
          </View>

          <Text style={typography.h1}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to sync your likes and library.</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Field
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
            onRightPress={() => setShowPass(s => !s)}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={onLogin} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} disabled={busy}>
            <Text style={styles.guestText}>Continue without login</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Reusable labelled input with a leading icon (and optional trailing action).
export function Field({icon, rightIcon, onRightPress, ...props}) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textFaint}
        {...props}
      />
      {!!rightIcon && (
        <TouchableOpacity onPress={onRightPress} hitSlop={8}>
          <Ionicons name={rightIcon} size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {padding: spacing.xl, paddingTop: spacing.xxl * 2, flexGrow: 1},
  logoWrap: {alignItems: 'center', marginBottom: spacing.xxl},
  logo: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {...typography.h2, marginTop: spacing.md},
  tagline: {color: colors.textMuted, marginTop: spacing.xs},
  sub: {color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg},
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {flex: 1, color: colors.text, paddingVertical: 14, marginLeft: spacing.sm, fontSize: 15},
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryText: {color: '#000', fontWeight: '800', fontSize: 16},
  guestBtn: {alignItems: 'center', paddingVertical: 14, marginTop: spacing.sm},
  guestText: {color: colors.text, fontWeight: '600', fontSize: 15},
  footer: {flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl},
  footerText: {color: colors.textMuted},
  link: {color: colors.primary, fontWeight: '700'},
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,77,79,0.12)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  errorText: {color: colors.danger, marginLeft: 6, flex: 1, fontSize: 13},
});
