// Offline downloads: save a song's audio to the device and play it offline.
// Files are stored in the app's document dir; metadata is kept in AsyncStorage.
// Downloads are device-local (not synced), so a single global list is used.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {getStreamUrl} from '../api/jiosaavn';

const KEY = '@hrm_downloads';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/dhun_downloads`;

const DownloadsContext = createContext(null);

export function DownloadsProvider({children}) {
  const [downloads, setDownloads] = useState([]);
  const [progress, setProgress] = useState({}); // id -> 0..1
  const ref = useRef([]);
  ref.current = downloads;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        setDownloads(raw ? JSON.parse(raw) : []);
      } catch (e) {
        setDownloads([]);
      }
    })();
  }, []);

  function persist(next) {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }

  function isDownloaded(id) {
    return ref.current.some(t => String(t.id) === String(id));
  }

  function getLocalUrl(id) {
    const t = ref.current.find(x => String(x.id) === String(id));
    return t ? t.url : null; // already a file:// url
  }

  function isDownloading(id) {
    return progress[id] !== undefined;
  }

  async function downloadTrack(track) {
    if (isDownloaded(track.id) || isDownloading(track.id)) return;
    setProgress(p => ({...p, [track.id]: 0}));
    try {
      await ReactNativeBlobUtil.fs.mkdir(DIR).catch(() => {});
      const url = track.url || (await getStreamUrl(track.id));
      if (!url) throw new Error('Could not resolve a stream URL for this song');
      const path = `${DIR}/${track.id}.mp4`;
      const task = ReactNativeBlobUtil.config({path, fileCache: true}).fetch(
        'GET',
        url,
        {'User-Agent': UA},
      );
      task.progress((received, total) => {
        const pct = total > 0 ? received / total : 0;
        setProgress(p => ({...p, [track.id]: pct}));
      });
      const res = await task;
      const status = res.info().status;
      if (status < 200 || status >= 300) {
        throw new Error(`Server returned HTTP ${status}`);
      }
      const localPath = res.path();
      const entry = {...track, url: `file://${localPath}`, _localPath: localPath, downloadedAt: Date.now()};
      const next = [entry, ...ref.current];
      setDownloads(next);
      persist(next);
    } catch (e) {
      // A failed fetch can still leave a partial file behind; don't keep it.
      try {
        await ReactNativeBlobUtil.fs.unlink(`${DIR}/${track.id}.mp4`);
      } catch (e2) {}
      console.error('[Downloads] failed to download track', track?.id, e);
      Alert.alert('Download failed', e?.message || 'Something went wrong while downloading this song.');
    } finally {
      setProgress(p => {
        const {[track.id]: _, ...rest} = p;
        return rest;
      });
    }
  }

  async function removeDownload(id) {
    const t = ref.current.find(x => String(x.id) === String(id));
    if (t?._localPath) {
      try {
        await ReactNativeBlobUtil.fs.unlink(t._localPath);
      } catch (e) {}
    }
    const next = ref.current.filter(x => String(x.id) !== String(id));
    setDownloads(next);
    persist(next);
  }

  const value = useMemo(
    () => ({
      downloads,
      progress,
      isDownloaded,
      isDownloading,
      getLocalUrl,
      downloadTrack,
      removeDownload,
    }),
    [downloads, progress],
  );

  return (
    <DownloadsContext.Provider value={value}>
      {children}
    </DownloadsContext.Provider>
  );
}

export function useDownloads() {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error('useDownloads must be used within DownloadsProvider');
  return ctx;
}
