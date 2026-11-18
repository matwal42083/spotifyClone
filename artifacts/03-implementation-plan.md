# Artifact 3: Implementation Plan

> [!CAUTION]
> This document dictates the engineering logic. It contains conceptual instructions, not executable code.

## 1. Spec-Driven Development (SDD)

*The blueprint for the implementation logic.*

- **Data Structures:**
  - `TrackItem`: Object containing `id` (`string`), `uri` (`string`, formatted as `spotify:track:<id>`), `name` (`string`), `artists` (`Array<{ name: string }>`), and `bpm` (`number | null`).
  - `PlaylistResponse`: Object containing `id` (`string`), `name` (`string`), and `public` (`boolean`).
  - `VisualThemeState`: Object containing `backgroundColor` (`string`, locked to `#000000`), `foregroundColor` (`string`, starting at `#1DB954` and shifting across `BEATS_PALETTE` for all words, borders, equalizer bars, and controls), `isBeatPulse` (`boolean`), `intervalMs` (`number`), and `equalizerBars` (`Array<number>`, 16 frequency bar heights from `15` to `100` percent).
  - `TimeRangeOption`: Object in `src/data/fallbackCatalog.js` containing `optionId` (`string`), `rangeKey` (`'short_term' | 'medium_term' | 'long_term'`), and `displayLabel` (`string`).

- **State Mutations:**
  - **Authentication & Error State (`src/pages/Dashboard.jsx`):** Mutates `authError` (`boolean`) when `fetchWebApi` throws an `AUTH_EXPIRED` (`401`) error, clearing any active token and resetting the visual theme and equalizer bars to `RESTING_THEME`. Mutates `rateLimitError` (`boolean`) when `fetchWebApi` throws `RATE_LIMITED` (`429` or network error), preserving cached `tracks` in memory while pausing playback.
  - **Catalog & Playlist State (`src/pages/Dashboard.jsx`):** Updating `timeRange` (`short_term`, `medium_term`, `long_term`) triggers `getTopTracks` with `limit=50` and replaces the `tracks` collection. Invoking the playlist creation action calls `createPlaylistWithTracks` and updates `activePlaylistId` to immediately update the `EmbedPlayer` iframe source.
  - **Beat-Reactive Global Visual & Equalizer Engine State (`src/utils/beatVisualizer.js` & `src/pages/Dashboard.jsx`):** Toggling `isPlaying` to `true` starts a timer at `intervalMs` (derived from active track BPM or the 120 BPM / `500ms` fallback) that invokes `computeNextVisualState` and `applyThemeToDocument` on each beat tick to update `foregroundColor`, recompute the 16 `equalizerBars` heights so they move up and down to the beat, and toggle `isBeatPulse` across all words, borders, buttons, and containers. Toggling `isPlaying` to `false` immediately resets `visualState`, `equalizerBars` (`Array(16).fill(15)`), and document CSS variables to `RESTING_THEME` (`#000000` background, `#1DB954` foreground, `isBeatPulse: false`).

