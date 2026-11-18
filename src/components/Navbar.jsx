import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ foregroundColor = '#1DB954', isBeatPulse = false }) {
  // Write return (
  return (
       <>
       {/* Open a <header data-testid="navbar" style={{ backgroundColor: '#000000', color: foregroundColor, borderBottom: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 12px ${foregroundColor}` : 'none', transform: isBeatPulse ? 'scale(1.01)' : 'scale(1)' }}> tag */}
       <header data-testid="navbar" style={{ backgroundColor: '#000000', color: foregroundColor, borderBottom: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 12px ${foregroundColor}` : 'none', transform: isBeatPulse ? 'scale(1.01)' : 'scale(1)'}}>
        {/* Open a <nav> tag */}
        <nav>
          {/* Render <Link to="/" style={{ color: foregroundColor, borderColor: foregroundColor }}>Spotify Clone</Link> */}
          <Link to="/" style={{ color: foregroundColor, borderColor: foregroundColor}}>Spotify Clone</Link>
        {/* Close the </nav> tag */}
        </nav>
       {/* Close the </header> tag */}
       </header>
       </>
  );
}

// LIVE HMR CHECK: Save and confirm the top navigation bar renders in Spotify Green on pure black.
// NEXT STEP: Open src/components/Footer.jsx
