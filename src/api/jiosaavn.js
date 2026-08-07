// JioSaavn client — mainstream Hindi / English / Punjabi / Bhojpuri / Marathi songs.
// Uses JioSaavn's own public web API (free, no key). Media URLs come back
// DES-encrypted; we decrypt them client-side with crypto-js (pure JS) to get a
// direct 320 kbps stream URL. This is the same technique the open-source
// JioSaavn API wrappers use internally.
import CryptoJS from 'crypto-js';

const BASE = 'https://www.jiosaavn.com/api.php';
const COMMON = '&_format=json&_marker=0&api_version=4&ctx=web6dot0';
// JioSaavn 403s requests without a browser-like UA.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Languages the app surfaces (value = JioSaavn entity_language).
export const LANGUAGES = [
  {key: 'all', label: 'All', emoji: '🌐'},
  {key: 'hindi', label: 'Hindi', emoji: '🇮🇳'},
  {key: 'punjabi', label: 'Punjabi', emoji: '🎶'},
  {key: 'english', label: 'English', emoji: '🎧'},
  {key: 'tamil', label: 'Tamil', emoji: '🎬'},
  {key: 'south', label: 'South', emoji: '🌴'},
  {key: 'bhojpuri', label: 'Bhojpuri', emoji: '🪕'},
  {key: 'marathi', label: 'Marathi', emoji: '🥁'},
];

// "South" is an aggregate chip that pulls trending across South-Indian languages.
export const SOUTH_LANGUAGES = ['telugu', 'tamil', 'kannada', 'malayalam'];

async function call(params) {
  const res = await fetch(`${BASE}?${params}${COMMON}`, {
    headers: {'User-Agent': UA, Accept: 'application/json'},
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // Occasionally JioSaavn wraps JSON with stray characters; strip to braces.
    const start = text.indexOf('{');
    const startArr = text.indexOf('[');
    const s =
      startArr !== -1 && (startArr < start || start === -1) ? startArr : start;
    if (s !== -1) return JSON.parse(text.slice(s));
    throw e;
  }
}

// --- helpers ------------------------------------------------------------

function decodeEntities(str = '') {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<');
}

function hqImage(url = '') {
  return url.replace('150x150', '500x500').replace(/^http:/, 'https:');
}

function decryptUrl(encrypted, quality = '320') {
  if (!encrypted) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      {ciphertext: CryptoJS.enc.Base64.parse(encrypted)},
      key,
      {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7},
    );
    let url = decrypted.toString(CryptoJS.enc.Utf8);
    return url.replace('_96.mp4', `_${quality}.mp4`).replace(/^http:/, 'https:');
  } catch (e) {
    return null;
  }
}

function primaryArtists(song) {
  const mi = song.more_info || {};
  const map = mi.artistMap?.primary_artists;
  if (Array.isArray(map) && map.length) {
    return decodeEntities(map.map(a => a.name).join(', '));
  }
  // subtitle looks like "Artist1, Artist2 - Album"
  return decodeEntities((song.subtitle || '').split(' - ')[0]) || 'Unknown';
}

// Normalize a JioSaavn song object into the shape the app + player use.
export function normalizeSong(song) {
  if (!song || (song.type && song.type !== 'song')) return null;
  const mi = song.more_info || {};
  return {
    id: song.id,
    title: decodeEntities(song.title),
    artist: primaryArtists(song),
    artwork: hqImage(song.image),
    artworkLarge: hqImage(song.image),
    duration: parseInt(mi.duration || song.duration || 0, 10) || 0,
    language: song.language || mi.language || '',
    album: decodeEntities(mi.album || ''),
    playCount: parseInt(song.play_count || 0, 10) || 0,
    // Decrypt eagerly when the encrypted url is present (search + trending have it).
    url: decryptUrl(mi.encrypted_media_url),
  };
}

// --- public API ---------------------------------------------------------

export async function getTrending(language = 'hindi', {limit = 30} = {}) {
  const data = await call(
    `__call=content.getTrending&entity_type=song&entity_language=${encodeURIComponent(
      language,
    )}`,
  );
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map(normalizeSong).filter(Boolean).slice(0, limit);
}

export async function searchSongs(query, {limit = 40} = {}) {
  if (!query?.trim()) return [];
  const data = await call(
    `__call=search.getResults&q=${encodeURIComponent(query)}&n=${limit}&p=1`,
  );
  const list = data?.results || [];
  return list.map(normalizeSong).filter(Boolean);
}

// Fallback: resolve a stream URL for a song id if it wasn't decrypted eagerly.
export async function getStreamUrl(id) {
  const data = await call(`__call=song.getDetails&pids=${encodeURIComponent(id)}`);
  const song = data?.songs?.[0] || data?.[id] || (Array.isArray(data) ? data[0] : null);
  return decryptUrl(song?.more_info?.encrypted_media_url);
}

export default {LANGUAGES, getTrending, searchSongs, getStreamUrl, normalizeSong};
