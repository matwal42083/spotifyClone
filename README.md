# Spotify Clone — Beat-Reactive Concert Web Player

A custom React 18 + Vite Spotify Web Player clone featuring a fixed `100vh` Spotify layout, real-time Web Audio FFT live-audio beat synchronization, a 48-band gradient graphic equalizer, a cubic-Bezier dancing hero wave, concert stage strobe lights, dual beat-pumping sidebar speakers, curated rock/metal lighting scenes, and 15 automated Jest + React Testing Library tests.

---

## Features

- **Fixed `100vh` Spotify Web Player Shell:** Inverted `#000000` top bar with centered circular Home button and live Search pill, fixed left **Your Library** sidebar with custom Spotify playlist URL importer (saved in `localStorage`) and pinned **Rock Opera** playlist, fixed hero header, and scrollable center content pane.
- **Real-Time Live Audio Beat Sync (`src/utils/audioBeatDetector.js`):** Captures live browser tab audio via Web Audio `AnalyserNode` (`getDisplayMedia`) with 60fps FFT spectrum analysis and positive spectral-flux beat detection—when the music stops or pauses, the entire stage immediately resets to resting Spotify Green (`#1DB954`).
- **Curated Concert Lighting Engine (`src/utils/beatVisualizer.js`):** Cycles smoothly across 6 cohesive rock/metal concert lighting scenes (**Crimson Fire**, **Electric Blue**, **Laser Green**, **Stadium Gold**, **Ultraviolet**, **Chrome Ice**) using CSS Houdini `@property` typed `<color>` transitions (`380ms ease`) for silky gradient morphing alongside crisp beat-locked `box-shadow` flashes, header strobe spots, dancing buttons, and pumping subwoofer speakers.
- **48-Band Gradient Graphic Equalizer & Dancing Wave (`src/components/GraphicEqualizer.jsx`, `src/components/HeroWaveDancer.jsx`):** 0ms-lag 60fps audio-reactive bars and dual harmonic wave lines locked directly to the live spectrum.
- **Spotify Web API Client (`src/utils/spotifyApi.js`):** Centralized `fetchWebApi`, `getTopTracks` (`limit=50`), and `createPlaylistWithTracks` (`public: false`) with `401 AUTH_EXPIRED`, `429 RATE_LIMITED`, and `EMPTY_TRACKS` guards.

---

## Run Locally

**Requirements:** Node.js (v20+ LTS) and npm.

```bash
git clone https://github.com/matwal42083/spotifyClone.git
cd spotifyClone
npm install
npm run dev
```

### Testing & Production Build

```bash
# Run full Jest + React Testing Library test suite (15 tests)
npx jest --watchAll=false

# Production build
npm run build
```

---

## Technology

- **Frontend:** React 18, Vite, React Router (`react-router-dom`), CSS Houdini `@property`, Web Audio API (`AnalyserNode`)
- **Testing:** Jest, React Testing Library, `@testing-library/jest-dom`, `babel-jest`
- **Playback:** Spotify Embed Iframe API (`open.spotify.com/embed`)

---

## Feedback

This is an independently built portfolio project. Feedback that helps improve the product direction, accessibility, interface design, or implementation approach is welcome.

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Spotify. Spotify and its related marks are the property of Spotify AB.
