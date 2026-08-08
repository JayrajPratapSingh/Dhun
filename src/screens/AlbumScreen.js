import React, {useEffect, useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {getAlbumSongs} from '../api/jiosaavn';
import {usePlay} from '../hooks/usePlay';
import TrackRow from '../components/TrackRow';
import Loader from '../components/Loader';

export default function AlbumScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const play = usePlay();
  const {albumId, title, image} = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await getAlbumSongs(albumId);
      if (alive) {
        setData(res);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [albumId]);

  const songs = data?.songs || [];
  const cover = data?.image || image;

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {title || data?.title || 'Album'}
        </Text>
        <View style={{width: 28}} />
      </View>

      {loading ? (
        <Loader label="Loading songs…" />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={{paddingHorizontal: spacing.lg, paddingBottom: 140}}
          ListHeaderComponent={
            <View style={styles.info}>
              {cover ? (
                <Image source={{uri: cover}} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverFallback]}>
                  <Ionicons name="albums" size={44} color={colors.textFaint} />
                </View>
              )}
              <Text style={styles.title}>{data?.title || title}</Text>
              <Text style={styles.meta}>
                {songs.length} songs{data?.year ? ` · ${data.year}` : ''}
              </Text>
              {songs.length > 0 && (
                <TouchableOpacity style={styles.playAll} onPress={() => play(songs, 0)}>
                  <Ionicons name="play" size={20} color="#000" />
                  <Text style={styles.playAllText}>Play all</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No songs found for this album.</Text>
          }
          renderItem={({item, index}) => (
            <TrackRow track={item} index={index} onPress={() => play(songs, index)} />
          )}
        />
      )}
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
  headerTitle: {...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm},
  info: {alignItems: 'center', marginBottom: spacing.lg},
  cover: {width: 150, height: 150, borderRadius: radius.lg, backgroundColor: colors.card},
  coverFallback: {alignItems: 'center', justifyContent: 'center'},
  title: {...typography.h2, fontSize: 20, marginTop: spacing.md, textAlign: 'center', paddingHorizontal: spacing.lg},
  meta: {color: colors.textMuted, marginTop: 4},
  playAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  playAllText: {color: '#000', fontWeight: '800', marginLeft: 6},
  empty: {color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl},
});
