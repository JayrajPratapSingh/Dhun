// Reactive theming: derive a stable, vibrant color palette from the current
// song so the whole player UI (gradient, accents, visualizer, progress bars)
// "reacts" and changes with every track — no native color-extraction needed.
import {colors} from './theme';

function hashString(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Returns a palette object for a given track (memo-friendly: pure function).
export function getSongTheme(track) {
  if (!track) {
    return {
      hue: 265,
      primary: colors.accent,
      accent: colors.primary,
      soft: 'rgba(139,92,246,0.18)',
      gradient: [colors.gradientTop, colors.bg],
    };
  }
  const hue = hashString(String(track.id || track.title)) % 360;
  const primary = hslToHex(hue, 78, 58);
  const accent = hslToHex((hue + 40) % 360, 82, 62);
  const deep = hslToHex(hue, 65, 16);
  return {
    hue,
    primary, // main vibrant color for this song
    accent, // complementary highlight
    soft: `hsla(${hue}, 78%, 58%, 0.18)`,
    // Top-to-bottom background gradient that fades into the app background.
    gradient: [deep, hslToHex(hue, 45, 9), colors.bg],
  };
}

export default getSongTheme;
