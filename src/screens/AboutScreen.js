// App info. Version comes from package.json so it can't drift from the build.
import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {useI18n} from '../i18n/LanguageContext';
import {APP_VERSION} from '../config/appInfo';

export default function AboutScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {t} = useI18n();

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about')}</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.lg, paddingBottom: 40 + insets.bottom}}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Dhun</Text>
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>

        <View style={styles.card}>
          <InfoRow icon="musical-notes-outline" label="Catalogue" value="JioSaavn" />
          <View style={styles.sep} />
          <InfoRow icon="pulse-outline" label="Streaming quality" value="Up to 320 kbps" />
          <View style={styles.sep} />
          <InfoRow icon="cloud-download-outline" label="Offline" value="Downloads stored on device" />
          <View style={styles.sep} />
          <InfoRow icon="options-outline" label="Audio" value="5-band equalizer + bass boost" last />
        </View>

        <Text style={styles.blurb}>
          Dhun streams music from JioSaavn’s public catalogue. Downloads are kept
          on this device only and are removed when you delete them or uninstall
          the app.
        </Text>

        <Text style={styles.footer}>Dhun • Powered by JioSaavn • v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  );
}

function InfoRow({icon, label, value, last}) {
  return (
    <View style={[styles.row, last && {borderBottomWidth: 0}]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
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
  hero: {alignItems: 'center', marginBottom: spacing.xl},
  logo: {width: 96, height: 96, borderRadius: radius.lg},
  appName: {...typography.h1, marginTop: spacing.md},
  version: {color: colors.textMuted, marginTop: 4, fontSize: 13},
  card: {backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.md},
  row: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md},
  rowLabel: {color: colors.text, fontSize: 15, flex: 1},
  rowValue: {color: colors.textMuted, fontSize: 13, textAlign: 'right', flexShrink: 1},
  sep: {height: StyleSheet.hairlineWidth, backgroundColor: colors.border},
  blurb: {color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: spacing.lg},
  footer: {color: colors.textFaint, textAlign: 'center', marginTop: spacing.xl, fontSize: 12},
});
