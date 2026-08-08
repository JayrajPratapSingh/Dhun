import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../../theme/theme';
import {useAuth} from '../../context/AuthContext';
import {useI18n} from '../../i18n/LanguageContext';
import {Field} from './LoginScreen';

export default function RegisterScreen({navigation}) {
  const {register, continueAsGuest} = useAuth();
  const {t} = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onRegister() {
    setError('');
    setBusy(true);
    try {
      await register({name, email, password});
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>

          <Text style={typography.h1}>{t('create_account')}</Text>
          <Text style={styles.sub}>{t('create_account_sub')}</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Field icon="person-outline" placeholder={t('full_name')} value={name} onChangeText={setName} />
          <Field
            icon="mail-outline"
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
            onRightPress={() => setShowPass(s => !s)}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={onRegister} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryText}>{t('create_account')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} disabled={busy}>
            <Text style={styles.guestText}>{t('continue_guest')}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('already_account')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>{t('sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {padding: spacing.xl, paddingTop: spacing.xxl * 1.5, flexGrow: 1},
  back: {marginBottom: spacing.lg, alignSelf: 'flex-start'},
  sub: {color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg},
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
    backgroundColor: 'rgba(255,77,79,0.12)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  errorText: {color: colors.danger, marginLeft: 6, flex: 1, fontSize: 13},
});
