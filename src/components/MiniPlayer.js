import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing} from '../theme/theme';
import {usePlayer} from '../context/PlayerContext';
import {useLibrary} from '../context/LibraryContext';

// Compact persistent player docked above the bottom tab bar.
export default function MiniPlayer() {
  const {current, theme, isPlaying, isBuffering, togglePlay, progress} = usePlayer();
  const {isFavorite, toggleFavorite} = useLibrary();
  const navigation = useNavigation();

  if (!current) return null;
  const liked = isFavorite(current.id);
  const pct = progress.duration ? (progress.position / progress.duration) * 100 : 0;

  return (
    <View style={[styles.wrap, {borderTopColor: theme.primary}]}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${pct}%`, backgroundColor: theme.primary}]} />
      </View>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Player')}>
        {current.artwork ? (
          <Image source={{uri: current.artwork}} style={styles.art} />
        ) : (
          <View style={[styles.art, styles.fallback]}>
            <Ionicons name="musical-notes" size={16} color={colors.textFaint} />
          </View>
        )}
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.title}>
            {current.title}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {current.artist}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(current)} hitSlop={10} style={styles.btn}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? theme.primary : colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} hitSlop={10} style={styles.btn}>
          <Ionicons
            name={isBuffering ? 'ellipsis-horizontal' : isPlaying ? 'pause' : 'play'}
            size={26}
            color={colors.text}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  progressTrack: {height: 2, backgroundColor: colors.border},
  progressFill: {height: 2, backgroundColor: colors.primary},
  row: {flexDirection: 'row', alignItems: 'center', padding: spacing.sm},
  art: {width: 44, height: 44, borderRadius: radius.sm},
  fallback: {backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center'},
  meta: {flex: 1, marginLeft: spacing.md},
  title: {color: colors.text, fontSize: 14, fontWeight: '700'},
  artist: {color: colors.textMuted, fontSize: 12, marginTop: 1},
  btn: {paddingHorizontal: spacing.sm},
});
