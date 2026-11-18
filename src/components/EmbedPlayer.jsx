import React from "react";

export default function EmbedPlayer({
  playlistId = "2iFnYqiudxwGD3MGCxu2im",
  isPlaying = false,
  onTogglePlay,
  foregroundColor = "#1DB954",
  isBeatPulse = false,
}) {
  return (
  <>
   <section data-testid="embed-player-section" style={{backgroundColor:'#000000', color: foregroundColor, border: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 16px ${foregroundColor}` : 'none'}}>
   <button type="button" onClick={onTogglePlay} style={{backgroundColor: '#000000', color: foregroundColor, border: `2px solid ${foregroundColor}`, transform: isBeatPulse ? 'scale(1.03)' : 'scale(1)'}}>{isPlaying ? 'Pause Beat Sync' : 'Start Beat Sync'}</button>
   <iframe title="Spotify Embed: Recommendation Playlist" src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} width="100%" height="100%" style={{minHeight: '360px', border: `1px solid ${foregroundColor}`}} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"/>
   </section>
  </>

);

  // Step 7q: Open a <section data-testid="embed-player-section" style={{ backgroundColor: '#000000', color: foregroundColor, border: `2px solid ${foregroundColor}`, boxShadow: isBeatPulse ? `0 0 16px ${foregroundColor}` : 'none' }}> tag

  // Step 7r: Open a <button type="button" onClick={onTogglePlay} style={{ backgroundColor: '#000000', color: foregroundColor, border: `2px solid ${foregroundColor}`, transform: isBeatPulse ? 'scale(1.03)' : 'scale(1)' }}> tag

  // Step 7s: Render {isPlaying ? 'Pause Beat Sync' : 'Start Beat Sync'}



  // Step 7u: Render a self-closing <iframe title="Spotify Embed: Recommendation Playlist " src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} width="100%" height="100%" style={{ minHeight: '360px', border: `1px solid ${foregroundColor}` }} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />

}

// LIVE HMR CHECK: Save and confirm zero Vite compile errors.
// NEXT STEP: Open src/pages/Dashboard.jsx