- **Core Logic:**
  - **`[SDD-REQ-01]` Spotify Web API Client & Top Tracks Fetcher (`src/utils/spotifyApi.js`):**
    - **Function `fetchWebApi`:**
      - **File Path:** `src/utils/spotifyApi.js`
      - **Inputs:** `endpoint` (`string`), `method` (`string`), `body` (`object | undefined`), `token` (`string`)
      - **Outputs:** `Promise<object>`
      - **Side Effects:** Performs an HTTP request via `fetch` to `https://api.spotify.com/${endpoint}` with `Authorization: Bearer ${token}`. Throws `Error('AUTH_EXPIRED')` on HTTP `401`, throws `Error('RATE_LIMITED')` on HTTP `429` or network rejection, and parses JSON on HTTP `2xx`.
    - **Function `getTopTracks`:**
      - **File Path:** `src/utils/spotifyApi.js`
      - **Inputs:** `token` (`string`), `timeRange` (`string`, default `'long_term'`), `limit` (`number`, default `50`)
      - **Outputs:** `Promise<Array<TrackItem>>`
      - **Side Effects:** Invokes `fetchWebApi` targeting `v1/me/top/tracks?time_range=${timeRange}&limit=${limit}` with `'GET'` and returns the `items` array (or an empty array `[]` if `items` is missing).
  - **`[SDD-REQ-02]` Private Playlist Generator (`src/utils/spotifyApi.js`):**
    - **Function `createPlaylistWithTracks`:**
      - **File Path:** `src/utils/spotifyApi.js`
      - **Inputs:** `token` (`string`), `tracksUri` (`Array<string>`), `name` (`string`, default `'My top tracks playlist'`)
      - **Outputs:** `Promise<PlaylistResponse>`
      - **Side Effects:** Validates that `tracksUri` is a non-empty array (throws `Error('EMPTY_TRACKS')` if empty). Issues a `POST` request to `v1/me/playlists` with `public: false`, followed by a `POST` request to `v1/playlists/${playlist.id}/items?uris=${tracksUri.join(',')}` to populate the tracks, returning the created `playlist` object.
  - **`[SDD-REQ-03]` Beat-Reactive Color, Tempo & Graphic Equalizer Engine (`src/utils/beatVisualizer.js`):**
    - **Function `calculateBeatIntervalMs`:**
      - **File Path:** `src/utils/beatVisualizer.js`
      - **Inputs:** `bpm` (`number | null | undefined`)
      - **Outputs:** `number` (milliseconds per beat)
      - **Side Effects:** None. Returns `Math.round(60000 / bpm)` when `bpm` is a positive finite number; otherwise returns `500` (120 BPM fallback).
    - **Function `generateEqualizerBars`:**
      - **File Path:** `src/utils/beatVisualizer.js`
      - **Inputs:** `isPlaying` (`boolean`), `isBeatPulse` (`boolean`), `randomFn` (`() => number`), `barCount` (`number`, default `16`)
      - **Outputs:** `Array<number>` (16 bar height percentages in `[15, 100]`)
      - **Side Effects:** None. Returns `Array(barCount).fill(15)` when `isPlaying` is `false`. When `isPlaying` is `true`, computes dynamic bar heights between `25%` and `100%` (boosted on beat pulse ticks) so the equalizer display moves up and down to the beat.
    - **Function `computeNextVisualState`:**
      - **File Path:** `src/utils/beatVisualizer.js`
      - **Inputs:** `options` (`{ isPlaying: boolean, bpm?: number | null, tickCount?: number, randomFn?: () => number }`)
      - **Outputs:** `VisualThemeState`
      - **Side Effects:** None. Returns `RESTING_THEME` (`backgroundColor: '#000000'`, `foregroundColor: '#1DB954'`, `isBeatPulse: false`, `intervalMs: 0`, `equalizerBars: Array(16).fill(15)`) when `isPlaying` is `false`. When `isPlaying` is `true`, selects a color from `BEATS_PALETTE` using `randomFn`, sets `isBeatPulse` to `tickCount % 2 === 0`, computes `intervalMs` via `calculateBeatIntervalMs(bpm)`, and generates 16 dynamic `equalizerBars` via `generateEqualizerBars`.
    - **Function `applyThemeToDocument`:**
      - **File Path:** `src/utils/beatVisualizer.js`
      - **Inputs:** `visualState` (`VisualThemeState`)
      - **Outputs:** `void`
      - **Side Effects:** Updates `document.documentElement.style` custom properties (`--bg-color`, `--fg-color`, `--beat-scale`, `--beat-glow`) so every word, border, and equalizer bar shifts color and pulses in unison.
  - **`[SDD-REQ-04]` Static Configuration & Fallback Catalog (`src/data/fallbackCatalog.js`):**
    - **Module Exports:** `TIME_RANGE_OPTIONS` (`Array<TimeRangeOption>`), `DEFAULT_EMBED_PLAYLIST_ID` (`string`)
    - **File Path:** `src/data/fallbackCatalog.js`
    - **Inputs:** None
    - **Outputs:** Immutable configuration constants with isolated property schemas.
    - **Side Effects:** None.
  - **`[SDD-REQ-05]` Live Application Shell & Routing (`src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/pages/NotFound.jsx`, `src/App.jsx`):**
    - **Components:** `Navbar`, `Footer`, `NotFound`, `App`
    - **File Paths:** `src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/pages/NotFound.jsx`, `src/App.jsx`
    - **Inputs:** `Navbar` accepts `{ foregroundColor: string, isBeatPulse: boolean }`; `Footer` accepts `{ activePlaylistId: string, foregroundColor: string, isBeatPulse: boolean }`; `NotFound` and `App` accept no required props.
    - **Outputs:** Rendered React elements (`JSX.Element`) providing persistent navigation, footer metadata, `/` route to `Dashboard`, and `*` catch-all route to `NotFound` with reactive text and border styling.
    - **Side Effects:** None.
  - **`[SDD-REQ-06]` Graphic Equalizer, Track Cards, Embedded Player & Dashboard Controller (`src/components/GraphicEqualizer.jsx`, `src/components/TrackCard.jsx`, `src/components/EmbedPlayer.jsx`, `src/pages/Dashboard.jsx`):**
    - **Components:** `GraphicEqualizer`, `TrackCard`, `EmbedPlayer`, `Dashboard`
    - **File Paths:** `src/components/GraphicEqualizer.jsx`, `src/components/TrackCard.jsx`, `src/components/EmbedPlayer.jsx`, `src/pages/Dashboard.jsx`
    - **Inputs:** `GraphicEqualizer` accepts `{ bars: Array<number>, foregroundColor: string, isBeatPulse: boolean, isPlaying: boolean }`; `TrackCard` accepts `{ track: TrackItem, foregroundColor: string, isBeatPulse: boolean }`; `EmbedPlayer` accepts `{ playlistId: string, isPlaying: boolean, onTogglePlay: () => void, foregroundColor: string, isBeatPulse: boolean }`; `Dashboard` accepts `{ initialToken?: string, initialBpm?: number | null }`.
    - **Outputs:** Rendered React dashboard (`JSX.Element`) integrating top-track retrieval (`limit=50`), time-range switching, playlist creation, 16-band beat-reactive graphic equalizer, global beat-reactive text/border/glow styling on `#000000` canvas, and all 4 failure-matrix UI fallbacks.
    - **Side Effects:** Triggers `getTopTracks` and `createPlaylistWithTracks` network calls, synchronizes document CSS variables via `applyThemeToDocument`, and manages beat-interval timers during active playback.

