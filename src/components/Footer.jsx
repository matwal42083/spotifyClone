import React from 'react';

/**
 * Fixed bottom Spotify status bar displaying active playlist and concert-light state.
 */
export default function Footer({
  activePlaylistId = '2iFnYqiudxwGD3MGCxu2im',
  foregroundColor = '#1DB954',
  isBeatPulse = false,
}) {
  return (
    <footer
      data-testid="footer"
      className="spotify-footer"
      style={{
        backgroundColor: '#000000',
        color: foregroundColor,
        borderTop: '1px solid var(--concert-border, #1DB954)',
        boxShadow: 'var(--concert-shadow, none)',
      }}
    >
      <p style={{ color: 'var(--concert-secondary, #1DB954)' }}>
        Active Embed Playlist: {activePlaylistId}
      </p>
    </footer>
  );
}
