import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {searchSongs, searchAlbums} from '../api/jiosaavn';
import {useI18n} from '../i18n/LanguageContext';
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
  const navigation = useNavigation();
  const {t} = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);

  // Debounced live search (songs + albums/movies in parallel).
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) {
      setResults([]);
      setAlbums([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const [songs, albs] = await Promise.all([
          searchSongs(query, {limit: 40}),
          searchAlbums(query, {limit: 15}),
        ]);
        setResults(songs);
        setAlbums(albs);
        setSearched(true);
      } catch (_) {
        setResults([]);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => timer.current && clearTimeout(timer.current);
  }, [query]);

  const AlbumsHeader = () =>
    albums.length ? (
      <View style={styles.albumsWrap}>
        <Text style={styles.sectionLabel}>{t('albums_movies')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {albums.map(al => (
            <TouchableOpacity
              key={al.id}
              style={styles.albumCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('Album', {
                  albumId: al.id,
                  title: al.title,
                  image: al.image,
                })
              }>
              {al.image ? (
                <Image source={{uri: al.image}} style={styles.albumArt} />
              ) : (
                <View style={[styles.albumArt, styles.albumFallback]}>
                  <Ionicons name="albums" size={28} color={colors.textFaint} />
                </View>
              )}
              <Text numberOfLines={1} style={styles.albumTitle}>
                {al.title}
              </Text>
              <Text numberOfLines={1} style={styles.albumSub}>
                {al.year ? `${al.year} · Album` : 'Album'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {results.length > 0 && <Text style={styles.sectionLabel}>{t('songs')}</Text>}
      </View>
    ) : null;

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.md}]}>
      <Text style={[typography.h1, styles.title]}>{t('search')}</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={t('search_placeholder')}
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
          <Text style={styles.suggestLabel}>{t('try_search')}</Text>
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

      {!loading && searched && results.length === 0 && albums.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="sad-outline" size={40} color={colors.textFaint} />
          <Text style={styles.emptyText}>{t('no_results')} “{query}”</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{paddingHorizontal: spacing.lg, paddingBottom: 140}}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={AlbumsHeader}
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
  albumsWrap: {marginBottom: spacing.sm},
  sectionLabel: {...typography.h3, fontSize: 16, marginTop: spacing.md, marginBottom: spacing.sm},
  albumCard: {width: 130, marginRight: spacing.lg},
  albumArt: {width: 130, height: 130, borderRadius: radius.md, backgroundColor: colors.card},
  albumFallback: {alignItems: 'center', justifyContent: 'center'},
  albumTitle: {color: colors.text, fontSize: 13, fontWeight: '700', marginTop: spacing.sm},
  albumSub: {color: colors.textMuted, fontSize: 11, marginTop: 2},
  empty: {alignItems: 'center', marginTop: spacing.xxl},
  emptyText: {color: colors.textMuted, marginTop: spacing.md},
});
