// Controls for the playback notification. Each switch maps to a real
// react-native-track-player option (see player/notificationOptions.js).
import React from 'react';
import {ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {useSettings} from '../context/SettingsContext';
import {useI18n} from '../i18n/LanguageContext';

export default function NotificationsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {settings, setSetting} = useSettings();
  const {t} = useI18n();

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications')}</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.lg, paddingBottom: 40 + insets.bottom}}>
        <Text style={styles.intro}>
          Choose what shows up in the media notification and on the lock screen.
        </Text>

        <View style={styles.card}>
          <Row
            icon="play-skip-forward-outline"
            label="Skip buttons"
            hint="Show next and previous controls."
            value={settings.showSkipButtons}
            onChange={v => setSetting('showSkipButtons', v)}
          />
          <View style={styles.sep} />
          <Row
            icon="options-outline"
            label="Seek bar"
            hint="Scrub through the track from the notification."
            value={settings.showSeekBar}
            onChange={v => setSetting('showSeekBar', v)}
          />
          <View style={styles.sep} />
          <Row
            icon="power-outline"
            label="Keep playing when app is closed"
            hint="Otherwise playback stops when you swipe the app away."
            value={settings.keepPlayingWhenClosed}
            onChange={v => setSetting('keepPlayingWhenClosed', v)}
            last
          />
        </View>

        <Text style={styles.note}>
          Changes apply to the next notification the player draws.
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({icon, label, hint, value, onChange, last}) {
  return (
    <View style={[styles.row, last && {borderBottomWidth: 0}]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{false: colors.border, true: colors.primaryDark}}
        thumbColor={value ? colors.primary : colors.textFaint}
      />
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
    paddingBottom: spacing.sm,
  },
  headerTitle: {...typography.h3},
  intro: {color: colors.textMuted, fontSize: 13, marginBottom: spacing.lg},
  card: {backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.md},
  row: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md},
  rowText: {flex: 1},
  rowLabel: {color: colors.text, fontSize: 15, fontWeight: '600'},
  rowHint: {color: colors.textMuted, fontSize: 12, marginTop: 2},
  sep: {height: StyleSheet.hairlineWidth, backgroundColor: colors.border},
  note: {color: colors.textFaint, fontSize: 12, marginTop: spacing.lg, textAlign: 'center'},
});
