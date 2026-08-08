// Synced (line-by-line) lyrics via LRCLIB — a free, no-key lyrics API that
// returns timestamped LRC lyrics. Falls back to plain lyrics when no synced
// match exists. Used for the player's "Lyrics Mode".
const BASE = 'https://lrclib.net/api';

// Parse LRC text ("[mm:ss.xx] line") into [{time: seconds, text}] sorted by time.
function parseLRC(lrc) {
  if (!lrc) return [];
  const out = [];
  const re = /\[(\d+):(\d+(?:\.\d+)?)\]/g;
  lrc.split('\n').forEach(line => {
    const text = line.replace(/\[[^\]]*\]/g, '').trim();
    let m;
    re.lastIndex = 0;
    const times = [];
    while ((m = re.exec(line)) !== null) {
      times.push(parseInt(m[1], 10) * 60 + parseFloat(m[2]));
    }
    // A blank text with a timestamp is a musical gap — keep it (shows "♪").
    times.forEach(t => out.push({time: t, text}));
  });
  return out.sort((a, b) => a.time - b.time);
}

// Fetch synced lyrics for a track. Returns {lines:[{time,text}], plain} or null.
export async function getSyncedLyrics({title, artist, duration}) {
  if (!title) return null;
  const primaryArtist = (artist || '').split(',')[0].trim();
  const tryParse = data => {
    if (!data) return null;
    const synced = parseLRC(data.syncedLyrics);
    if (synced.length) return {lines: synced, plain: data.plainLyrics || ''};
    return null;
  };

  // 1) Exact get by artist + track (+ duration for best match).
  try {
    const q =
      `?artist_name=${encodeURIComponent(primaryArtist)}` +
      `&track_name=${encodeURIComponent(title)}` +
      (duration ? `&duration=${Math.round(duration)}` : '');
    const res = await fetch(`${BASE}/get${q}`, {
      headers: {'User-Agent': 'Dhun Music App'},
    });
    if (res.ok) {
      const parsed = tryParse(await res.json());
      if (parsed) return parsed;
    }
  } catch (e) {}

  // 2) Fallback: search and take the first result that has synced lyrics.
  try {
    const res = await fetch(
      `${BASE}/search?q=${encodeURIComponent(`${title} ${primaryArtist}`)}`,
      {headers: {'User-Agent': 'Dhun Music App'}},
    );
    if (res.ok) {
      const arr = await res.json();
      for (const item of arr || []) {
        const parsed = tryParse(item);
        if (parsed) return parsed;
      }
    }
  } catch (e) {}

  return null;
}
