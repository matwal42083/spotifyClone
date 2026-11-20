import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTopTracks, createPlaylistWithTracks } from '../utils/spotifyApi';
import {
  RESTING_THEME,
  RESTING_CONCERT_COLORS,
  BEATS_PALETTE,
  computeNextVisualState,
  applyThemeToDocument,
} from '../utils/beatVisualizer';
import { startLiveAudioCapture } from '../utils/audioBeatDetector';
import {
  TIME_RANGE_OPTIONS,
  DEFAULT_EMBED_PLAYLIST_ID,
} from '../data/fallbackCatalog';
import GraphicEqualizer from '../components/GraphicEqualizer';
import TrackCard from '../components/TrackCard';
import EmbedPlayer from '../components/EmbedPlayer';
import HeroWaveDancer from '../components/HeroWaveDancer';

/**
 * Main Spotify dashboard orchestrating track fetching, playlist creation,
 * real-time Spotify Embed play/pause sync, mixed concert-light colors,
 * and 16-band graphic equalizer animation.
 */
export default function Dashboard({
  initialToken = 'pkce-session-token',
  initialBpm = 128,
  searchQuery = '',
  externalPlaylistId,
  onPlaylistChange,
  onSyncVisualMeta,
}) {
  const [token, setToken] = useState(initialToken);
  const [timeRange, setTimeRange] = useState('long_term');
  const [tracks, setTracks] = useState([]);
  const [activePlaylistId, setActivePlaylistId] = useState(
    externalPlaylistId || DEFAULT_EMBED_PLAYLIST_ID
  );
  const [bpm, setBpm] = useState(initialBpm || 128);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiveAudio, setIsLiveAudio] = useState(false);
  const [liveAudioError, setLiveAudioError] = useState('');
  const [visualState, setVisualState] = useState(RESTING_THEME);
  const [beatTick, setBeatTick] = useState(0);
  const [authError, setAuthError] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const liveCaptureRef = useRef(null);
  const liveBeatTickRef = useRef(0);
  const liveVisualRef = useRef(RESTING_THEME);
  const lastPulseAtRef = useRef(0);
  const silenceStartRef = useRef(null);

  // Sync sidebar playlist selections into the dashboard player
  useEffect(() => {
    if (externalPlaylistId) {
      setActivePlaylistId(externalPlaylistId);
    }
  }, [externalPlaylistId]);

  // Notify App shell of playback / BPM / visual updates for Navbar & Footer
  useEffect(() => {
    if (onSyncVisualMeta) {
      const activePrimary =
        (visualState.concertColors && visualState.concertColors.primary) ||
        visualState.foregroundColor;
      onSyncVisualMeta({
        isPlaying,
        bpm,
        foregroundColor: activePrimary,
        isBeatPulse: visualState.isBeatPulse,
        activePlaylistId,
      });
    }
  }, [
    isPlaying,
    bpm,
    visualState.foregroundColor,
    visualState.concertColors,
    visualState.isBeatPulse,
    activePlaylistId,
    onSyncVisualMeta,
  ]);

  // Fetch up to 50 top tracks and classify 401/429 failures into UI error banners
  const loadTracks = useCallback(async (activeToken, selectedRange) => {
    try {
      setRateLimitError(false);
      const items = await getTopTracks(activeToken, selectedRange, 50);
      setTracks(items);
      setAuthError(false);
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') {
        setAuthError(true);
        setToken('');
        setIsPlaying(false);
        setVisualState(RESTING_THEME);
        applyThemeToDocument(RESTING_THEME);
      } else {
        setRateLimitError(true);
        setIsPlaying(false);
        setVisualState(RESTING_THEME);
        applyThemeToDocument(RESTING_THEME);
      }
    }
  }, []);

  // Reload top tracks whenever the auth token or selected time range changes
  useEffect(() => {
    loadTracks(token, timeRange);
  }, [token, timeRange, loadTracks]);

  // Clean up live audio capture on unmount
  useEffect(() => {
    return () => {
      if (liveCaptureRef.current) {
        liveCaptureRef.current.stop();
        liveCaptureRef.current = null;
      }
    };
  }, []);

  // Run the BPM-synchronized timer loop only when NOT driven by real live FFT audio
  useEffect(() => {
    if (isLiveAudio) {
      return undefined;
    }
    if (!isPlaying) {
      setVisualState(RESTING_THEME);
      setBeatTick(0);
      applyThemeToDocument(RESTING_THEME);
      return undefined;
    }

    let tick = 0;
    const next = computeNextVisualState({
      isPlaying: true,
      bpm,
      tickCount: tick,
    });
    setVisualState(next);
    setBeatTick(tick);
    applyThemeToDocument(next);

    const timerId = setInterval(() => {
      tick += 1;
      const beatState = computeNextVisualState({
        isPlaying: true,
        bpm,
        tickCount: tick,
      });
      setVisualState(beatState);
      setBeatTick(tick);
      applyThemeToDocument(beatState);
    }, next.intervalMs);

    return () => clearInterval(timerId);
  }, [isPlaying, isLiveAudio, bpm]);

  // Start or stop real-time Web Audio FFT beat detection driven directly by tab audio
  const handleToggleLiveAudio = useCallback(async () => {
    setLiveAudioError('');
    if (isLiveAudio && liveCaptureRef.current) {
      liveCaptureRef.current.stop();
      liveCaptureRef.current = null;
      return;
    }

    const handle = await startLiveAudioCapture({
      onFrame: (frame) => {
        const now = Date.now();
        if (frame.isSilent) {
          if (silenceStartRef.current === null) {
            silenceStartRef.current = now;
          }
          if (now - silenceStartRef.current > 220) {
            liveVisualRef.current = RESTING_THEME;
            setIsPlaying(false);
            setVisualState(RESTING_THEME);
            applyThemeToDocument(RESTING_THEME);
          }
          return;
        }

        silenceStartRef.current = null;
        setIsPlaying(true);

        if (frame.isBeatHit || !liveVisualRef.current.intervalMs) {
          liveBeatTickRef.current += 1;
          const nextColors = computeNextVisualState({
            isPlaying: true,
            bpm,
            tickCount: liveBeatTickRef.current,
          });
          const beatDrivenState = {
            ...nextColors,
            isBeatPulse: true,
            equalizerBars: frame.bars,
            detailedBars: frame.detailedBars,
          };
          lastPulseAtRef.current = now;
          liveVisualRef.current = beatDrivenState;
          setBeatTick(liveBeatTickRef.current);
          setVisualState(beatDrivenState);
          applyThemeToDocument(beatDrivenState);
        } else {
          // Hold the beat glow flash for ~110ms, then snap OFF until the next beat hits
          const pulseStillActive = now - lastPulseAtRef.current < 110;
          const wasPulsing = liveVisualRef.current.isBeatPulse;
          const spectrumState = {
            ...liveVisualRef.current,
            isBeatPulse: pulseStillActive,
            equalizerBars: frame.bars,
            detailedBars: frame.detailedBars,
          };
          liveVisualRef.current = spectrumState;
          setVisualState(spectrumState);
          if (wasPulsing && !pulseStillActive) {
            applyThemeToDocument(spectrumState);
          }
        }
      },
      onStop: () => {
        setIsLiveAudio(false);
        setIsPlaying(false);
        setVisualState(RESTING_THEME);
        applyThemeToDocument(RESTING_THEME);
        liveCaptureRef.current = null;
      },
      onError: (msg) => {
        setLiveAudioError(msg);
        setIsLiveAudio(false);
      },
    });

    if (handle) {
      liveCaptureRef.current = handle;
      setIsLiveAudio(true);
    }
  }, [isLiveAudio, bpm]);

  // Automatically sync play/pause state from Spotify Embed playback_update events
  const handleEmbedPlaybackChange = useCallback((playing) => {
    setIsPlaying(playing);
  }, []);

  // Save the currently loaded tracks into a private Spotify playlist and update the embed
  const handleSavePlaylist = async () => {
    if (tracks.length === 0) {
      return;
    }

    try {
      const uris = tracks.map((t) => t.uri);
      const created = await createPlaylistWithTracks(
        token,
        uris,
        'My top tracks playlist'
      );
      if (created?.id) {
        setActivePlaylistId(created.id);
        if (onPlaylistChange) {
          onPlaylistChange(created.id);
        }
      }
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') {
        setAuthError(true);
        setIsPlaying(false);
        setVisualState(RESTING_THEME);
        applyThemeToDocument(RESTING_THEME);
      } else {
        setRateLimitError(true);
      }
    }
  };

  const concert = visualState.concertColors || RESTING_CONCERT_COLORS;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleTracks = normalizedQuery
    ? tracks.filter((t) => {
        const title = (t?.name || '').toLowerCase();
        const artists = Array.isArray(t?.artists)
          ? t.artists.map((a) => a.name).join(' ').toLowerCase()
          : '';
        return title.includes(normalizedQuery) || artists.includes(normalizedQuery);
      })
    : tracks;

  return (
    <main
      data-testid="spotify-dashboard"
      className={`spotify-dashboard-content ${isPlaying ? 'is-concert-live' : ''}`}
      style={{
        backgroundColor: '#121212',
        color: concert.primary,
        border: `1px solid ${isPlaying ? concert.border : '#242424'}`,
        boxShadow: isPlaying && visualState.isBeatPulse
          ? `0 0 22px ${concert.glow}`
          : 'none',
      }}
    >
      {/* Concert hero banner with mini stage strobe spots & beat-reactive wavy line */}
      <div
        className="spotify-hero-banner"
        style={{
          background: isPlaying
            ? `linear-gradient(135deg, ${concert.primary}33 0%, ${concert.secondary}28 50%, #121212 100%)`
            : 'linear-gradient(180deg, #1DB95426 0%, #121212 100%)',
          borderBottom: `1px solid ${isPlaying ? concert.accent : '#242424'}`,
        }}
      >
        <div className="hero-strobe-rig" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((spotIdx) => {
            const isFiring =
              isPlaying &&
              visualState.isBeatPulse &&
              (spotIdx + beatTick) % 2 === 0;
            const spotColor =
              spotIdx % 3 === 0
                ? '#FFFFFF'
                : spotIdx % 3 === 1
                  ? concert.accent
                  : concert.secondary;
            return (
              <span
                key={`strobe-${spotIdx}`}
                className={`strobe-spot ${isFiring ? 'is-firing' : ''}`}
                style={{
                  '--spot-color': spotColor,
                }}
              />
            );
          })}
        </div>

        <div className="hero-text-block">
          <span className="hero-kicker" style={{ color: concert.secondary }}>
            {isPlaying ? 'CONCERT LIGHTS ACTIVE' : 'SPOTIFY WEB PLAYER'}
          </span>
          <h1 className="hero-title" style={{ color: concert.primary }}>
            Your Top Tracks
          </h1>
        </div>

        <HeroWaveDancer
          bars={visualState.detailedBars || visualState.equalizerBars}
          isPlaying={isPlaying}
          isBeatPulse={visualState.isBeatPulse}
          beatTick={beatTick}
          primaryColor={concert.primary}
          secondaryColor={concert.secondary}
          accentColor={concert.accent}
        />
      </div>

      <div className="dashboard-scroll-body">
        {/* 48-band high-resolution beat-reactive gradient graphic equalizer paired with the hero wave */}
        <GraphicEqualizer
          bars={visualState.equalizerBars}
          detailedBars={visualState.detailedBars}
          barColors={visualState.equalizerBarColors}
          foregroundColor={concert.primary}
          secondaryColor={concert.secondary}
          accentColor={concert.accent}
          isBeatPulse={visualState.isBeatPulse}
          isPlaying={isPlaying}
          isLiveAudio={isLiveAudio}
          intervalMs={visualState.intervalMs}
        />

      {/* Expired/missing OAuth token fallback */}
      {authError && (
        <div
          role="alert"
          data-testid="auth-error-banner"
          className="status-banner"
          style={{
            color: concert.primary,
            border: `1px solid ${concert.border}`,
          }}
        >
          <p>Session expired. Please re-authenticate.</p>
          <button
            type="button"
            style={{
              color: concert.secondary,
              borderColor: concert.secondary,
            }}
            onClick={() => {
              setAuthError(false);
              setToken('pkce-reconnected-token');
            }}
          >
            Reconnect Spotify (PKCE)
          </button>
        </div>
      )}

      {/* Rate-limit / network error retry banner */}
      {rateLimitError && (
        <div
          role="alert"
          data-testid="rate-limit-banner"
          className="status-banner"
          style={{
            color: concert.secondary,
            border: `2px solid ${concert.border}`,
          }}
        >
          <p>Network or rate limit reached. Beat visualizer paused.</p>
          <button
            type="button"
            style={{
              color: concert.accent,
              borderColor: concert.accent,
            }}
            onClick={() => loadTracks(token, timeRange)}
          >
            Retry Request
          </button>
        </div>
      )}

      {/* Time-range filter pills and private playlist save trigger */}
      <section
        aria-label="Time Range Controls"
        className="time-range-toolbar"
        style={{
          color: concert.primary,
          borderBottom: `1px solid ${isPlaying ? concert.border : '#282828'}`,
        }}
      >
        <div className="time-range-pills">
          {TIME_RANGE_OPTIONS.map((opt, idx) => {
            const sceneTones = [concert.primary, concert.secondary, concert.accent];
            const pillColor = isPlaying
              ? sceneTones[idx % sceneTones.length]
              : '#1DB954';
            const isSelected = timeRange === opt.rangeKey;
            return (
              <button
                key={opt.optionId}
                type="button"
                className={`range-pill ${isSelected ? 'is-selected' : ''}`}
                style={{
                  backgroundColor: isSelected ? pillColor : '#181818',
                  color: isSelected ? '#000000' : pillColor,
                  border: `1px solid ${pillColor}`,
                }}
                onClick={() => setTimeRange(opt.rangeKey)}
              >
                {opt.displayLabel}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="save-playlist-btn"
          disabled={tracks.length === 0}
          style={{
            backgroundColor: '#000000',
            color: concert.accent,
            border: `2px solid ${concert.accent}`,
          }}
          onClick={handleSavePlaylist}
        >
          Save to Playlist
        </button>
      </section>

      {/* Embedded Spotify player with auto play/pause, Live Audio FFT sync, & BPM controls */}
      <EmbedPlayer
        playlistId={activePlaylistId}
        isPlaying={isPlaying}
        isLiveAudio={isLiveAudio}
        liveAudioError={liveAudioError}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        onToggleLiveAudio={handleToggleLiveAudio}
        onPlaybackStateChange={handleEmbedPlaybackChange}
        bpm={bpm}
        onBpmChange={setBpm}
        foregroundColor={concert.primary}
        secondaryColor={concert.secondary}
        isBeatPulse={visualState.isBeatPulse}
      />

      {/* Top tracks list or empty-catalog fallback */}
      {visibleTracks.length === 0 ? (
        <div
          data-testid="empty-tracks-state"
          className="status-banner"
          style={{
            color: concert.secondary,
            border: `1px dashed ${concert.border}`,
          }}
        >
          <p>No tracks found for this time range. Try another filter.</p>
        </div>
      ) : (
        <ul
          data-testid="tracks-list"
          className="spotify-tracks-list"
          style={{
            color: concert.primary,
            borderColor: concert.border,
          }}
        >
          {visibleTracks.map((track, idx) => {
            const sceneTones = [concert.primary, concert.secondary, concert.accent];
            return (
              <TrackCard
                key={track.id}
                track={track}
                index={idx}
                foregroundColor={concert.primary}
                accentColor={sceneTones[idx % sceneTones.length]}
                isBeatPulse={visualState.isBeatPulse}
                isPlaying={isPlaying}
              />
            );
          })}
        </ul>
      )}
      </div>
    </main>
  );
}
