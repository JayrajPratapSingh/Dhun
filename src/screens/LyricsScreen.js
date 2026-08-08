import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import {colors, radius, spacing, typography} from '../theme/theme';
import {usePlayer} from '../context/PlayerContext';
import {getLyrics} from '../api/jiosaavn';
import {getSyncedLyrics} from '../api/lyrics';

export default function LyricsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {current, theme} = usePlayer();
  const progress = useProgress(250);

  const [synced, setSynced] = useState(null); // [{time,text}]
  const [plain, setPlain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('synced'); // 'synced' | 'full'

  const scrollRef = useRef(null);
  const offsets = useRef({}); // index -> y
  const lastScrolled = useRef(-1);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setSynced(null);
    setPlain(null);
    (async () => {
      if (!current) {
        if (alive) setLoading(false);
        return;
      }
      const [sync, plainLyrics] = await Promise.all([
        getSyncedLyrics({
          title: current.title,
          artist: current.artist,
          duration: current.duration,
        }),
        getLyrics(current.id),
      ]);
      if (!alive) return;
      setSynced(sync?.lines || null);
      setPlain(plainLyrics || sync?.plain || null);
      setMode(sync?.lines?.length ? 'synced' : 'full');
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [current?.id]);

  // Index of the currently-sung line.
  const activeIndex = useMemo(() => {
    if (!synced?.length) return -1;
    const pos = progress.position + 0.25;
    let idx = 0;
    for (let i = 0; i < synced.length; i++) {
      if (synced[i].time <= pos) idx = i;
      else break;
    }
    return idx;
  }, [synced, progress.position]);

  // Auto-scroll to keep the active line centered.
  useEffect(() => {
    if (mode !== 'synced' || activeIndex < 0) return;
    if (activeIndex === lastScrolled.current) return;
    const y = offsets.current[activeIndex];
    if (y != null && scrollRef.current) {
      lastScrolled.current = activeIndex;
      scrollRef.current.scrollTo({y: Math.max(0, y - 240), animated: true});
    }
  }, [activeIndex, mode]);

  const hasSynced = !!synced?.length;

  return (
    <LinearGradient colors={theme.gradient} style={styles.flex}>
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lyrics</Text>
        <View style={{width: 28}} />
      </View>

      {!!current && (
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.title}>{current.title}</Text>
          <Text numberOfLines={1} style={styles.artist}>{current.artist}</Text>
        </View>
      )}

      {/* Mode toggle */}
      {!loading && (hasSynced || plain) && (
        <View style={styles.toggle}>
          <TouchableOpacity
            disabled={!hasSynced}
            style={[
              styles.toggleBtn,
              mode === 'synced' && {backgroundColor: theme.primary},
              !hasSynced && {opacity: 0.4},
            ]}
            onPress={() => setMode('synced')}>
            <Ionicons
              name="sync"
              size={15}
              color={mode === 'synced' ? '#000' : colors.text}
            />
            <Text style={[styles.toggleText, mode === 'synced' && styles.toggleTextActive]}>
              Sync
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'full' && {backgroundColor: theme.primary}]}
            onPress={() => setMode('full')}>
            <Ionicons
              name="list"
              size={15}
              color={mode === 'full' ? '#000' : colors.text}
            />
            <Text style={[styles.toggleText, mode === 'full' && styles.toggleTextActive]}>
              Full
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{marginTop: spacing.xxl}} />
      ) : mode === 'synced' && hasSynced ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.syncedBody}
          showsVerticalScrollIndicator={false}>
          {synced.map((line, i) => (
            <SyncedLine
              key={i}
              text={line.text}
              active={i === activeIndex}
              sung={i < activeIndex}
              accent={theme.primary}
              onLayout={e => {
                offsets.current[i] = e.nativeEvent.layout.y;
              }}
              onPress={() => TrackPlayer.seekTo(line.time)}
            />
          ))}
        </ScrollView>
      ) : plain ? (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.lyrics}>{plain}</Text>
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="musical-note-outline" size={44} color={colors.textFaint} />
          <Text style={styles.emptyText}>Lyrics aren’t available for this song.</Text>
        </View>
      )}
    </LinearGradient>
  );
}

// A single synced line that springs up + brightens as it becomes active.
function SyncedLine({text, active, sung, accent, onLayout, onPress}) {
  const scale = useRef(new Animated.Value(active ? 1 : 0.9)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.45)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: active ? 1.12 : 0.9,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : sung ? 0.5 : 0.35,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, sung, scale, opacity]);

  return (
    <TouchableOpacity activeOpacity={0.7} onLayout={onLayout} onPress={onPress}>
      <Animated.Text
        style={[
          styles.syncedLine,
          {
            opacity,
            transform: [{scale}],
            color: active ? accent : colors.text,
          },
          active && {
            textShadowColor: accent,
            textShadowRadius: 16,
            textShadowOffset: {width: 0, height: 0},
            fontWeight: '800',
          },
        ]}>
        {text || '♪'}
      </Animated.Text>
    </TouchableOpacity>
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
  headerTitle: {color: colors.text, fontWeight: '700', fontSize: 15},
  meta: {paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  title: {...typography.h2, fontSize: 22},
  artist: {color: colors.textMuted, marginTop: 2},
  toggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.md,
    gap: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  toggleText: {color: colors.text, fontWeight: '700', fontSize: 13, marginLeft: 4},
  toggleTextActive: {color: '#000'},
  syncedBody: {paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl * 2},
  syncedLine: {
    fontSize: 22,
    lineHeight: 38,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  body: {padding: spacing.lg, paddingBottom: 60},
  lyrics: {color: colors.text, fontSize: 17, lineHeight: 30, fontWeight: '500'},
  empty: {alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.xl},
  emptyText: {color: colors.textMuted, marginTop: spacing.md, textAlign: 'center'},
});
