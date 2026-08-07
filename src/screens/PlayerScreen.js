import React, {useState} from 'react';
import {Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {usePlayer} from '../context/PlayerContext';
import {useLibrary} from '../context/LibraryContext';
import {formatDuration} from '../utils/format';
import Visualizer from '../components/Visualizer';
import FadeIn from '../components/FadeIn';

export default function PlayerScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {
    current,
    theme,
    isPlaying,
    isBuffering,
    progress,
    togglePlay,
    next,
    prev,
    seekTo,
    repeatMode,
    cycleRepeat,
    shuffle,
    rate,
    setRate,
    sleepMinutes,
    setSleep,
    RepeatMode,
  } = usePlayer();
  const {isFavorite, toggleFavorite} = useLibrary();
  const [showSleep, setShowSleep] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const accent = theme.primary;
  const repeatOn = repeatMode !== RepeatMode.Off;

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

      <FadeIn style={styles.artworkWrap} offset={22} duration={500}>
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
      </FadeIn>

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
        <TouchableOpacity onPress={shuffle} hitSlop={10}>
          <Ionicons name="shuffle" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={prev} hitSlop={10}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, {backgroundColor: accent, shadowColor: accent}]}
          onPress={togglePlay}>
          <Ionicons
            name={isBuffering ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
            size={36}
            color="#000"
            style={!isPlaying && !isBuffering ? {marginLeft: 3} : undefined}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={next} hitSlop={10}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={cycleRepeat} hitSlop={10}>
          <View>
            <Ionicons name="repeat" size={24} color={repeatOn ? accent : colors.text} />
            {repeatMode === RepeatMode.Track && (
              <View style={[styles.repeatOne, {backgroundColor: accent}]}>
                <Text style={styles.repeatOneText}>1</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Utility row: equalizer, sleep timer, speed */}
      <View style={styles.utilRow}>
        <UtilButton
          icon="options"
          label="Equalizer"
          accent={accent}
          onPress={() => navigation.navigate('Equalizer')}
        />
        <UtilButton
          icon="moon"
          label={sleepMinutes ? `${sleepMinutes} min` : 'Sleep'}
          active={!!sleepMinutes}
          accent={accent}
          onPress={() => setShowSleep(true)}
        />
        <UtilButton
          icon="speedometer"
          label={`${rate}x`}
          active={rate !== 1}
          accent={accent}
          onPress={() => setShowSpeed(true)}
        />
      </View>

      <View style={styles.quality}>
        <View style={[styles.qBadge, {backgroundColor: theme.soft}]}>
          <Ionicons name="pulse" size={14} color={accent} />
          <Text style={[styles.qualityText, {color: accent}]}>320 kbps</Text>
        </View>
        {!!current.language && (
          <View style={[styles.qBadge, {backgroundColor: theme.soft}]}>
            <Text style={[styles.qualityText, {color: accent}]}>
              {current.language[0].toUpperCase() + current.language.slice(1)}
            </Text>
          </View>
        )}
      </View>

      <PickerModal
        visible={showSleep}
        title="Sleep timer"
        accent={accent}
        onClose={() => setShowSleep(false)}
        options={[
          {label: 'Off', value: null},
          {label: '10 minutes', value: 10},
          {label: '15 minutes', value: 15},
          {label: '30 minutes', value: 30},
          {label: '45 minutes', value: 45},
          {label: '60 minutes', value: 60},
        ]}
        selected={sleepMinutes}
        onSelect={v => {
          setSleep(v);
          setShowSleep(false);
        }}
      />

      <PickerModal
        visible={showSpeed}
        title="Playback speed"
        accent={accent}
        onClose={() => setShowSpeed(false)}
        options={[0.5, 0.75, 1, 1.25, 1.5, 2].map(v => ({label: `${v}x`, value: v}))}
        selected={rate}
        onSelect={v => {
          setRate(v);
          setShowSpeed(false);
        }}
      />
    </LinearGradient>
  );
}

function UtilButton({icon, label, onPress, accent, active}) {
  return (
    <TouchableOpacity style={styles.utilBtn} onPress={onPress}>
      <Ionicons name={icon} size={20} color={active ? accent : colors.textMuted} />
      <Text style={[styles.utilLabel, active && {color: accent}]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PickerModal({visible, title, options, selected, onSelect, onClose, accent}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.sheetTitle}>{title}</Text>
          {options.map(opt => {
            const isSel = selected === opt.value;
            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={styles.sheetRow}
                onPress={() => onSelect(opt.value)}>
                <Text style={[styles.sheetLabel, isSel && {color: accent, fontWeight: '800'}]}>
                  {opt.label}
                </Text>
                {isSel && <Ionicons name="checkmark" size={20} color={accent} />}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
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
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  repeatOne: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneText: {color: '#000', fontSize: 9, fontWeight: '900'},
  utilRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  utilBtn: {alignItems: 'center', paddingVertical: spacing.sm, minWidth: 84},
  utilLabel: {color: colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: '600'},
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: {...typography.h3, marginBottom: spacing.md},
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetLabel: {color: colors.text, fontSize: 16},
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
    marginTop: spacing.lg,
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
