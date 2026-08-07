// Local authentication: register / login / guest — persisted with AsyncStorage.
// NOTE: This is a client-only demo auth store. Passwords are lightly hashed and
// kept on-device; swap for a real backend (Firebase, your API) for production.
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@hrm_users';
const SESSION_KEY = '@hrm_session';

const AuthContext = createContext(null);

// Tiny non-cryptographic hash — enough to avoid storing raw passwords in a demo.
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

export function AuthProvider({children}) {
  const [user, setUser] = useState(null); // {id, name, email} | {guest:true} | null
  const [loading, setLoading] = useState(true);

  // Restore a previous session on cold start.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persistSession(u) {
    setUser(u);
    if (u) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(SESSION_KEY);
  }

  async function readUsers() {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async function register({name, email, password}) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!name?.trim()) throw new Error('Please enter your name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      throw new Error('Please enter a valid email');
    if ((password || '').length < 6)
      throw new Error('Password must be at least 6 characters');

    const users = await readUsers();
    if (users.some(u => u.email === cleanEmail))
      throw new Error('An account with this email already exists');

    const newUser = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      pass: hash(password),
    };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const session = {id: newUser.id, name: newUser.name, email: newUser.email};
    await persistSession(session);
    return session;
  }

  async function login({email, password}) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = await readUsers();
    const found = users.find(u => u.email === cleanEmail);
    if (!found || found.pass !== hash(password || ''))
      throw new Error('Invalid email or password');
    const session = {id: found.id, name: found.name, email: found.email};
    await persistSession(session);
    return session;
  }

  async function continueAsGuest() {
    await persistSession({id: 'guest', name: 'Guest', guest: true});
  }

  async function logout() {
    await persistSession(null);
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
