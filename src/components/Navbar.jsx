import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Modern Spotify inverted top navigation bar:
 * Left brand mark, centered circular Home button + pill Search bar, right status controls.
 */
export default function Navbar({
  foregroundColor = '#1DB954',
  isBeatPulse = false,
  searchQuery = '',
  onSearchChange,
  bpm = 128,
  isPlaying = false,
}) {
  return (
    <header
      data-testid="navbar"
      className={`spotify-navbar ${isPlaying ? 'is-concert-live' : ''}`}
      style={{
        backgroundColor: '#000000',
        color: foregroundColor,
        borderBottom: '1px solid var(--concert-border, #1DB954)',
        boxShadow: 'var(--concert-shadow, none)',
      }}
    >
      <div className="navbar-left">
        <Link to="/" className="spotify-brand-mark" aria-label="Spotify Clone Home">
          <span className="brand-dot" aria-hidden="true">●</span>
          <span>Spotify Clone</span>
        </Link>
      </div>

      <nav className="navbar-center" aria-label="Primary Navigation">
        <Link
          to="/"
          className="home-circle-btn"
          title="Home"
          aria-label="Home"
        >
          ⌂
        </Link>
        <div className="spotify-search-pill">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="What do you want to play?"
            aria-label="Search tracks"
          />
        </div>
      </nav>

      <div className="navbar-right">
        <span className="bpm-pill">
          {isPlaying ? `LIVE • ${bpm} BPM` : `RESTING • ${bpm} BPM`}
        </span>
        <span className="profile-circle" aria-label="User Profile">
          M
        </span>
      </div>
    </header>
  );
}
