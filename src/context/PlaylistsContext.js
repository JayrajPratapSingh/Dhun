// Custom user playlists.
// - Signed-in users: stored in Firestore (users/{uid}.playlists) via REST.
// - Guests: stored locally in AsyncStorage.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loadPlaylists, savePlaylists} from '../firebase/firestoreRest';
import {useAuth} from './AuthContext';

const PlaylistsContext = createContext(null);
const keyFor = uid => `@hrm_playlists_${uid || 'guest'}`;

export function PlaylistsProvider({children}) {
  const {user, isAuthed} = useAuth();
  const uid = user?.id || 'guest';
  const [playlists, setPlaylists] = useState([]);
  const [ready, setReady] = useState(false);
  const ref = useRef([]);
  ref.current = playlists;

  useEffect(() => {
    let alive = true;
    setReady(false);
    (async () => {
      try {
        let data;
        if (isAuthed && user?.id) {
          data = await loadPlaylists(user.id);
        } else {
          const raw = await AsyncStorage.getItem(keyFor(uid));
          data = raw ? JSON.parse(raw) : [];
        }
        if (alive) setPlaylists(data || []);
      } catch (e) {
        if (alive) setPlaylists([]);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid, isAuthed, user?.id]);

  function persist(next) {
    if (isAuthed && user?.id) {
      savePlaylists(user.id, next).catch(() => {});
    } else {
      AsyncStorage.setItem(keyFor(uid), JSON.stringify(next)).catch(() => {});
    }
  }

  function commit(next) {
    setPlaylists(next);
    persist(next);
  }

  function createPlaylist(name) {
    const pl = {id: `pl_${Date.now()}`, name: name?.trim() || 'New Playlist', tracks: []};
    commit([pl, ...ref.current]);
    return pl;
  }

  function renamePlaylist(id, name) {
    commit(ref.current.map(p => (p.id === id ? {...p, name: name.trim()} : p)));
  }

  function deletePlaylist(id) {
    commit(ref.current.filter(p => p.id !== id));
  }

  function addToPlaylist(id, track) {
    commit(
      ref.current.map(p => {
        if (p.id !== id) return p;
        if (p.tracks.some(t => String(t.id) === String(track.id))) return p;
        return {...p, tracks: [track, ...p.tracks]};
      }),
    );
  }

  function removeFromPlaylist(id, trackId) {
    commit(
      ref.current.map(p =>
        p.id === id
          ? {...p, tracks: p.tracks.filter(t => String(t.id) !== String(trackId))}
          : p,
      ),
    );
  }

  function getPlaylist(id) {
    return playlists.find(p => p.id === id) || null;
  }

  const value = useMemo(
    () => ({
      playlists,
      ready,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      getPlaylist,
    }),
    [playlists, ready],
  );

  return (
    <PlaylistsContext.Provider value={value}>
      {children}
    </PlaylistsContext.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(PlaylistsContext);
  if (!ctx) throw new Error('usePlaylists must be used within PlaylistsProvider');
  return ctx;
}
