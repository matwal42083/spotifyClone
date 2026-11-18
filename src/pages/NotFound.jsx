import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
      <>
      <main data-testid="not-found-page" style={{
        backgroundColor:"#000000", color:"1DB954",
        border: '2px solid #1DB954',
      }}>
        <h1>404 - Page Not Found</h1>
        <p>The requested Spotify Clone route does not exist.</p>
        <Link to="/" style={{ color: '#1DB954' }}>Home</Link>
      </main>
      
      </>
    )

    // Step 6n: Open a <main data-testid="not-found-page" style={{ backgroundColor: '#000000', color: '#1DB954', border: '2px solid #1DB954' }}> tag

      // Step 6o: Render an <h1>404 - Page Not Found</h1> heading element

      // Step 6p: Render a <p>The requested Spotify Clone route does not exist.</p> paragraph element

      // Step 6q: Render a <Link to="/" style={{ color: '#1DB954' }}>Return to Dashboard</Link> router link element

    // Step 6r: Close the </main> tag


}

// LIVE HMR CHECK: Visit an unmatched URL path in the browser to verify the 404 fallback renders intact!
// NEXT STEP: Open src/App.jsx
