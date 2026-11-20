import React from 'react';
import { DEFAULT_BAR_COUNT } from '../utils/beatVisualizer';

/**
 * 48-band high-resolution graphic equalizer with wave-matched reactive bounce
 * and a cohesive, smoothly transitioning multi-tint linear gradient across all bars.
 */
export default function GraphicEqualizer({
  bars = Array(DEFAULT_BAR_COUNT).fill(15),
  detailedBars = null,
  barColors = Array(DEFAULT_BAR_COUNT).fill('#1DB954'),
  foregroundColor = '#1DB954',
  secondaryColor = '#1DB954',
  accentColor = '#1DB954',
  isBeatPulse = false,
  isPlaying = false,
  isLiveAudio = false,
  intervalMs = 0,
}) {
  const heightTransitionMs = isLiveAudio
    ? 0
    : isPlaying && intervalMs > 0
      ? Math.max(80, Math.round(intervalMs * 0.45))
      : 220;

  // Expand 16 bands into 48 thin bars when detailed live FFT bands are not active
  const rawBars =
    Array.isArray(detailedBars) && detailedBars.length === 48
      ? detailedBars
      : Array.from({ length: 48 }, (_, idx) => {
          if (!isPlaying) return 4;
          const baseIdx = Math.floor(idx / 3);
          const cur = bars[baseIdx] ?? 15;
          const next = bars[Math.min(bars.length - 1, baseIdx + 1)] ?? cur;
          const step = idx % 3;
          return Math.round(cur + ((next - cur) * step) / 3);
        });

  // Cohesive concert gradient bound to @property typed CSS variables for silky-smooth color morphing
  const unifiedGradient = isPlaying
    ? 'linear-gradient(to top, color-mix(in srgb, var(--concert-primary) 24%, transparent) 0%, var(--concert-primary) 46%, var(--concert-secondary) 82%, var(--concert-accent) 100%)'
    : 'linear-gradient(to top, #1DB95433 0%, #1DB954aa 60%, #1DB954 100%)';

  return (
    <section
      aria-label="Graphic Equalizer"
      data-testid="graphic-equalizer"
      className={`graphic-equalizer-panel ${isPlaying ? 'is-playing' : ''}`}
      style={{
        backgroundColor: '#000000',
        color: foregroundColor,
        border: `2px solid var(--concert-border, ${foregroundColor})`,
        boxShadow: isPlaying ? 'var(--concert-shadow, none)' : 'none',
      }}
    >
      <div className="equalizer-header">
        <span className="equalizer-label">
          {isLiveAudio
            ? isPlaying
              ? 'LIVE AUDIO BEAT SYNC • ACTIVE'
              : 'LIVE AUDIO • WAITING FOR BEAT'
            : isPlaying
              ? 'CONCERT EQUALIZER • SYNCED'
              : 'GRAPHIC EQUALIZER • PAUSED'}
        </span>
        <span className="equalizer-status-dot" />
      </div>
      <div
        data-testid="equalizer-bars-container"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '112px',
          gap: '3px',
        }}
      >
        {rawBars.map((baseHeight, idx) => {
          const isPrimaryBand = idx % 3 === 0;
          const primaryIdx = Math.floor(idx / 3);
          const metaBarColor = isPlaying
            ? barColors[primaryIdx] || foregroundColor
            : '#1DB954';

          // Mirror the dancing wave's contrast boost + beat-kick lift
          const normalized = Math.max(0, (baseHeight - 4) / 96);
          const boosted = Math.pow(Math.min(1, normalized * 1.28), 1.12);
          const beatKick = isPlaying && isBeatPulse ? 14 : 0;
          const heightPct = isPlaying
            ? Math.max(4, Math.min(100, Math.round(4 + boosted * 84 + beatKick)))
            : 4;

          // Subtle across-the-spectrum tint variation (brightness/opacity) without clashing hues
          const tintOpacity = isPlaying
            ? 0.72 + (heightPct / 100) * 0.28
            : 0.75;

          return (
            <div
              key={`eq-fine-${idx}`}
              data-testid={
                isPrimaryBand ? `eq-bar-${primaryIdx}` : `eq-subbar-${idx}`
              }
              data-playing={isPlaying ? 'true' : 'false'}
              data-bar-color={metaBarColor}
              style={{
                flex: 1,
                minWidth: '3px',
                height: `${heightPct}%`,
                opacity: tintOpacity,
                backgroundColor: foregroundColor,
                backgroundImage: unifiedGradient,
                borderRadius: '2px 2px 0 0',
                boxShadow:
                  isPlaying && isBeatPulse
                    ? `0 0 10px ${secondaryColor}99`
                    : 'none',
                transition: isLiveAudio
                  ? 'none'
                  : `height ${heightTransitionMs}ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms ease, opacity 120ms ease, box-shadow 150ms ease`,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
