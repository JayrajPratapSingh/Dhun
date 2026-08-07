// Per-user library: liked/favorite tracks + recently played.
// Stored in AsyncStorage under a key namespaced by the current user id, so a
// logged-in user and a guest keep separate libraries on the same device.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from './AuthContext';

const LibraryContext = createContext(null);

const keyFor = uid => `@hrm_library_${uid || 'anon'}`;

export function LibraryProvider({children}) {
  const {user} = useAuth();
  const uid = user?.id || 'anon';
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [ready, setReady] = useState(false);

  // Load this user's library whenever the active user changes.
  useEffect(() => {
    let alive = true;
    (async () => {
      setReady(false);
      try {
        const raw = await AsyncStorage.getItem(keyFor(uid));
        const data = raw ? JSON.parse(raw) : {favorites: [], recent: []};
        if (alive) {
          setFavorites(data.favorites || []);
          setRecent(data.recent || []);
        }
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid]);

  async function persist(nextFav, nextRecent) {
    await AsyncStorage.setItem(
      keyFor(uid),
      JSON.stringify({favorites: nextFav, recent: nextRecent}),
    );
  }

  function isFavorite(id) {
    return favorites.some(t => String(t.id) === String(id));
  }

  function toggleFavorite(track) {
    setFavorites(prev => {
      const exists = prev.some(t => String(t.id) === String(track.id));
      const next = exists
        ? prev.filter(t => String(t.id) !== String(track.id))
        : [track, ...prev];
      persist(next, recent);
      return next;
    });
  }

  function addRecent(track) {
    setRecent(prev => {
      const next = [
        track,
        ...prev.filter(t => String(t.id) !== String(track.id)),
      ].slice(0, 30);
      persist(favorites, next);
      return next;
    });
  }

  const value = useMemo(
    () => ({
      favorites,
      recent,
      ready,
      isFavorite,
      toggleFavorite,
      addRecent,
    }),
    [favorites, recent, ready],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
