// RNTP playback service — runs in a headless context so remote controls
// (lock screen, notification, headset buttons) work even when the app is
// backgrounded, and so we can auto-recover from playback errors.
import TrackPlayer, {Event} from 'react-native-track-player';
import {getStreamUrl} from './src/api/jiosaavn';

module.exports = async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious(),
  );
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({position}) =>
    TrackPlayer.seekTo(position),
  );
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({interval}) => {
    const pos = (await TrackPlayer.getProgress()).position;
    TrackPlayer.seekTo(pos + (interval || 15));
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({interval}) => {
    const pos = (await TrackPlayer.getProgress()).position;
    TrackPlayer.seekTo(Math.max(0, pos - (interval || 15)));
  });

  // Auto-recovery: streams can drop or a URL can go stale during long sessions,
  // which otherwise leaves playback silently stuck until you change the song.
  // On an error we re-resolve a fresh stream URL, reload the current track at
  // the same position, and resume — falling back to retry / skip.
  TrackPlayer.addEventListener(Event.PlaybackError, async () => {
    try {
      const track = await TrackPlayer.getActiveTrack();
      const {position} = await TrackPlayer.getProgress();
      const id = track?._raw?.id || track?.id;
      const isLocal = typeof track?.url === 'string' && track.url.startsWith('file://');
      if (id != null && !isLocal) {
        const url = await getStreamUrl(id);
        if (url) {
          await TrackPlayer.load({...track, url});
          if (position > 1) await TrackPlayer.seekTo(position);
          await TrackPlayer.play();
          return;
        }
      }
      await TrackPlayer.retry();
      await TrackPlayer.play();
    } catch (e) {
      try {
        await TrackPlayer.skipToNext();
        await TrackPlayer.play();
      } catch (_) {}
    }
  });
};
