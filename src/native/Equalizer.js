// JS wrapper around the native EqualizerModule (android.media.audiofx) with a
// set of famous-app-style presets. Band gains are expressed in dB for a
// standard 5-band layout and resampled to whatever band count the device has.
import {NativeModules} from 'react-native';

const EQ = NativeModules.EqualizerModule || null;

export const isSupported = !!EQ;

// name + per-band gains in dB (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz)
export const PRESETS = [
  {name: 'Flat', gains: [0, 0, 0, 0, 0]},
  {name: 'Bass Booster', gains: [7, 5, 2, 0, 0]},
  {name: 'Bass Reducer', gains: [-7, -5, -2, 0, 0]},
  {name: 'Treble Booster', gains: [0, 0, 2, 5, 7]},
  {name: 'Vocal Booster', gains: [-2, 0, 4, 3, -1]},
  {name: 'Pop', gains: [-1, 2, 4, 2, -1]},
  {name: 'Rock', gains: [5, 3, -1, 2, 4]},
  {name: 'Hip-Hop', gains: [5, 4, 1, 2, 3]},
  {name: 'Dance', gains: [6, 3, 0, 3, 5]},
  {name: 'Jazz', gains: [3, 2, 0, 2, 4]},
  {name: 'Classical', gains: [4, 3, 0, 3, 4]},
  {name: 'Acoustic', gains: [4, 2, 1, 2, 3]},
  {name: 'Electronic', gains: [4, 2, 0, 2, 4]},
  {name: 'Deep', gains: [5, 3, 1, -2, -4]},
  {name: 'Loudness', gains: [6, 3, 0, 2, 5]},
];

export async function getConfig() {
  if (!EQ) return null;
  try {
    return await EQ.getConfig();
  } catch (e) {
    return null;
  }
}

export async function getState() {
  if (!EQ) return null;
  try {
    return await EQ.getState();
  } catch (e) {
    return null;
  }
}

export function setEnabled(enabled) {
  EQ?.setEnabled(!!enabled);
}

export function setBandLevel(band, millibels) {
  EQ?.setBandLevel(band, Math.round(millibels));
}

export function setBassBoost(strength) {
  EQ?.setBassBoost(Math.round(strength));
}

// Apply a dB preset across the device's actual bands. Returns applied mB levels.
export function applyPreset(gainsDb, config) {
  if (!config) return [];
  const {numberOfBands, minLevel, maxLevel} = config;
  const out = [];
  for (let i = 0; i < numberOfBands; i++) {
    const pos =
      numberOfBands <= 1 ? 0 : (i / (numberOfBands - 1)) * (gainsDb.length - 1);
    const gainDb = gainsDb[Math.round(pos)] ?? 0;
    const mb = Math.max(minLevel, Math.min(maxLevel, Math.round(gainDb * 100)));
    out.push(mb);
    setBandLevel(i, mb);
  }
  return out;
}

// Human-readable frequency label from milliHz.
export function freqLabel(milliHz) {
  const hz = milliHz / 1000;
  return hz >= 1000 ? `${Math.round(hz / 1000)}kHz` : `${Math.round(hz)}Hz`;
}

export default {
  isSupported,
  PRESETS,
  getConfig,
  getState,
  setEnabled,
  setBandLevel,
  setBassBoost,
  applyPreset,
  freqLabel,
};
