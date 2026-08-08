import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing} from '../theme/theme';
import {formatDuration} from '../utils/format';
import {useLibrary} from '../context/LibraryContext';

// A single track list row with artwork, title/artist, like toggle & duration.
export default function TrackRow({track, index, onPress, active = false}) {
  const {isFavorite, toggleFavorite} = useLibrary();
  const navigation = useNavigation();
  const liked = isFavorite(track.id);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}>
      {typeof index === 'number' && (
        <Text style={[styles.index, active && styles.activeText]}>{index + 1}</Text>
      )}
      {track.artwork ? (
        <Image source={{uri: track.artwork}} style={styles.art} />
      ) : (
        <View style={[styles.art, styles.artFallback]}>
          <Ionicons name="musical-notes" size={18} color={colors.textFaint} />
        </View>
      )}
      <View style={styles.meta}>
        <Text numberOfLines={1} style={[styles.title, active && styles.activeText]}>
          {track.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {track.artist}
        </Text>
      </View>
      <Text style={styles.dur}>{formatDuration(track.duration)}</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddToPlaylist', {track})}
        hitSlop={8}
        style={styles.likeBtn}>
        <Ionicons name="add" size={22} color={colors.textFaint} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => toggleFavorite(track)}
        hitSlop={10}
        style={styles.likeBtn}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={20}
          color={liked ? colors.primary : colors.textFaint}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  index: {
    width: 22,
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
  art: {width: 48, height: 48, borderRadius: radius.sm, marginLeft: spacing.xs},
  artFallback: {
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {flex: 1, marginLeft: spacing.md, marginRight: spacing.sm},
  title: {color: colors.text, fontSize: 15, fontWeight: '600'},
  artist: {color: colors.textMuted, fontSize: 13, marginTop: 2},
  dur: {color: colors.textFaint, fontSize: 12, marginRight: spacing.sm},
  likeBtn: {padding: 4},
  activeText: {color: colors.primary},
});
