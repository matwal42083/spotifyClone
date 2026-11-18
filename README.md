# Spotify Clone Beat-Reactive Dashboard

A custom Spotify Web API dashboard built with React 18, Vite, and React Router (`react-router-dom`) featuring OAuth 2.0 PKCE token integration, extended top-track discovery (`limit=50` across `short_term`, `medium_term`, and `long_term`), one-click private playlist creation, an integrated Spotify Embed player, and a 16-band **Beat-Reactive Graphic Equalizer & Visual Theme Engine**.

---

## 1. Architectural Overview

At rest, the application renders a pure pitch-black (`#000000`) canvas with classic Spotify Green (`#1DB954`) typography, borders, controls, and 16 resting graphic equalizer bars (`15%` baseline height). When playback beat synchronization starts (`isPlaying = true`), the visual engine (`src/utils/beatVisualizer.js`) calculates the beat interval from the active track's tempo (`60000 / bpm` ms, with an automatic `500ms` / 120 BPM fallback) and dynamically transitions every foreground word, border, button, CSS variable (`--fg-color`, `--beat-scale`, `--beat-glow`), and the 16 equalizer bars (`src/components/GraphicEqualizer.jsx`) across randomized neon beat palettes in sync with the rhythm.

### Core Modules & Components

| Path | Responsibility | SDD Requirement |
| :--- | :--- | :--- |
| `src/utils/spotifyApi.js` | Centralized `fetchWebApi` client, `getTopTracks` (`limit=50`), and `createPlaylistWithTracks` (`public: false`) with `401 AUTH_EXPIRED`, `429 RATE_LIMITED`, and `EMPTY_TRACKS` guards. | `[SDD-REQ-01]`, `[SDD-REQ-02]` |
| `src/utils/beatVisualizer.js` | Pure beat-interval calculator (`calculateBeatIntervalMs`), 16-band equalizer generator (`generateEqualizerBars`), visual state reducer (`computeNextVisualState`), and root CSS variable synchronizer (`applyThemeToDocument`). | `[SDD-REQ-03]` |
| `src/data/fallbackCatalog.js` | Immutable `TIME_RANGE_OPTIONS` and `DEFAULT_EMBED_PLAYLIST_ID` constants. | `[SDD-REQ-04]` |
| `src/components/Navbar.jsx` | Persistent top navigation bar with beat-reactive foreground color, border, and scale pulse. | `[SDD-REQ-05]` |
| `src/components/Footer.jsx` | Persistent footer displaying the active embedded Spotify playlist ID. | `[SDD-REQ-05]` |
| `src/pages/NotFound.jsx` | 404 fallback screen for unknown routes (`*`). | `[SDD-REQ-05]` |
| `src/components/GraphicEqualizer.jsx` | 16-band vertical frequency bar visualizer (`eq-bar-0` through `eq-bar-15`) that bounces and shifts color on every beat tick. | `[SDD-REQ-06]` |
| `src/components/TrackCard.jsx` | Individual top-track list item (`{track.name} by {artists}`) with beat-synchronized border glow and scale. | `[SDD-REQ-06]` |
| `src/components/EmbedPlayer.jsx` | Beat sync toggle controller and responsive Spotify Embed iframe (`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`). | `[SDD-REQ-06]` |
| `src/pages/Dashboard.jsx` | Stateful orchestrator managing top-track fetching, time-range filtering, playlist creation, beat interval timers, and all 4 failure-matrix fallbacks. | `[SDD-REQ-06]` |

---

## 2. Failure & Edge-Case Matrix

| Scenario | Trigger | System & UI Fallback |
| :--- | :--- | :--- |
| **Expired/Missing OAuth Token (`401`)** | `fetchWebApi` throws `Error('AUTH_EXPIRED')` | Clears token, halts playback, resets theme & equalizer bars to `#1DB954` (`15%`), and renders `"Reconnect Spotify (PKCE)"` alert banner (`data-testid="auth-error-banner"`). |
| **Rate Limit / Network Error (`429`)** | `fetchWebApi` throws `Error('RATE_LIMITED')` | Preserves cached tracks, pauses beat visualizer, resets theme to `#1DB954`, and renders `"Retry Request"` alert banner (`data-testid="rate-limit-banner"`). |
| **Empty Track Catalog (`0` items)** | `getTopTracks` returns `[]` | Renders `data-testid="empty-tracks-state"` card and disables `"Save to Playlist"`. `createPlaylistWithTracks` throws `Error('EMPTY_TRACKS')` if called with `[]`. |
| **Missing BPM Metadata** | `bpm` is `null`, `undefined`, or `<= 0` | `calculateBeatIntervalMs` falls back to `500ms` (120 BPM) so color cycling and equalizer bar bounce continue smoothly. |

---

## 3. Setup & Development Commands

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run full Jest + React Testing Library test suite (non-blocking)
npx jest --watchAll=false

# Run individual test suites
npx jest __tests__/spotifyApi.test.js --watchAll=false
npx jest __tests__/beatVisualizer.test.js --watchAll=false
npx jest __tests__/Dashboard.test.jsx --watchAll=false

# Production build
npm run build
```

---

## 4. Security & Privacy Governance

- **PKCE & Credential Isolation:** Spotify Client IDs belong strictly in `.env` (`VITE_SPOTIFY_CLIENT_ID`, ignored by Git). OAuth Bearer tokens are kept in ephemeral state and cleared immediately upon `401 Unauthorized`.
- **Private Playlist Default:** All playlists generated via `createPlaylistWithTracks` enforce `public: false` by default.