## 2. Test-Driven Development (TDD)

*The validation criteria that must pass before the SDD logic is considered complete.*

- **Success Conditions:**
  - `getTopTracks` requests `v1/me/top/tracks?time_range=long_term&limit=50` with the `Bearer` header and returns parsed track items.
  - `createPlaylistWithTracks` creates a private playlist (`public: false`) via `POST v1/me/playlists` and appends track URIs via `POST v1/playlists/${id}/items?uris=...`.
  - `computeNextVisualState`, `generateEqualizerBars`, and `applyThemeToDocument` enforce `#000000` background, `#1DB954` foreground, and 16 resting equalizer bars (`15%`) when `isPlaying` is `false`, and cycle foreground colors from `BEATS_PALETTE` with dynamic 16-bar equalizer heights (`> 15%`) and `isBeatPulse` toggling at exact BPM intervals (`60000 / bpm`) when `isPlaying` is `true`.
  - `Dashboard` renders fetched tracks, mounts the 16-band `GraphicEqualizer`, switches time ranges, saves tracks to a playlist, updates the Spotify Embed iframe URL (`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`), and transitions all foreground words, borders, and equalizer bars when playback starts.

- **Failure Conditions & Edge Cases:**
  - **Expired or Missing OAuth Token (`401 Unauthorized`):** `fetchWebApi` throws `Error('AUTH_EXPIRED')`; `Dashboard` resets visual theme and equalizer bars to `#1DB954` (`15%`) and renders the `"Reconnect Spotify (PKCE)"` fallback button.
  - **Network Timeout or Rate Limit (`429 Too Many Requests` / Network Failure):** `fetchWebApi` throws `Error('RATE_LIMITED')`; `Dashboard` preserves existing tracks, pauses beat color transitions and graphic equalizer movement, and displays the `"Retry Request"` banner.
  - **Empty Track List (`0` items returned):** `getTopTracks` returns `[]`; `createPlaylistWithTracks` throws `Error('EMPTY_TRACKS')` if called with `[]`; `Dashboard` renders the empty-state prompt and disables the `"Save to Playlist"` button.
  - **Beat/Tempo Sync Metadata Unavailable (`bpm` is `null` or `undefined`):** `calculateBeatIntervalMs(null)` returns `500` (120 BPM fallback) so `computeNextVisualState` and `generateEqualizerBars` continue pulsing and bouncing smoothly at 500ms intervals.

