import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {searchSongs} from '../api/jiosaavn';
import {usePlay} from '../hooks/usePlay';
import TrackRow from '../components/TrackRow';

const SUGGESTIONS = [
  'Arijit Singh',
  'Anirudh',
  'Sidhu Moose Wala',
  'Diljit Dosanjh',
  'Sid Sriram',
  'Devi Sri Prasad',
  'The Weeknd',
  'Pawan Singh',
  'Ajay-Atul',
  'Shreya Ghoshal',
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const play = usePlay();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);

  // Debounced live search.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await searchSongs(query, {limit: 40});
        setResults(r);
        setSearched(true);
      } catch (_) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => timer.current && clearTimeout(timer.current);
  }, [query]);

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.md}]}>
      <Text style={[typography.h1, styles.title]}>Search</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Songs, artists, genres…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {!query.trim() && (
        <View style={styles.suggestWrap}>
          <Text style={styles.suggestLabel}>Try searching for</Text>
          <View style={styles.suggestRow}>
            {SUGGESTIONS.map(s => (
              <TouchableOpacity key={s} style={styles.suggestChip} onPress={() => setQuery(s)}>
                <Text style={styles.suggestText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading && <ActivityIndicator color={colors.primary} style={{marginTop: spacing.xl}} />}

      {!loading && searched && results.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="sad-outline" size={40} color={colors.textFaint} />
          <Text style={styles.emptyText}>No results for “{query}”</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{paddingHorizontal: spacing.lg, paddingBottom: 140}}
        keyboardShouldPersistTaps="handled"
        renderItem={({item, index}) => (
          <TrackRow track={item} onPress={() => play(results, index)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  title: {paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: {flex: 1, color: colors.text, paddingVertical: 12, marginLeft: spacing.sm, fontSize: 15},
  suggestWrap: {padding: spacing.lg},
  suggestLabel: {color: colors.textMuted, marginBottom: spacing.md, fontWeight: '600'},
  suggestRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  suggestChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestText: {color: colors.text, fontWeight: '600', fontSize: 13},
  empty: {alignItems: 'center', marginTop: spacing.xxl},
  emptyText: {color: colors.textMuted, marginTop: spacing.md},
});
