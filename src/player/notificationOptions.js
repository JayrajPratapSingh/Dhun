// Shared between the settings UI and player setup, so both agree on what the
// stored preferences mean without importing each other.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppKilledPlaybackBehavior,
  Capability,
} from 'react-native-track-player';

export const SETTINGS_KEY = '@hrm_settings';

export const DEFAULT_SETTINGS = {
  showSeekBar: true, // Capability.SeekTo in the notification
  showSkipButtons: true, // next / previous in the notification
  keepPlayingWhenClosed: false, // survive the app being swiped away
};

// Translate our preferences into the options RNTP expects.
export function optionsFor(settings) {
  const capabilities = [Capability.Play, Capability.Pause, Capability.Stop];
  const compact = [Capability.Play, Capability.Pause];
  if (settings.showSkipButtons) {
    capabilities.push(Capability.SkipToNext, Capability.SkipToPrevious);
    compact.push(Capability.SkipToNext, Capability.SkipToPrevious);
  }
  if (settings.showSeekBar) capabilities.push(Capability.SeekTo);
  return {
    android: {
      appKilledPlaybackBehavior: settings.keepPlayingWhenClosed
        ? AppKilledPlaybackBehavior.ContinuePlayback
        : AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities,
    compactCapabilities: compact,
    progressUpdateEventInterval: 1,
  };
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? {...DEFAULT_SETTINGS, ...JSON.parse(raw)} : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}
