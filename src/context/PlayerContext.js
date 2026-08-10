// Playback state built on react-native-track-player.
// Exposes the current track, play/pause, next/prev, seek, shuffle, repeat,
// sleep timer, playback speed, and a helper to start playback from any list.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import TrackPlayer, {
  State,
  RepeatMode,
  usePlaybackState,
  useActiveTrack,
  useProgress,
} from 'react-native-track-player';
import {getStreamUrl} from '../api/jiosaavn';
import {getSongTheme} from '../theme/songTheme';
import {setupPlayer} from '../player/setupPlayer';

const PlayerContext = createContext(null);

// Convert our normalized Audius track -> an RNTP track (with a stream URL).
async function toRNTPTrack(t) {
  return {
    id: String(t.id),
    url: t.url || (await getStreamUrl(t.id)),
    title: t.title,
    artist: t.artist,
    artwork: t.artworkLarge || t.artwork || undefined,
    duration: t.duration || 0,
    // keep originals for UI (favorite toggles, navigation)
    _raw: t,
  };
}

export function PlayerProvider({children}) {
  const playback = usePlaybackState();
  const activeTrack = useActiveTrack();
  const progress = useProgress(250);

  const isPlaying = playback.state === State.Playing;
  const isBuffering =
    playback.state === State.Buffering || playback.state === State.Loading;

  // Start playback of `list` beginning at `index`.
  const playFromList = useCallback(async (list, index = 0) => {
    if (!list?.length) return;
    await setupPlayer();
    const rntpTracks = await Promise.all(list.map(toRNTPTrack));
    await TrackPlayer.reset();
    await TrackPlayer.add(rntpTracks);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  }, []);

  const playTrack = useCallback(
    async track => {
      await playFromList([track], 0);
    },
    [playFromList],
  );

  const togglePlay = useCallback(async () => {
    const state = (await TrackPlayer.getPlaybackState()).state;
    if (state === State.Playing) await TrackPlayer.pause();
    else await TrackPlayer.play();
  }, []);

  const next = useCallback(() => TrackPlayer.skipToNext().catch(() => {}), []);
  const prev = useCallback(async () => {
    // If we're more than 3s in, restart the track instead of skipping back.
    const {position} = await TrackPlayer.getProgress();
    if (position > 3) TrackPlayer.seekTo(0);
    else TrackPlayer.skipToPrevious().catch(() => {});
  }, []);
  const seekTo = useCallback(sec => TrackPlayer.seekTo(sec), []);

  // --- Repeat -----------------------------------------------------------
  const [repeatMode, setRepeatModeState] = useState(RepeatMode.Queue);
  const cycleRepeat = useCallback(() => {
    setRepeatModeState(prev => {
      const nextMode =
        prev === RepeatMode.Off
          ? RepeatMode.Track
          : prev === RepeatMode.Track
          ? RepeatMode.Queue
          : RepeatMode.Off;
      TrackPlayer.setRepeatMode(nextMode).catch(() => {});
      return nextMode;
    });
  }, []);

  // --- Shuffle ----------------------------------------------------------
  const shuffle = useCallback(async () => {
    const queue = await TrackPlayer.getQueue();
    if (!queue || queue.length < 2) return;
    const idx = (await TrackPlayer.getActiveTrackIndex()) ?? 0;
    const currentTrack = queue[idx];
    const rest = queue.filter((_, i) => i !== idx);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    await TrackPlayer.reset();
    await TrackPlayer.add([currentTrack, ...rest]);
    await TrackPlayer.play();
  }, []);

  // --- Playback speed ---------------------------------------------------
  const [rate, setRateState] = useState(1);
  const setRate = useCallback(r => {
    TrackPlayer.setRate(r).catch(() => {});
    setRateState(r);
  }, []);

  // The native player outlives this JS context (e.g. the app is killed while the
  // notification keeps playing). Without reading the real rate back, the UI would
  // reset to "1x" while audio carried on at the old speed.
  useEffect(() => {
    if (!activeTrack) return;
    let cancelled = false;
    TrackPlayer.getRate()
      .then(r => {
        if (!cancelled && typeof r === 'number' && r > 0) setRateState(r);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeTrack?.id]);

  // --- Sleep timer ------------------------------------------------------
  const [sleepMinutes, setSleepMinutes] = useState(null);
  const sleepTimer = useRef(null);
  const setSleep = useCallback(minutes => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    if (!minutes) {
      setSleepMinutes(null);
      sleepTimer.current = null;
      return;
    }
    setSleepMinutes(minutes);
    sleepTimer.current = setTimeout(() => {
      TrackPlayer.pause().catch(() => {});
      setSleepMinutes(null);
      sleepTimer.current = null;
    }, minutes * 60 * 1000);
  }, []);
  useEffect(() => () => sleepTimer.current && clearTimeout(sleepTimer.current), []);

  // The currently playing track in our own normalized shape.
  const current = activeTrack?._raw || null;
  // Reactive palette derived from the current song.
  const theme = useMemo(() => getSongTheme(current), [current?.id]);

  const value = useMemo(
    () => ({
      current,
      theme,
      isPlaying,
      isBuffering,
      progress,
      playFromList,
      playTrack,
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
    }),
    [current, theme, isPlaying, isBuffering, progress, playFromList, playTrack, togglePlay, next, prev, seekTo, repeatMode, cycleRepeat, shuffle, rate, setRate, sleepMinutes, setSleep],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
