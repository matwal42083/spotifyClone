# Spotify Clone

A React and Vite project exploring a Spotify-inspired music dashboard with playlist navigation, an embedded player, top-track discovery, and beat-reactive visuals.

> [!IMPORTANT]
> The dashboard and visualizer are implemented, but Spotify sign-in is not. The dashboard currently uses a placeholder token; Spotify Web API requests that require a valid access token will not work until an authentication flow is added.

## Current features

- Responsive Spotify-inspired dashboard with playlist navigation and search.
- Spotify Embed player for the selected playlist.
- Spotify Web API helpers for top-track discovery and private playlist creation; these require a valid access token.
- Beat-synchronized theme and equalizer visuals, plus optional live audio analysis where supported by the browser.
- Focused Jest tests for the API helpers, visualizer, and dashboard.

## Run locally

**Requirements:** Node.js and npm.

```bash
git clone https://github.com/matwal42083/spotifyClone.git
cd spotifyClone
npm install
npm run dev
```

Run the tests and production build with:

```bash
npm test -- --watchAll=false
npm run build
```

## Spotify API setup

The API client in `src/utils/spotifyApi.js` accepts an access token, but the app does not yet implement OAuth or obtain one. Do not commit credentials or tokens. Add a Spotify Authorization Code with PKCE flow before relying on account-backed API features.

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Spotify. Spotify and its related marks are the property of Spotify AB. Any future integration must follow Spotify's developer terms and branding requirements.