- **Test Suite Routing:**
  - `__tests__/spotifyApi.test.js` -> Validates `[SDD-REQ-01]` and `[SDD-REQ-02]` (`fetchWebApi`, `getTopTracks`, `createPlaylistWithTracks`, `401`, `429`, and empty-track guards).
  - `__tests__/beatVisualizer.test.js` -> Validates `[SDD-REQ-03]` (`RESTING_THEME`, `calculateBeatIntervalMs`, `generateEqualizerBars`, `computeNextVisualState`, `applyThemeToDocument`, and 120 BPM / `500ms` fallback).
  - `__tests__/Dashboard.test.jsx` -> Validates `[SDD-REQ-04]`, `[SDD-REQ-05]`, and `[SDD-REQ-06]` using Jest and React Testing Library (`Navbar`, `Footer`, `NotFound`, `GraphicEqualizer`, `TrackCard`, `EmbedPlayer`, `Dashboard` catalog rendering, playlist creation, global beat-reactive text/border/equalizer transitions, and all 4 failure-matrix UI states).

## 3. Learn-Driven Development (LDD)

*The underlying computer science principles and architectural reasoning.*

- **The "Why":**
  - **Pure Vector Generation for Graphic Equalizer Bars:** Computing the 16-element `equalizerBars` height array inside `generateEqualizerBars` using an injectable `randomFn` and beat-pulse multiplier keeps rendering deterministic for unit testing while giving the UI smooth, GPU-friendly height/color transitions on every beat tick.
  - **Centralized API Gateway (`fetchWebApi`):** Routing all Spotify Web API calls through a single asynchronous wrapper guarantees consistent `Authorization: Bearer` header injection and uniform HTTP `401` / `429` error classification without duplicating `try/catch` boilerplate across UI components.
  - **Intact Screen Shell Ordering:** Building the static data schema (`fallbackCatalog.js`) and Live Application Shell (`Navbar`, `Footer`, `NotFound`, `App`) prior to feature views ensures the browser render tree never crashes on unresolved routes or unmounted layout wrappers.

- **Instructional Guidance:**
  - `// Step 1: [SDD-REQ-01] Implement fetchWebApi(endpoint, method, body, token) in src/utils/spotifyApi.js to send authorized requests to https://api.spotify.com/, throwing Error('AUTH_EXPIRED') on 401 and Error('RATE_LIMITED') on 429 or network error.` (Verified by `__tests__/spotifyApi.test.js`)
  - `// Step 2: [SDD-REQ-01] Implement getTopTracks(token, timeRange = 'long_term', limit = 50) in src/utils/spotifyApi.js to query v1/me/top/tracks and return response.items or an empty array.` (Verified by `__tests__/spotifyApi.test.js`)
  - `// Step 3: [SDD-REQ-02] Implement createPlaylistWithTracks(token, tracksUri, name) in src/utils/spotifyApi.js to guard against empty tracksUri, POST a private playlist to v1/me/playlists, and POST track URIs to v1/playlists/{id}/items.` (Verified by `__tests__/spotifyApi.test.js`)
  - `// Step 4: [SDD-REQ-03] Implement calculateBeatIntervalMs(bpm), generateEqualizerBars(isPlaying, isBeatPulse, randomFn, barCount), computeNextVisualState({ isPlaying, bpm, tickCount, randomFn }), and applyThemeToDocument(visualState) in src/utils/beatVisualizer.js.` (Verified by `__tests__/beatVisualizer.test.js`)
  - `// Step 5: [SDD-REQ-04] Export TIME_RANGE_OPTIONS and DEFAULT_EMBED_PLAYLIST_ID constants from src/data/fallbackCatalog.js using isolated schema keys.` (Verified by `__tests__/Dashboard.test.jsx`)
  - `// Step 6: [SDD-REQ-05] Implement Navbar.jsx, Footer.jsx, NotFound.jsx, and App.jsx route table ('/' -> Dashboard, '*' -> NotFound) with foreground color and border bindings to establish the intact application shell.` (Verified by `__tests__/Dashboard.test.jsx`)
  - `// Step 7: [SDD-REQ-06] Implement GraphicEqualizer.jsx, TrackCard.jsx, and EmbedPlayer.jsx child components to bind all equalizer bars, text, borders, and beat-pulse transforms to foregroundColor and isBeatPulse.` (Verified by `__tests__/Dashboard.test.jsx`)
  - `// Step 8: [SDD-REQ-06] Implement Dashboard.jsx to orchestrate top-track loading (limit=50), time-range filtering, playlist creation, the 16-band graphic equalizer display, global beat-reactive text/border intervals, and the 401/429/Empty/BPM fallback states.` (Verified by `__tests__/Dashboard.test.jsx`)

- **Pipeline Handoff:** Conclude cleanly so `av-plan-orchestra` proceeds to Artifact 4 (`04-architectural-diagram.md`).
