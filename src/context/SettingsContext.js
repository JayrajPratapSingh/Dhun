// Playback-notification preferences. These map onto real react-native-track-player
// options, so toggling them changes the actual media notification — they are not
// cosmetic switches.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';
import {playerIsReady} from '../player/setupPlayer';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  optionsFor,
} from '../player/notificationOptions';

const SettingsContext = createContext(null);

export function SettingsProvider({children}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setSettings(await loadSettings());
      setLoaded(true);
    })();
  }, []);

  // Push to the player whenever they change. If the player isn't set up yet,
  // setupPlayer() applies the stored settings itself on first play.
  useEffect(() => {
    if (!loaded || !playerIsReady()) return;
    TrackPlayer.updateOptions(optionsFor(settings)).catch(() => {});
  }, [settings, loaded]);

  function setSetting(key, value) {
    setSettings(prev => {
      const next = {...prev, [key]: value};
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  const value = useMemo(() => ({settings, setSetting}), [settings]);
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
