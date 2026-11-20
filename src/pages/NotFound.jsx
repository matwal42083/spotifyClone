import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 fallback page for unmatched application routes.
 */
export default function NotFound() {
  return (
    <main
      data-testid="not-found-page"
      style={{
        backgroundColor: '#000000',
        color: '#1DB954',
        border: '2px solid #1DB954',
      }}
    >
      <h1>404 - Page Not Found</h1>
      <p>The requested Spotify Clone route does not exist.</p>
      <Link to="/" style={{ color: '#1DB954' }}>
        Home
      </Link>
    </main>
  );
}
