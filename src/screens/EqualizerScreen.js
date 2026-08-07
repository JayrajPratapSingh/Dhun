import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {usePlayer} from '../context/PlayerContext';
import EqualizerAPI, {PRESETS} from '../native/Equalizer';

export default function EqualizerScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {theme} = usePlayer();
  const accent = theme?.primary || colors.primary;

  const [config, setConfig] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [levels, setLevels] = useState([]); // millibels per band
  const [bass, setBass] = useState(0);
  const [preset, setPreset] = useState('Flat');

  useEffect(() => {
    (async () => {
      const cfg = await EqualizerAPI.getConfig();
      if (!cfg) {
        setConfig({numberOfBands: 0});
        return;
      }
      setConfig(cfg);
      const state = await EqualizerAPI.getState();
      if (state?.bandLevels?.length) {
        setLevels(state.bandLevels);
        setEnabled(!!state.enabled);
      } else {
        setLevels(new Array(cfg.numberOfBands).fill(0));
      }
    })();
  }, []);

  function toggle(v) {
    setEnabled(v);
    EqualizerAPI.setEnabled(v);
  }

  function pick(p) {
    setPreset(p.name);
    if (!enabled) toggle(true);
    const applied = EqualizerAPI.applyPreset(p.gains, config);
    setLevels(applied);
  }

  function onBand(i, value) {
    if (!enabled) toggle(true);
    EqualizerAPI.setBandLevel(i, value);
    setLevels(prev => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
    setPreset('Custom');
  }

  const bands = config?.numberOfBands || 0;

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Equalizer</Text>
        <Switch
          value={enabled}
          onValueChange={toggle}
          trackColor={{false: colors.border, true: accent}}
          thumbColor="#fff"
        />
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 60}}>
        {!config ? (
          <Text style={styles.hint}>Loading…</Text>
        ) : config.numberOfBands === 0 ? (
          <Text style={styles.hint}>Equalizer is not available on this device.</Text>
        ) : (
          <>
            {config.available === false && (
              <Text style={styles.warn}>
                This emulator has no audio-effect hardware, so changes won’t alter
                sound here — but everything works on a real device.
              </Text>
            )}

            {/* Band sliders (vertical) */}
            <View style={[styles.bandsCard, {opacity: enabled ? 1 : 0.5}]}>
              <View style={styles.bandsRow}>
                {Array.from({length: bands}).map((_, i) => {
                  const val = levels[i] ?? 0;
                  return (
                    <View key={i} style={styles.bandCol}>
                      <Text style={styles.dbText}>
                        {(val / 100 > 0 ? '+' : '') + (val / 100).toFixed(0)}
                      </Text>
                      <View style={styles.sliderBox}>
                        <Slider
                          style={styles.vSlider}
                          minimumValue={config.minLevel}
                          maximumValue={config.maxLevel}
                          step={100}
                          value={val}
                          disabled={!enabled}
                          minimumTrackTintColor={accent}
                          maximumTrackTintColor={colors.border}
                          thumbTintColor={accent}
                          onValueChange={v => onBand(i, v)}
                        />
                      </View>
                      <Text style={styles.freqText}>
                        {EqualizerAPI.freqLabel(config.centerFreqs?.[i] ?? 0)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Presets */}
            <Text style={styles.sectionLabel}>Presets</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presets}>
              {PRESETS.map(p => {
                const active = preset === p.name;
                return (
                  <TouchableOpacity
                    key={p.name}
                    onPress={() => pick(p)}
                    style={[
                      styles.presetChip,
                      active && {backgroundColor: accent, borderColor: accent},
                    ]}>
                    <Text
                      style={[styles.presetText, active && {color: '#000'}]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Bass boost */}
            <Text style={styles.sectionLabel}>Bass Boost</Text>
            <View style={styles.bassRow}>
              <Ionicons name="pulse" size={20} color={accent} />
              <Slider
                style={styles.bassSlider}
                minimumValue={0}
                maximumValue={1000}
                step={50}
                value={bass}
                minimumTrackTintColor={accent}
                maximumTrackTintColor={colors.border}
                thumbTintColor={accent}
                onValueChange={v => {
                  setBass(v);
                  EqualizerAPI.setBassBoost(v);
                }}
              />
              <Text style={styles.bassVal}>{Math.round((bass / 1000) * 100)}%</Text>
            </View>
          </>
        )}
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
  hint: {color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl},
  warn: {
    color: colors.gold,
    fontSize: 12,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  bandsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  bandsRow: {flexDirection: 'row', justifyContent: 'space-around'},
  bandCol: {alignItems: 'center', width: 60},
  dbText: {color: colors.textMuted, fontSize: 11, marginBottom: spacing.sm, fontWeight: '600'},
  sliderBox: {
    height: 170,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vSlider: {width: 170, height: 40, transform: [{rotate: '-90deg'}]},
  freqText: {color: colors.textFaint, fontSize: 10, marginTop: spacing.sm},
  sectionLabel: {
    ...typography.h3,
    fontSize: 16,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  presets: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  presetChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  presetText: {color: colors.text, fontWeight: '600', fontSize: 13},
  bassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  bassSlider: {flex: 1, marginHorizontal: spacing.sm},
  bassVal: {color: colors.textMuted, width: 44, textAlign: 'right', fontSize: 13},
});
