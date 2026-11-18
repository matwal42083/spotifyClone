import React from 'react';

export default function Footer({
  activePlaylistId = '2iFnYqiudxwGD3MGCxu2im',
  foregroundColor = '#1DB954',
  isBeatPulse = false,
}) {
   return (
    <>
    <footer data-testid="footer" style={{ backgroundColor: '#000000', color: foregroundColor, borderTop: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 12px ${foregroundColor}` : 'none' }}>
    <p style={{ color: foregroundColor }}>Active Embed Playlist: {activePlaylistId}</p>
    </footer>
    </>
   );

    // Step 6i: Open a <footer data-testid="footer" style={{ backgroundColor: '#000000', color: foregroundColor, borderTop: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 12px ${foregroundColor}` : 'none' }}> tag

      // Step 6j: Render <p style={{ color: foregroundColor }}>Active Embed Playlist: {activePlaylistId}</p>

    // Step 6k: Close the </footer> tag
}

// LIVE HMR CHECK: Save and confirm the footer renders with the active playlist ID.
// NEXT STEP: Open src/pages/NotFound.jsx
