import React from 'react';
import {Alert, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {usePlaylists} from '../context/PlaylistsContext';
import {usePlay} from '../hooks/usePlay';
import TrackRow from '../components/TrackRow';

export default function PlaylistDetailScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const {getPlaylist, removeFromPlaylist, deletePlaylist} = usePlaylists();
  const play = usePlay();
  const playlist = getPlaylist(route.params?.id);

  if (!playlist) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.empty}>Playlist not found.</Text>
      </View>
    );
  }

  function confirmDelete() {
    Alert.alert('Delete playlist?', `Delete “${playlist.name}”?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePlaylist(playlist.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} hitSlop={10}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <View style={styles.cover}>
          <Ionicons name="musical-notes" size={40} color={colors.primary} />
        </View>
        <Text style={styles.name}>{playlist.name}</Text>
        <Text style={styles.count}>{playlist.tracks.length} songs</Text>
        {playlist.tracks.length > 0 && (
          <TouchableOpacity style={styles.playAll} onPress={() => play(playlist.tracks, 0)}>
            <Ionicons name="play" size={20} color="#000" />
            <Text style={styles.playAllText}>Play all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={playlist.tracks}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{paddingHorizontal: spacing.lg, paddingBottom: 140}}
        ListEmptyComponent={
          <Text style={styles.empty}>No songs yet. Add songs with the “+” on any track.</Text>
        }
        renderItem={({item, index}) => (
          <View style={styles.row}>
            <View style={{flex: 1}}>
              <TrackRow track={item} onPress={() => play(playlist.tracks, index)} />
            </View>
            <TouchableOpacity
              onPress={() => removeFromPlaylist(playlist.id, item.id)}
              hitSlop={8}
              style={styles.remove}>
              <Ionicons name="remove-circle-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  center: {alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  info: {alignItems: 'center', marginBottom: spacing.lg},
  cover: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {...typography.h2, marginTop: spacing.md},
  count: {color: colors.textMuted, marginTop: 2},
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
  row: {flexDirection: 'row', alignItems: 'center'},
  remove: {padding: 8},
  empty: {color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.xl},
});
