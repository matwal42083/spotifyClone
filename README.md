# Spotify Clone

A personal React project exploring how to shape Spotify-inspired music discovery into a polished, interactive dashboard. The goal is to grow this into a portfolio-quality product and demonstrate thoughtful frontend engineering, reliable API integration, and a refined user experience.

> [!IMPORTANT]
> **Project status: early scaffold.** The current application is still the default React + Vite starter screen. Spotify sign-in, music browsing, playback, playlists, and visualizer features described below are planned—not implemented or production-ready yet. This README separates the product direction from what the repository can do today.

## Product direction

The planned experience is a dark, responsive music dashboard with Spotify-green accents and playback-reactive visuals. The project is intended to explore:

- Spotify account authorization using OAuth 2.0 Authorization Code with PKCE.
- Browsing top tracks and playlists, with search and useful empty and error states.
- A persistent playback experience using Spotify's supported embed or playback options.
- A beat-reactive theme and animated equalizer that degrades gracefully when track analysis data is unavailable.
- Maintainable component boundaries, accessible controls, and focused automated tests as the feature set develops.

These are goals, not a list of working features. Spotify API access and playback may also depend on Spotify account eligibility, app configuration, and current platform policies.

## Current implementation

- React 18 and Vite application scaffold.
- ESLint configuration and npm scripts for local development, production builds, and linting.
- No Spotify credentials, authentication flow, API integration, dashboard, or tests are implemented yet.

## Run locally

**Requirements:** Node.js and npm.

```bash
git clone https://github.com/matwal42083/spotifyClone.git
cd spotifyClone
npm install
npm run dev
```

To check the current scaffold:

```bash
npm run lint
npm run build
```

## Technology

**In use:** React, Vite, JavaScript, and ESLint.

**Planned:** Spotify Web API integration, PKCE authentication, playback UI, and the beat-reactive visualizer. Planned technology is subject to change as implementation and Spotify's platform requirements are validated.

## Preview

A product screenshot will be added once the dashboard UI exists. For now, the running app displays the unmodified Vite starter screen.

## Feedback

This is an independently built portfolio experiment. Feedback that helps improve the product direction, accessibility, interface design, or implementation approach is welcome.

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Spotify. Spotify and its related marks are the property of Spotify AB. Any future integration will follow Spotify's developer terms and branding requirements.