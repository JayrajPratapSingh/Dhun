// Playback state built on react-native-track-player.
// Exposes the current track, play/pause, next/prev, seek, and a helper to
// start playback from any list of Audius tracks.
import React, {createContext, useCallback, useContext, useMemo} from 'react';
import TrackPlayer, {
  State,
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
    }),
    [current, theme, isPlaying, isBuffering, progress, playFromList, playTrack, togglePlay, next, prev, seekTo],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
