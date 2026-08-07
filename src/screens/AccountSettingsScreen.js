import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {useAuth} from '../context/AuthContext';
import {initials} from '../utils/format';

export default function AccountSettingsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {user, updateName, resetPassword, deactivateAccount, deleteAccount} =
    useAuth();
  const [name, setName] = useState(user?.name || '');
  const [busy, setBusy] = useState('');

  async function onSaveName() {
    if (!name.trim()) return;
    setBusy('name');
    try {
      await updateName(name);
      Alert.alert('Saved', 'Your name has been updated.');
    } catch (e) {
      Alert.alert('Could not save', String(e?.message || e));
    } finally {
      setBusy('');
    }
  }

  async function onResetPassword() {
    setBusy('pass');
    try {
      await resetPassword();
      Alert.alert('Email sent', `A password reset link was sent to ${user?.email}.`);
    } catch (e) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setBusy('');
    }
  }

  function onDeactivate() {
    Alert.alert(
      'Deactivate account?',
      'Your account will be temporarily deactivated and you’ll be signed out. Sign in again anytime to reactivate — your data is kept.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateAccount();
            } catch (e) {
              Alert.alert('Error', String(e?.message || e));
            }
          },
        },
      ],
    );
  }

  function onDelete() {
    Alert.alert(
      'Delete account permanently?',
      'This permanently deletes your account and all your data (likes, recents). This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (e) {
              Alert.alert('Could not delete', String(e?.message || e));
            }
          },
        },
      ],
    );
  }

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.lg, paddingBottom: 60}}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.name || '?')}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Display name */}
        <Text style={styles.label}>Display name</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textFaint}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={onSaveName} disabled={busy === 'name'}>
            {busy === 'name' ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TouchableOpacity style={styles.rowBtn} onPress={onResetPassword} disabled={busy === 'pass'}>
          <Ionicons name="key-outline" size={20} color={colors.text} />
          <Text style={styles.rowBtnText}>Send password reset email</Text>
          {busy === 'pass' && <ActivityIndicator color={colors.primary} size="small" />}
        </TouchableOpacity>

        {/* Danger zone */}
        <Text style={[styles.label, {color: colors.danger, marginTop: spacing.xl}]}>
          Danger zone
        </Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={onDeactivate}>
          <Ionicons name="pause-circle-outline" size={20} color={colors.gold} />
          <View style={styles.dangerTextWrap}>
            <Text style={[styles.rowBtnText, {color: colors.gold}]}>Deactivate account</Text>
            <Text style={styles.hint}>Temporary — reactivate by signing in again</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <View style={styles.dangerTextWrap}>
            <Text style={[styles.rowBtnText, {color: colors.danger}]}>Delete account</Text>
            <Text style={styles.hint}>Permanent — removes your account and data</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {...typography.h3},
  head: {alignItems: 'center', marginBottom: spacing.xl},
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: '#fff', fontSize: 26, fontWeight: '800'},
  email: {color: colors.textMuted, marginTop: spacing.md},
  label: {color: colors.textMuted, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.md},
  inputRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginLeft: spacing.sm,
  },
  saveText: {color: '#000', fontWeight: '800'},
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowBtnText: {color: colors.text, fontSize: 15, fontWeight: '600', flex: 1, marginLeft: spacing.sm},
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  dangerTextWrap: {flex: 1, marginLeft: spacing.sm},
  hint: {color: colors.textFaint, fontSize: 12, marginTop: 2},
});
