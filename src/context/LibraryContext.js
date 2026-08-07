// Per-user library: liked/favorite tracks + recently played.
// - Signed-in users: stored in Firestore via its REST API (synced across
//   devices; loaded on sign-in, written on every change).
// - Guests: stored locally in AsyncStorage (device only).
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loadUserData, saveUserData} from '../firebase/firestoreRest';
import {useAuth} from './AuthContext';

const LibraryContext = createContext(null);
const keyFor = uid => `@hrm_library_${uid || 'anon'}`;

export function LibraryProvider({children}) {
  const {user, isAuthed} = useAuth();
  const uid = user?.id || 'guest';
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [ready, setReady] = useState(false);
  // Latest values, to compute writes without stale closures.
  const favRef = useRef([]);
  const recentRef = useRef([]);
  favRef.current = favorites;
  recentRef.current = recent;

  useEffect(() => {
    let alive = true;
    setReady(false);
    (async () => {
      try {
        let data;
        if (isAuthed && user?.id) {
          data = await loadUserData(user.id); // Firestore REST
        } else {
          const raw = await AsyncStorage.getItem(keyFor(uid));
          data = raw ? JSON.parse(raw) : {favorites: [], recent: []};
        }
        if (alive) {
          setFavorites(data.favorites || []);
          setRecent(data.recent || []);
        }
      } catch (e) {
        if (alive) {
          setFavorites([]);
          setRecent([]);
        }
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid, isAuthed, user?.id]);

  // Persist to the right backend for the current user.
  function persist(nextFav, nextRecent) {
    if (isAuthed && user?.id) {
      saveUserData(user.id, {favorites: nextFav, recent: nextRecent}).catch(
        () => {},
      );
    } else {
      AsyncStorage.setItem(
        keyFor(uid),
        JSON.stringify({favorites: nextFav, recent: nextRecent}),
      ).catch(() => {});
    }
  }

  function isFavorite(id) {
    return favorites.some(t => String(t.id) === String(id));
  }

  function toggleFavorite(track) {
    const exists = favRef.current.some(t => String(t.id) === String(track.id));
    const next = exists
      ? favRef.current.filter(t => String(t.id) !== String(track.id))
      : [track, ...favRef.current];
    setFavorites(next);
    persist(next, recentRef.current);
  }

  function addRecent(track) {
    const next = [
      track,
      ...recentRef.current.filter(t => String(t.id) !== String(track.id)),
    ].slice(0, 30);
    setRecent(next);
    persist(favRef.current, next);
  }

  const value = useMemo(
    () => ({favorites, recent, ready, isFavorite, toggleFavorite, addRecent}),
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
