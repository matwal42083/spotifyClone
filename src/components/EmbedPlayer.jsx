import React, { useEffect, useRef } from 'react';

/**
 * Embedded Spotify playlist player with automatic Spotify Embed playback_update
 * play/pause sync, manual beat-sync toggle, and BPM / Tap-Tempo speed matching.
 */
export default function EmbedPlayer({
  playlistId = '2iFnYqiudxwGD3MGCxu2im',
  isPlaying = false,
  isLiveAudio = false,
  liveAudioError = '',
  onTogglePlay,
  onToggleLiveAudio,
  onPlaybackStateChange,
  bpm = 128,
  onBpmChange,
  foregroundColor = '#1DB954',
  secondaryColor = '#1DB954',
  isBeatPulse = false,
}) {
  const tapTimesRef = useRef([]);

  // Listen to Spotify Embed iframe playback_update postMessages so play/pause auto-syncs
  useEffect(() => {
    const handleEmbedMessage = (event) => {
      if (!event?.data || typeof event.data !== 'object') {
        return;
      }
      if (
        event.origin &&
        event.origin !== 'https://open.spotify.com' &&
        event.origin !== window.location.origin
      ) {
        return;
      }
      if (event.data.type === 'playback_update' && event.data.payload) {
        const paused = Boolean(event.data.payload.isPaused);
        if (onPlaybackStateChange) {
          onPlaybackStateChange(!paused, event.data.payload);
        }
      }
    };

    window.addEventListener('message', handleEmbedMessage);
    return () => window.removeEventListener('message', handleEmbedMessage);
  }, [onPlaybackStateChange]);

  // Tap-tempo calculator so the user can lock the concert lights to any song's exact beat
  const handleTapTempo = () => {
    if (!onBpmChange) return;
    const now = Date.now();
    const recent = tapTimesRef.current.filter((t) => now - t < 2500);
    recent.push(now);
    tapTimesRef.current = recent.slice(-5);

    if (recent.length >= 2) {
      let sum = 0;
      for (let i = 1; i < recent.length; i += 1) {
        sum += recent[i] - recent[i - 1];
      }
      const avgMs = sum / (recent.length - 1);
      const calculatedBpm = Math.max(60, Math.min(200, Math.round(60000 / avgMs)));
      onBpmChange(calculatedBpm);
    }
  };

  const activeBorder = isPlaying ? secondaryColor : '#282828';

  return (
    <section
      data-testid="embed-player-section"
      className="embed-player-card"
      style={{
        backgroundColor: '#121212',
        color: foregroundColor,
        border: `2px solid ${activeBorder}`,
        boxShadow: isPlaying ? 'var(--concert-shadow-alt, none)' : 'none',
      }}
    >
      <div className="embed-controls-bar">
        <div className="embed-primary-actions">
          {onToggleLiveAudio && (
            <button
              type="button"
              className="live-audio-btn"
              onClick={onToggleLiveAudio}
              style={{
                backgroundColor: isLiveAudio ? secondaryColor : '#000000',
                color: isLiveAudio ? '#000000' : secondaryColor,
                border: `2px solid ${secondaryColor}`,
                boxShadow: isLiveAudio ? `0 0 14px ${secondaryColor}` : 'none',
              }}
            >
              {isLiveAudio ? 'Stop Live Audio Sync' : 'Sync to Live Audio'}
            </button>
          )}
          <button
            type="button"
            className="beat-sync-btn"
            onClick={onTogglePlay}
            style={{
              backgroundColor: isPlaying ? foregroundColor : '#1DB954',
              color: '#000000',
              border: `2px solid ${foregroundColor}`,
              transform: isPlaying && isBeatPulse ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            {isPlaying ? 'Pause Beat Sync' : 'Start Beat Sync'}
          </button>
        </div>

        {onBpmChange && !isLiveAudio && (
          <div className="bpm-controls">
            <label htmlFor="bpm-slider" style={{ color: secondaryColor }}>
              Speed: {bpm} BPM
            </label>
            <input
              id="bpm-slider"
              type="range"
              min="60"
              max="190"
              value={bpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              aria-label="Beat speed BPM"
            />
            <button
              type="button"
              className="tap-tempo-btn"
              onClick={handleTapTempo}
              style={{
                borderColor: secondaryColor,
                color: secondaryColor,
              }}
            >
              Tap Beat
            </button>
          </div>
        )}
      </div>
      {liveAudioError && (
        <p className="live-audio-hint" style={{ color: secondaryColor, margin: 0, fontSize: '0.82rem' }}>
          {liveAudioError}
        </p>
      )}

      <iframe
        title="Spotify Embed: Recommendation Playlist"
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
        width="100%"
        height="100%"
        className="spotify-embed-iframe"
        style={{
          display: 'block',
          width: '100%',
          flex: 1,
          minHeight: '480px',
          backgroundColor: '#121212',
          colorScheme: 'dark',
          borderRadius: '12px',
          border: `1px solid ${activeBorder}`,
        }}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </section>
  );
}
