// Creator uploads: tracks the user adds from their own device.
// Stored per-user in AsyncStorage; the audio file is copied into the app's
// cache dir so it has a stable file:// path that track-player can stream.
//
// NOTE: This keeps uploads LOCAL to the device. Publishing to the public Audius
// network requires Audius' wallet-based auth SDK and is intentionally out of
// scope for this free, no-API-key app.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from './AuthContext';

const UploadsContext = createContext(null);
const keyFor = uid => `@hrm_uploads_${uid || 'anon'}`;

export function UploadsProvider({children}) {
  const {user} = useAuth();
  const uid = user?.id || 'anon';
  const [uploads, setUploads] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setReady(false);
      try {
        const raw = await AsyncStorage.getItem(keyFor(uid));
        if (alive) setUploads(raw ? JSON.parse(raw) : []);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid]);

  async function persist(next) {
    await AsyncStorage.setItem(keyFor(uid), JSON.stringify(next));
  }

  function addUpload(track) {
    setUploads(prev => {
      const next = [track, ...prev];
      persist(next);
      return next;
    });
  }

  function removeUpload(id) {
    setUploads(prev => {
      const next = prev.filter(t => String(t.id) !== String(id));
      persist(next);
      return next;
    });
  }

  const value = useMemo(
    () => ({uploads, ready, addUpload, removeUpload}),
    [uploads, ready],
  );

  return (
    <UploadsContext.Provider value={value}>{children}</UploadsContext.Provider>
  );
}

export function useUploads() {
  const ctx = useContext(UploadsContext);
  if (!ctx) throw new Error('useUploads must be used within UploadsProvider');
  return ctx;
}
