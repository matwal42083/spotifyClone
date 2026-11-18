# Artifact 2: Project Walkthrough

## 1. GitHub & Version Control Foundation

> [!NOTE]
> Establish the repository state before scaffolding logic.

- **`.gitignore` Standard:**
  - `node_modules/`
  - `dist/`
  - `.env`
  - `.env.local`
  - `coverage/`
  - `.DS_Store`
- **Remote Origin:** `https://github.com/<YOUR_GITHUB_USERNAME>/spotifyClone.git`
- **8-Pillar Governance & Security Clearance (`Dignity & Privacy Cleared`):**
  - **Data Vectors:** Spotify OAuth 2.0 Client ID (`VITE_SPOTIFY_CLIENT_ID`), PKCE ephemeral session tokens, user top track metadata, and private playlist IDs.
  - **Security Mechanics:** Client IDs are isolated in `.env` (excluded via `.gitignore`). OAuth Bearer tokens reside strictly in ephemeral browser memory/`sessionStorage`, are never logged in plain text, and are purged immediately upon `401 Unauthorized` or session termination. All created playlists default to `public: false` to protect user listening privacy.

## 2. Dependencies & Packages

> [!NOTE]
> The following tools are required for this build.

- **Core Environment:** Node.js (v20+ LTS), Vite (`vite`, `@vitejs/plugin-react`), React 18 (`react`, `react-dom`), React Router (`react-router-dom`)
- **Testing Suite:** Jest (`jest`, `jest-environment-jsdom`), React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`), Babel (`@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `babel-jest`, `identity-obj-proxy`)
- **Additional Libraries:** Native Browser Fetch API (`window.fetch`), Spotify Embed Iframe API (`open.spotify.com/embed`)

## 3. Terminal Execution Commands

Run the following commands in the WSL terminal to initialize the environment:

```bash
# 1. Initialize Version Control
git init
printf "node_modules/\ndist/\n.env\n.env.local\ncoverage/\n.DS_Store\n" > .gitignore
git add .
git commit -m "chore: initial project scaffolding"
git branch -M main
# git remote add origin <YOUR_GITHUB_URL>
# git push -u origin main
```

### 2. Initialize project & install testing dependencies

```bash
# Scaffold React + Vite application in root directory
npm create vite@latest . -- --template react

# Install runtime routing dependencies
npm install react-router-dom

# Install Mandatory Jest + React Testing Library TDD Suite
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @babel/core @babel/preset-env @babel/preset-react babel-jest identity-obj-proxy

# Scaffold source and test directories
mkdir -p src/utils src/data src/components src/pages __tests__
```

## 4. Scaffolding Order

> [!IMPORTANT]
> Execute these setup steps in this exact sequence to prevent configuration conflicts.

- Initialize Git repository and `.gitignore`.
- Run Vite React package manager initialization (`npm create vite@latest . -- --template react`).
- Install runtime (`react-router-dom`) and Jest/RTL testing dependencies via the terminal commands above.
- Scaffold core directory structure (`src/utils`, `src/data`, `src/components`, `src/pages`, `__tests__`).
- Commit clean environment to GitHub.
