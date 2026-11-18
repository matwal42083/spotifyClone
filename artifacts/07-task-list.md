# Artifact 7: Task List

> [!TIP]
> **Biological Intelligence (BI) Instructions:**
> Execute these tasks sequentially. Do not move to the next phase until the current phase passes the TDD pre-flight.

## Phase 1: Environment & Scaffolding

- [x] Run terminal command: `git init` and create `.gitignore` (`node_modules/`, `dist/`, `.env`, `.env.local`, `coverage/`, `.DS_Store`) per Artifact 2.
- [x] Run terminal command: `npm create vite@latest . -- --template react` to scaffold the Vite + React baseline.
- [x] Run terminal command: `npm install react-router-dom` to install client-side routing.
- [x] Run terminal command: `npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @babel/core @babel/preset-env @babel/preset-react babel-jest identity-obj-proxy` to install the mandatory Jest and React Testing Library suite.
- [x] Run terminal command: `mkdir -p src/utils src/data src/components src/pages __tests__` to scaffold the modular directory structure mapped in Artifact 4.

## Phase 2: Logic & State (Artifact 5 Alignment)

- [ ] Implement static configuration schema (`TIME_RANGE_OPTIONS`, `DEFAULT_EMBED_PLAYLIST_ID`) in `src/data/fallbackCatalog.js` (`[SDD-REQ-04]`).
- [ ] Map state machine nodes (`IDLE_RESTING`, `AUTH_EXPIRED_401`, `RATE_LIMITED_429`, `EMPTY_CATALOG`, `CATALOG_READY`, `PLAYLIST_EMBEDDED`, `BEAT_SYNC_ACTIVE`, `AMBIENT_120BPM`) and the 16-band `equalizerBars` vector from Artifact 5 to `src/utils/spotifyApi.js`, `src/utils/beatVisualizer.js`, and `src/pages/Dashboard.jsx`.
- [ ] Build the Live Application Shell and 404 Catch-All first (`src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/pages/NotFound.jsx`, and `src/App.jsx` with `<Route path="*" element={<NotFound />} />`) so the live browser screen remains intact (`[SDD-REQ-05]`).

## Phase 3: TDD & Code Diffs (Artifact 6 Alignment)

- [ ] Write failing Jest unit test suite in `__tests__/spotifyApi.test.js` covering `fetchWebApi`, `getTopTracks` (`limit=50`), `createPlaylistWithTracks`, `401 AUTH_EXPIRED`, `429 RATE_LIMITED`, and `EMPTY_TRACKS` (`[SDD-REQ-01, SDD-REQ-02]`).
- [ ] Inject instructional scaffolding (`// Step 1:` to `// Step 3:`) into `src/utils/spotifyApi.js` and implement `fetchWebApi`, `getTopTracks`, and `createPlaylistWithTracks` per Artifact 6 diff to turn `__tests__/spotifyApi.test.js` GREEN.
- [ ] Write failing Jest unit test suite in `__tests__/beatVisualizer.test.js` covering `RESTING_THEME` (`#000000` background, `#1DB954` foreground, 16 resting `15%` equalizer bars), `calculateBeatIntervalMs` (including 500ms / 120 BPM fallback), `generateEqualizerBars`, `computeNextVisualState`, and `applyThemeToDocument` (`[SDD-REQ-03]`).
- [ ] Inject instructional scaffolding (`// Step 4:`) into `src/utils/beatVisualizer.js` and implement the beat-reactive color, tempo, and 16-band graphic equalizer engine per Artifact 6 diff to turn `__tests__/beatVisualizer.test.js` GREEN.
- [ ] Write failing Jest + React Testing Library integration suite in `__tests__/Dashboard.test.jsx` covering top-track rendering, 16-band graphic equalizer mounting, playlist creation, embedded iframe updates, and all 4 failure matrix states (`[SDD-REQ-04, SDD-REQ-05, SDD-REQ-06]`).
- [ ] Inject instructional scaffolding (`// Step 5:` and `// Step 6:`) into `src/data/fallbackCatalog.js`, `src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/pages/NotFound.jsx`, `src/App.jsx`, and `src/main.jsx` and implement the application shell per Artifact 6 diff.
- [ ] Inject instructional scaffolding (`// Step 7:`) into child components `src/components/GraphicEqualizer.jsx`, `src/components/TrackCard.jsx`, and `src/components/EmbedPlayer.jsx` immediately before parent page `src/pages/Dashboard.jsx`, binding all 16 equalizer bars, words, borders, and beat pulses to `foregroundColor` and `isBeatPulse`.
- [ ] Inject instructional scaffolding (`// Step 8:`) into parent page `src/pages/Dashboard.jsx` and implement catalog fetching, playlist saving, the 16-band graphic equalizer display, global beat-reactive foreground transitions, and error fallbacks per Artifact 6 diff to turn `__tests__/Dashboard.test.jsx` GREEN.

## Phase 4: Final Review & Integration

- [ ] Verify that all foreground elements (words, headings, button outlines, card borders, navbar, footer, the 16-band `GraphicEqualizer`, and `--fg-color` / `--beat-scale` / `--beat-glow` CSS variables) start at Spotify Green (`#1DB954`) on `#000000` and shift colors + bounce/pulse to the beat during playback.
- [ ] Run the full Jest + React Testing Library suite (`npx jest --watchAll=false`) to confirm all test suites pass in the GREEN state and execute `/sweep` via `av-cleanup-sweeper` to strip fulfilled instructional comments.
