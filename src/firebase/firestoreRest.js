// Firestore access via its REST API (instead of the native @react-native-firebase
// /firestore module, whose New-Architecture C++ codegen produces file paths that
// exceed Windows' 260-char limit on deep project folders).
//
// We authenticate each request with the signed-in user's Firebase ID token, so
// Firestore security rules see request.auth just like the native SDK. The whole
// library payload is stored as a single JSON string field to keep serialization
// trivial.
import {getAuth} from '@react-native-firebase/auth';

const PROJECT_ID = 'dhun-93ce4';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function idToken() {
  const u = getAuth().currentUser;
  return u ? u.getIdToken() : null;
}

// Read the user's library doc. Returns {favorites, recent} (empty if missing).
export async function loadUserData(uid) {
  const token = await idToken();
  if (!token) return {favorites: [], recent: []};
  const res = await fetch(`${BASE}/users/${uid}`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  if (res.status === 404) return {favorites: [], recent: []};
  if (!res.ok) throw new Error(`Firestore load failed: ${res.status}`);
  const json = await res.json();
  const raw = json?.fields?.data?.stringValue;
  if (!raw) return {favorites: [], recent: []};
  try {
    const parsed = JSON.parse(raw);
    return {favorites: parsed.favorites || [], recent: parsed.recent || []};
  } catch (e) {
    return {favorites: [], recent: []};
  }
}

// Write the user's library doc (merges only the `data` field).
export async function saveUserData(uid, data) {
  const token = await idToken();
  if (!token) return;
  const body = {fields: {data: {stringValue: JSON.stringify(data)}}};
  await fetch(`${BASE}/users/${uid}?updateMask.fieldPaths=data`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Set the account's `deactivated` flag (temporary deactivation).
export async function setDeactivated(uid, value) {
  const token = await idToken();
  if (!token) return;
  const body = {fields: {deactivated: {booleanValue: !!value}}};
  await fetch(`${BASE}/users/${uid}?updateMask.fieldPaths=deactivated`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function isDeactivated(uid) {
  const token = await idToken();
  if (!token) return false;
  const res = await fetch(`${BASE}/users/${uid}`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  if (!res.ok) return false;
  const json = await res.json();
  return json?.fields?.deactivated?.booleanValue === true;
}

// Permanently delete the user's cloud document.
export async function deleteUserDoc(uid) {
  const token = await idToken();
  if (!token) return;
  await fetch(`${BASE}/users/${uid}`, {
    method: 'DELETE',
    headers: {Authorization: `Bearer ${token}`},
  });
}
