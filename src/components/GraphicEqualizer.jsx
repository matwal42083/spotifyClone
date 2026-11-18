import React from 'react';
import { DEFAULT_BAR_COUNT } from '../utils/beatVisualizer';

export default function GraphicEqualizer({
  bars = Array(DEFAULT_BAR_COUNT).fill(15),
  foregroundColor = '#1DB954',
  isBeatPulse = false,
  isPlaying = false,
}) {
  // Step 7a: Write return (

    // Step 7b: Open a <section aria-label="Graphic Equalizer" data-testid="graphic-equalizer" style={{ backgroundColor: '#000000', color: foregroundColor, border: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 16px ${foregroundColor}` : 'none' }}> tag

      // Step 7c: Open a <div data-testid="equalizer-bars-container" style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '4px' }}> tag

        // Step 7d: Write {bars.map((heightPct, idx) => (

          // Step 7e: Render a self-closing <div key={`eq-bar-${idx}`} data-testid={`eq-bar-${idx}`} data-playing={isPlaying ? 'true' : 'false'} style={{ flex: 1, height: `${heightPct}%`, backgroundColor: foregroundColor, border: `1px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 10px ${foregroundColor}` : 'none', transition: 'height 150ms ease, background-color 150ms ease' }} />

        // Step 7f: Close the map callback with ))}

      // Step 7g: Close the </div> tag

    // Step 7h: Close the </section> tag

  // Step 7i: Close the return statement with );

  // (Remove temporary return null; below once you write Step 7a–7i)
  return null;
}

// LIVE HMR CHECK: Save and confirm zero Vite compile errors.
// NEXT STEP: Open src/components/TrackCard.jsx
