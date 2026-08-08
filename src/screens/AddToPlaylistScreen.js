import React, {useState} from 'react';
import {
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
import {usePlaylists} from '../context/PlaylistsContext';

export default function AddToPlaylistScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const track = route.params?.track;
  const {playlists, createPlaylist, addToPlaylist} = usePlaylists();
  const [newName, setNewName] = useState('');

  function add(id) {
    if (track) addToPlaylist(id, track);
    navigation.goBack();
  }

  function createAndAdd() {
    const name = newName.trim();
    if (!name) return;
    const pl = createPlaylist(name);
    if (track) addToPlaylist(pl.id, track);
    navigation.goBack();
  }

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to playlist</Text>
        <View style={{width: 26}} />
      </View>

      {!!track && (
        <Text numberOfLines={1} style={styles.sub}>
          {track.title} · {track.artist}
        </Text>
      )}

      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          placeholder="New playlist name"
          placeholderTextColor={colors.textFaint}
          value={newName}
          onChangeText={setNewName}
        />
        <TouchableOpacity style={styles.createBtn} onPress={createAndAdd}>
          <Ionicons name="add" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={i => i.id}
        contentContainerStyle={{padding: spacing.lg, paddingBottom: 60}}
        ListEmptyComponent={
          <Text style={styles.empty}>No playlists yet — create one above.</Text>
        }
        renderItem={({item}) => (
          <TouchableOpacity style={styles.plRow} onPress={() => add(item.id)}>
            <View style={styles.plIcon}>
              <Ionicons name="musical-notes" size={20} color={colors.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.plName}>{item.name}</Text>
              <Text style={styles.plCount}>{item.tracks.length} songs</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        )}
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
  sub: {color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  createRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm},
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createBtn: {
    backgroundColor: colors.primary,
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  plRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  plIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  plName: {color: colors.text, fontSize: 15, fontWeight: '700'},
  plCount: {color: colors.textMuted, fontSize: 12, marginTop: 2},
  empty: {color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl},
});
