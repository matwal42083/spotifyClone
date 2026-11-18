import React from 'react';

export default function TrackCard({
  track,
  foregroundColor = '#1DB954',
  isBeatPulse = false,
}) {
  // Step 7j: Write const artistNames = Array.isArray(track?.artists) ? track.artists.map((artist) => artist.name).join(', ') : 'Unknown Artist';

  // Step 7k: Write return (

    // Step 7l: Open a <li data-testid={`track-card-${track?.id || 'unknown'}`} style={{ backgroundColor: '#000000', color: foregroundColor, border: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 14px ${foregroundColor}` : 'none', transform: isBeatPulse ? 'scale(1.02)' : 'scale(1)' }}> tag

      // Step 7m: Render <span style={{ color: foregroundColor }}>{`${track?.name} by ${artistNames}`}</span>

    // Step 7n: Close the </li> tag

  // Step 7o: Close the return statement with );

  // (Remove temporary return null; below once you write Step 7j–7o)
  return null;
}

// LIVE HMR CHECK: Save and confirm zero Vite compile errors.
// NEXT STEP: Open src/components/EmbedPlayer.jsx
