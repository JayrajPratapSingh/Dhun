import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {usePlayer} from '../context/PlayerContext';
import {useLibrary} from '../context/LibraryContext';
import {formatDuration} from '../utils/format';
import Visualizer from '../components/Visualizer';

export default function PlayerScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {current, theme, isPlaying, isBuffering, progress, togglePlay, next, prev, seekTo} =
    usePlayer();
  const {isFavorite, toggleFavorite} = useLibrary();

  if (!current) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Ionicons name="musical-notes-outline" size={54} color={colors.textFaint} />
        <Text style={styles.nothing}>Nothing is playing</Text>
        <TouchableOpacity style={styles.closeMini} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liked = isFavorite(current.id);

  return (
    <LinearGradient colors={theme.gradient} style={styles.flex}>
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <View style={{width: 28}} />
      </View>

      <View style={styles.artworkWrap}>
        {current.artworkLarge || current.artwork ? (
          <Image
            source={{uri: current.artworkLarge || current.artwork}}
            style={[styles.artwork, {shadowColor: theme.primary}]}
          />
        ) : (
          <View style={[styles.artwork, styles.artFallback]}>
            <Ionicons name="musical-notes" size={80} color={colors.textFaint} />
          </View>
        )}
      </View>

      {/* Visualizer reacts to the song's color + playing state */}
      <View style={styles.vizWrap}>
        <Visualizer playing={isPlaying} color={theme.primary} bars={7} height={40} />
      </View>

      <View style={styles.info}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.title}>
            {current.title}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {current.artist}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(current)} hitSlop={10}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={30}
            color={liked ? theme.primary : colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.seekWrap}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={progress.duration || current.duration || 1}
          value={progress.position}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={theme.primary}
          onSlidingComplete={seekTo}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatDuration(progress.position)}</Text>
          <Text style={styles.time}>
            {formatDuration(progress.duration || current.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={prev} hitSlop={10}>
          <Ionicons name="play-skip-back" size={34} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, {backgroundColor: theme.primary, shadowColor: theme.primary}]}
          onPress={togglePlay}>
          <Ionicons
            name={isBuffering ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
            size={38}
            color="#000"
            style={!isPlaying && !isBuffering ? {marginLeft: 3} : undefined}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={next} hitSlop={10}>
          <Ionicons name="play-skip-forward" size={34} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.quality}>
        <View style={[styles.qBadge, {backgroundColor: theme.soft}]}>
          <Ionicons name="pulse" size={14} color={theme.primary} />
          <Text style={[styles.qualityText, {color: theme.primary}]}>320 kbps</Text>
        </View>
        {!!current.language && (
          <View style={[styles.qBadge, {backgroundColor: theme.soft}]}>
            <Text style={[styles.qualityText, {color: theme.primary}]}>
              {current.language[0].toUpperCase() + current.language.slice(1)}
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  center: {alignItems: 'center', justifyContent: 'center'},
  nothing: {color: colors.textMuted, marginTop: spacing.md},
  closeMini: {marginTop: spacing.lg},
  closeText: {color: colors.primary, fontWeight: '700'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {color: colors.text, fontWeight: '700', fontSize: 15},
  artworkWrap: {alignItems: 'center', marginTop: spacing.md, paddingHorizontal: spacing.xl},
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.xl,
    maxWidth: 340,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 16,
  },
  artFallback: {backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center'},
  vizWrap: {alignItems: 'center', marginTop: spacing.lg},
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  title: {...typography.h2, fontSize: 23},
  artist: {color: colors.textMuted, fontSize: 15, marginTop: 4},
  seekWrap: {paddingHorizontal: spacing.lg, marginTop: spacing.md},
  slider: {width: '100%', height: 40},
  timeRow: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs},
  time: {color: colors.textMuted, fontSize: 12},
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  playBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 12,
  },
  quality: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  qBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginHorizontal: 4,
  },
  qualityText: {fontSize: 12, fontWeight: '700', marginLeft: 4},
});
