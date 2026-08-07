import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {useAuth} from '../context/AuthContext';
import {useLibrary} from '../context/LibraryContext';
import {initials} from '../utils/format';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {user, isGuest, logout} = useAuth();
  const {favorites, recent} = useLibrary();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{paddingTop: insets.top + spacing.lg, paddingBottom: 140}}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{isGuest ? 'G' : initials(user?.name || '?')}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Guest'}</Text>
        {!isGuest && !!user?.email && <Text style={styles.email}>{user.email}</Text>}
        {isGuest && <Text style={styles.email}>Browsing without an account</Text>}
      </View>

      <View style={styles.stats}>
        <Stat label="Liked" value={favorites.length} icon="heart" />
        <View style={styles.divider} />
        <Stat label="Recent" value={recent.length} icon="time" />
        <View style={styles.divider} />
        <Stat label="Quality" value="HiRes" icon="pulse" />
      </View>

      <View style={styles.menu}>
        <MenuItem icon="notifications-outline" label="Notifications" />
        <MenuItem icon="cloud-download-outline" label="Audio & downloads" />
        <MenuItem icon="pulse-outline" label="Streaming quality" trailing="High" />
        <MenuItem icon="information-circle-outline" label="About Dhun" />
      </View>

      {isGuest ? (
        <TouchableOpacity style={styles.signInBtn} onPress={logout}>
          <Ionicons name="log-in-outline" size={20} color="#000" />
          <Text style={styles.signInText}>Sign in / Create account</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.version}>Dhun • Powered by JioSaavn • v1.0.0</Text>
    </ScrollView>
  );
}

function Stat({label, value, icon}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({icon, label, trailing}) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      {!!trailing && <Text style={styles.menuTrailing}>{trailing}</Text>}
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  head: {alignItems: 'center', marginBottom: spacing.xl},
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: colors.text, fontSize: 32, fontWeight: '800'},
  name: {...typography.h2, marginTop: spacing.md},
  email: {color: colors.textMuted, marginTop: 4},
  stats: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  stat: {flex: 1, alignItems: 'center'},
  statValue: {color: colors.text, fontWeight: '800', fontSize: 18, marginTop: 4},
  statLabel: {color: colors.textMuted, fontSize: 12, marginTop: 2},
  divider: {width: StyleSheet.hairlineWidth, backgroundColor: colors.border},
  menu: {marginTop: spacing.xl, marginHorizontal: spacing.lg},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuLabel: {color: colors.text, fontSize: 15, marginLeft: spacing.md, flex: 1},
  menuTrailing: {color: colors.textMuted, marginRight: spacing.sm, fontSize: 13},
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: 15,
    borderRadius: radius.pill,
  },
  signInText: {color: '#000', fontWeight: '800', fontSize: 15, marginLeft: 6},
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {color: colors.danger, fontWeight: '700', fontSize: 15, marginLeft: 6},
  version: {color: colors.textFaint, textAlign: 'center', marginTop: spacing.xl, fontSize: 12},
});
