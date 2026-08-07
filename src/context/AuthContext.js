// Authentication: real cloud accounts via Firebase Auth (log in from any
// device) + a local "Continue as guest" mode. A matching user document is kept
// in Firestore so favourites/recents can sync across devices.
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import {
  saveUserData,
  setDeactivated,
  deleteUserDoc,
} from '../firebase/firestoreRest';

const GUEST_KEY = '@hrm_guest';
const AuthContext = createContext(null);

const authInstance = getAuth();

// Map Firebase error codes to friendly messages.
function friendly(e) {
  switch (e?.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Please enter a valid email';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password';
    case 'auth/network-request-failed':
      return 'Network error — check your connection';
    default:
      return e?.message || 'Something went wrong';
  }
}

function toSession(fbUser) {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || (fbUser.email || '').split('@')[0],
    email: fbUser.email,
  };
}

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let restoredGuest = false;
    // Restore a guest session if there's no signed-in Firebase user.
    (async () => {
      const g = await AsyncStorage.getItem(GUEST_KEY);
      if (g && !authInstance.currentUser) {
        restoredGuest = true;
        setUser({id: 'guest', name: 'Guest', guest: true});
      }
    })();

    const unsub = onAuthStateChanged(authInstance, fbUser => {
      if (fbUser) {
        setUser(toSession(fbUser));
      } else if (!restoredGuest) {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function register({name, email, password}) {
    if (!name?.trim()) throw new Error('Please enter your name');
    try {
      const cred = await createUserWithEmailAndPassword(
        authInstance,
        (email || '').trim(),
        password || '',
      );
      await updateProfile(cred.user, {displayName: name.trim()});
      // Create the user's cloud library document (favourites/recents live here).
      await saveUserData(cred.user.uid, {favorites: [], recent: []});
      await AsyncStorage.removeItem(GUEST_KEY);
      setUser({id: cred.user.uid, name: name.trim(), email: cred.user.email});
    } catch (e) {
      throw new Error(friendly(e));
    }
  }

  async function login({email, password}) {
    try {
      await AsyncStorage.removeItem(GUEST_KEY);
      const cred = await signInWithEmailAndPassword(
        authInstance,
        (email || '').trim(),
        password || '',
      );
      // Signing back in reactivates a temporarily-deactivated account.
      setDeactivated(cred.user.uid, false).catch(() => {});
      // onAuthStateChanged will set the user.
    } catch (e) {
      throw new Error(friendly(e));
    }
  }

  // Update the signed-in user's display name.
  async function updateName(name) {
    if (!authInstance.currentUser || !name?.trim()) return;
    await updateProfile(authInstance.currentUser, {displayName: name.trim()});
    setUser(prev => (prev ? {...prev, name: name.trim()} : prev));
  }

  // Send a password-reset email to the signed-in user's address.
  async function resetPassword() {
    const email = authInstance.currentUser?.email;
    if (!email) throw new Error('No email on file');
    await sendPasswordResetEmail(authInstance, email);
  }

  // Temporary: flag the account deactivated in the cloud, then sign out.
  // Signing in again reactivates it automatically.
  async function deactivateAccount() {
    const u = authInstance.currentUser;
    if (!u) return;
    await setDeactivated(u.uid, true);
    await signOut(authInstance);
    setUser(null);
  }

  // Permanent: delete the cloud data and the auth account.
  async function deleteAccount() {
    const u = authInstance.currentUser;
    if (!u) return;
    try {
      await deleteUserDoc(u.uid);
      await deleteUser(u); // removes the Firebase Auth account
      setUser(null);
    } catch (e) {
      if (e?.code === 'auth/requires-recent-login') {
        throw new Error(
          'For security, please log out and sign in again, then delete.',
        );
      }
      throw new Error(friendly(e));
    }
  }

  async function continueAsGuest() {
    await AsyncStorage.setItem(GUEST_KEY, '1');
    setUser({id: 'guest', name: 'Guest', guest: true});
  }

  async function logout() {
    await AsyncStorage.removeItem(GUEST_KEY);
    if (authInstance.currentUser) {
      await signOut(authInstance);
    }
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isGuest: !!user?.guest,
      isAuthed: !!user && !user.guest,
      register,
      login,
      continueAsGuest,
      logout,
      updateName,
      resetPassword,
      deactivateAccount,
      deleteAccount,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
