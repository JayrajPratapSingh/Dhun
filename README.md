# 🎵 Dhun

A colorful React Native music streaming app for **Hindi · English · Punjabi · Bhojpuri · Marathi** songs, with login **and** guest mode, background playback, lock‑screen controls, per‑song **reactive theming**, an animated visualizer, and a **Creator Studio** for your own uploads.

Powered by **JioSaavn's** free public web API (no key) — real mainstream tracks streamed at **320 kbps**.

---

## ✨ Features

- **Real mainstream catalog** — trending charts per language (Hindi, Punjabi, English, Bhojpuri, Marathi) plus full-text search across JioSaavn.
- **True 320 kbps streaming** — media URLs are DES‑decrypted client-side (`crypto-js`) into direct stream links.
- **Reactive UI** — every song derives its own vibrant color; the player background, glow, visualizer, seek bar, play button and badges all recolor per track ([songTheme.js](src/theme/songTheme.js)).
- **Animated visualizer** — equalizer bars that pulse while playing ([Visualizer.js](src/components/Visualizer.js)).
- **Auth** — email/password (stored locally) **plus "Continue without login"** guest mode; separate library per user.
- **Playback** — full-screen player, persistent mini‑player, background audio, lock‑screen / notification controls (`react-native-track-player`).
- **Library** — liked songs + recently played, per user.
- **Creator Studio** — pick an audio file from the device and add it to your playable library.

## 🧱 Tech stack

| Area | Choice |
|------|--------|
| Framework | React Native 0.86 (bare CLI, New Architecture) |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| Audio | react-native-track-player 4.1.2 (patched for New Arch) |
| Music API | JioSaavn public web API (free, no key) |
| Decryption | crypto-js (DES‑ECB, pure JS) |
| Storage | @react-native-async-storage/async-storage |
| File picker | @react-native-documents/picker |
| UI | react-native-linear-gradient, @react-native-community/slider, react-native-vector-icons |

## 📁 Key files

```
src/
├── api/jiosaavn.js          # JioSaavn client: trending per language, search, DES stream-url decryption
├── theme/songTheme.js       # per-song reactive color palette (hash -> HSL)
├── components/Visualizer.js  # animated equalizer bars
├── context/{Auth,Library,Uploads,Player}Context.js
├── screens/{Home,Search,Creator,Library,Player,Profile}Screen.js
│   └── auth/{Login,Register}Screen.js
└── components/{MiniPlayer,TrackRow,TrackCard,SectionHeader,Loader}.js
android/app/src/main/res/
├── drawable/ic_launcher_{background,foreground}.xml   # adaptive app icon (music note on gradient)
└── mipmap-anydpi-v26/ic_launcher{,_round}.xml
```

## ▶️ Running it

```bash
npm install          # applies the RNTP New-Architecture patch via postinstall
npm start            # Metro
npm run android      # build & run on device/emulator
```

Requires Android SDK + JDK 17 and a running emulator/device. JioSaavn requests send a browser `User-Agent` (it 403s otherwise).

## 🩹 track-player patch (New Architecture)

`react-native-track-player@4.1.2` predates RN 0.86's mandatory New Architecture. The shipped patch (`patches/react-native-track-player+4.1.2.patch`, auto-applied by `patch-package`) fixes: nullable `Bundle` args, coroutine `Job` return types on async `@ReactMethod`s (must be `void`), and bridgeless event emission via `ReactHost` instead of the dead `reactNativeHost`. See the source comments for details.

## 📝 Notes

- Local auth is a **client-only demo**; swap `AuthContext` for a real backend for production.
- JioSaavn is an **unofficial** API; it's free and reliable but not an official partnership. Creator uploads stay **local to the device**.
