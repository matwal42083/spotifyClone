import React from 'react';

/**
 * Spotify-style track row with independent mixed concert-light color accents per card.
 */
export default function TrackCard({
  track,
  index = 0,
  foregroundColor = '#1DB954',
  accentColor,
  isBeatPulse = false,
  isPlaying = false,
}) {
  const artistNames = Array.isArray(track?.artists)
    ? track.artists.map((artist) => artist.name).join(', ')
    : 'Unknown Artist';

  const cardColor = isPlaying ? accentColor || foregroundColor : '#1DB954';

  return (
    <li
      data-testid={`track-card-${track?.id || 'unknown'}`}
      className={`spotify-track-row ${isPlaying ? 'is-concert-live' : ''}`}
      style={{
        backgroundColor: '#121212',
        color: cardColor,
        border: `1px solid ${isPlaying ? cardColor : '#282828'}`,
        boxShadow: isPlaying && isBeatPulse ? `0 0 14px ${cardColor}` : 'none',
        transform: isPlaying && isBeatPulse ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      <span className="track-index" style={{ color: cardColor }}>
        {index + 1}
      </span>
      <span
        className="track-art-badge"
        aria-hidden="true"
        style={{
          borderColor: cardColor,
          color: cardColor,
        }}
      >
        ♫
      </span>
      <span className="track-title-text" style={{ color: cardColor }}>
        {`${track?.name} by ${artistNames}`}
      </span>
    </li>
  );
}
