import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {getTrending, LANGUAGES, SOUTH_LANGUAGES} from '../api/jiosaavn';
import {useAuth} from '../context/AuthContext';
import {usePlay} from '../hooks/usePlay';
import TrackCard from '../components/TrackCard';
import TrackRow from '../components/TrackRow';
import Loader from '../components/Loader';
import FadeIn from '../components/FadeIn';

// Vibrant accent per language for the chips + section headers.
const LANG_COLORS = {
  all: ['#8B5CF6', '#EC4899'],
  hindi: ['#F97316', '#F43F5E'],
  punjabi: ['#F59E0B', '#EAB308'],
  english: ['#3B82F6', '#06B6D4'],
  tamil: ['#14B8A6', '#0EA5E9'],
  south: ['#EF4444', '#F59E0B'],
  bhojpuri: ['#10B981', '#84CC16'],
  marathi: ['#8B5CF6', '#6366F1'],
  // section-only keys (used inside South / All)
  telugu: ['#06B6D4', '#3B82F6'],
  kannada: ['#F43F5E', '#EC4899'],
  malayalam: ['#22C55E', '#10B981'],
};

// Languages shown as sections when "All" is selected.
const ALL_SECTIONS = ['hindi', 'punjabi', 'tamil', 'english', 'bhojpuri', 'marathi'];

export default function HomeScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {user} = useAuth();
  const play = usePlay();

  const [lang, setLang] = useState('all');
  const [sections, setSections] = useState({}); // { hindi: [...], ... }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Which language sections to fetch for the selected chip.
  const sectionsFor = selected =>
    selected === 'all'
      ? ALL_SECTIONS
      : selected === 'south'
      ? SOUTH_LANGUAGES
      : [selected];

  const load = useCallback(async selected => {
    setError('');
    try {
      const langs = sectionsFor(selected);
      const results = await Promise.all(langs.map(l => getTrending(l, {limit: 20})));
      const next = {};
      langs.forEach((l, i) => (next[l] = results[i]));
      setSections(next);
    } catch (e) {
      setError('Could not load songs. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(lang);
  }, [lang, load]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const labelFor = key =>
    LANGUAGES.find(l => l.key === key)?.label ||
    key.charAt(0).toUpperCase() + key.slice(1);
  const sectionKeys = sectionsFor(lang);

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={[LANG_COLORS[lang]?.[0] + '55' || '#8B5CF655', colors.bg]}
        style={[styles.headerGlow, {paddingTop: insets.top + spacing.md}]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{user?.name || 'Music lover'}</Text>
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate('Search')}
            hitSlop={8}>
            <Ionicons name="search" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {LANGUAGES.map(l => {
            const active = lang === l.key;
            const grad = LANG_COLORS[l.key] || ['#333', '#333'];
            return (
              <TouchableOpacity key={l.key} onPress={() => setLang(l.key)} activeOpacity={0.8}>
                <LinearGradient
                  colors={active ? grad : [colors.card, colors.card]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.chip}>
                  <Text style={styles.chipEmoji}>{l.emoji}</Text>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {l.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {loading ? (
        <Loader label="Loading fresh music…" />
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{paddingBottom: 150}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(lang);
              }}
              tintColor={colors.primary}
            />
          }>
          {!!error && <Text style={styles.error}>{error}</Text>}

          {sectionKeys.map((key, si) => {
            const list = sections[key] || [];
            if (!list.length) return null;
            const grad = LANG_COLORS[key] || ['#8B5CF6', '#EC4899'];
            return (
              <FadeIn key={key} delay={si * 90} style={styles.section}>
                <View style={styles.sectionHead}>
                  <View style={[styles.dot, {backgroundColor: grad[0]}]} />
                  <Text style={styles.sectionTitle}>
                    {lang === 'all' ? `Trending ${labelFor(key)}` : `Trending ${labelFor(key)}`}
                  </Text>
                </View>

                {/* First section shows big feature card row; rest are carousels */}
                <FlatList
                  horizontal
                  data={list}
                  keyExtractor={i => String(i.id)}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{paddingLeft: spacing.lg}}
                  renderItem={({item, index}) => (
                    <TrackCard
                      track={item}
                      width={si === 0 ? 165 : 140}
                      onPress={() => play(list, index)}
                    />
                  )}
                />

                {/* Under the first carousel, also show a quick list to fill the screen */}
                {si === 0 && (
                  <View style={styles.list}>
                    {list.slice(0, 5).map((item, index) => (
                      <TrackRow
                        key={String(item.id)}
                        track={item}
                        index={index}
                        onPress={() => play(list, index)}
                      />
                    ))}
                  </View>
                )}
              </FadeIn>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  headerGlow: {paddingBottom: spacing.md},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  greeting: {color: colors.textMuted, fontSize: 14},
  name: {...typography.h2},
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  chipEmoji: {fontSize: 14, marginRight: 6},
  chipText: {color: colors.textMuted, fontWeight: '700', fontSize: 13},
  chipTextActive: {color: '#fff'},
  section: {marginTop: spacing.lg},
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  dot: {width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm},
  sectionTitle: {...typography.h3, fontSize: 19},
  list: {paddingHorizontal: spacing.lg, marginTop: spacing.sm},
  error: {color: colors.danger, paddingHorizontal: spacing.lg, marginTop: spacing.md},
});
