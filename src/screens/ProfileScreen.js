import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {useAuth} from '../context/AuthContext';
import {useLibrary} from '../context/LibraryContext';
import {useDownloads} from '../context/DownloadsContext';
import {useI18n} from '../i18n/LanguageContext';
import {APP_LANGUAGES} from '../i18n/translations';
import {APP_VERSION} from '../config/appInfo';
import {initials} from '../utils/format';

export default function ProfileScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {user, isGuest, logout} = useAuth();
  const {favorites, recent} = useLibrary();
  const {downloads} = useDownloads();
  const {t, lang, setLang} = useI18n();
  const [showLang, setShowLang] = useState(false);
  const currentLangLabel =
    APP_LANGUAGES.find(l => l.key === lang)?.label || 'English';

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{paddingTop: insets.top + spacing.lg, paddingBottom: 140}}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{isGuest ? 'G' : initials(user?.name || '?')}</Text>
        </View>
        <Text style={styles.name}>{isGuest ? t('guest') : user?.name || t('guest')}</Text>
        {!isGuest && !!user?.email && <Text style={styles.email}>{user.email}</Text>}
        {isGuest && <Text style={styles.email}>{t('browsing_guest')}</Text>}
      </View>

      <View style={styles.stats}>
        <Stat label={t('liked')} value={favorites.length} icon="heart" />
        <View style={styles.divider} />
        <Stat label={t('recent')} value={recent.length} icon="time" />
        <View style={styles.divider} />
        <Stat label={t('streaming_quality')} value="320" icon="pulse" />
      </View>

      <View style={styles.menu}>
        {!isGuest && (
          <MenuItem
            icon="person-circle-outline"
            label={t('account_settings')}
            onPress={() => navigation.navigate('Account')}
          />
        )}
        <MenuItem
          icon="language-outline"
          label={t('app_language')}
          trailing={currentLangLabel}
          onPress={() => setShowLang(true)}
        />
        <MenuItem
          icon="options-outline"
          label={t('equalizer')}
          onPress={() => navigation.navigate('Equalizer')}
        />
        <MenuItem
          icon="notifications-outline"
          label={t('notifications')}
          onPress={() => navigation.navigate('Notifications')}
        />
        <MenuItem
          icon="cloud-download-outline"
          label={t('audio_downloads')}
          trailing={downloads.length ? String(downloads.length) : undefined}
          onPress={() => navigation.navigate('Library', {tab: 'downloads'})}
        />
        {/* Fixed for now — shown as a value rather than a dead link. */}
        <MenuItem icon="pulse-outline" label={t('streaming_quality')} trailing="320 kbps" />
        <MenuItem
          icon="information-circle-outline"
          label={t('about')}
          onPress={() => navigation.navigate('About')}
        />
      </View>

      {isGuest ? (
        <TouchableOpacity style={styles.signInBtn} onPress={logout}>
          <Ionicons name="log-in-outline" size={20} color="#000" />
          <Text style={styles.signInText}>{t('sign_in_create')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>{t('log_out')}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.version}>Dhun • Powered by JioSaavn • v{APP_VERSION}</Text>

      {/* Language picker */}
      <Modal visible={showLang} transparent animationType="slide" onRequestClose={() => setShowLang(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowLang(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('app_language')}</Text>
            {APP_LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.key}
                style={styles.langRow}
                onPress={() => {
                  setLang(l.key);
                  setShowLang(false);
                }}>
                <Text style={[styles.langLabel, lang === l.key && {color: colors.primary, fontWeight: '800'}]}>
                  {l.label}
                </Text>
                {lang === l.key && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
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

function MenuItem({icon, label, trailing, onPress}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      {!!trailing && <Text style={styles.menuTrailing}>{trailing}</Text>}
      {/* Only promise a destination when there actually is one. */}
      {!!onPress && (
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      )}
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
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: {...typography.h3, marginBottom: spacing.md},
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  langLabel: {color: colors.text, fontSize: 16},
});
