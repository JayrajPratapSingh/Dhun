// One-time player initialization with hi-res friendly options.
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
} from 'react-native-track-player';

let isReady = false;

export async function setupPlayer() {
  if (isReady) return true;
  try {
    // If already set up (e.g. after fast refresh), getActiveTrackIndex resolves.
    await TrackPlayer.getActiveTrackIndex();
    isReady = true;
    return true;
  } catch (_) {
    // not set up yet -> continue
  }

  try {
    await TrackPlayer.setupPlayer({
      // Larger buffer for smoother high-bitrate streaming.
      minBuffer: 15,
      maxBuffer: 60,
      backBuffer: 30,
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      progressUpdateEventInterval: 1,
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    isReady = true;
    return true;
  } catch (e) {
    isReady = false;
    return false;
  }
}

export function playerIsReady() {
  return isReady;
}
