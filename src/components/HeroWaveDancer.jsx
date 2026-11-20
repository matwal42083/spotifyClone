import React from 'react';

/**
 * Beat-reactive neon sound-wave line running from the far right edge straight
 * up to the hero title, with tall, high-contrast dancing peaks driven by live audio.
 */
export default function HeroWaveDancer({
  bars = [],
  isPlaying = false,
  isBeatPulse = false,
  beatTick = 0,
  primaryColor = '#1DB954',
  secondaryColor = '#1DB954',
  accentColor = '#1DB954',
}) {
  const width = 620;
  const height = 104;
  const midY = height / 2;
  const pointsCount = 30;
  const stepX = width / pointsCount;

  const buildWavePath = (phaseShift = 0, scaleFactor = 1) => {
    const coords = Array.from({ length: pointsCount + 1 }, (_, i) => {
      const x = Math.round(i * stepX);
      if (!isPlaying) {
        return { x, y: midY };
      }
      const barIdx = Math.min(
        bars.length - 1,
        Math.floor((i / pointsCount) * Math.max(1, bars.length))
      );
      const rawEnergy = bars.length > 0 ? Math.max(0, (bars[barIdx] - 4) / 96) : 0.5;
      // Boost contrast so peaks punch all the way to the top & bottom edges
      const boosted = Math.pow(Math.min(1, rawEnergy * 1.28), 1.15);
      const taper = i === 0 ? 0 : Math.min(1, i / 1.5);
      const direction = (i + beatTick + phaseShift) % 2 === 0 ? -1 : 1;
      const amplitude = (5 + boosted * 44 + (isBeatPulse ? 9 : 0)) * taper * scaleFactor;
      const y = Math.max(3, Math.min(height - 3, Math.round(midY + direction * amplitude)));
      return { x, y };
    });

    // Direct cubic Bezier through every exact peak so peaks never get flattened
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i += 1) {
      const p0 = coords[i - 1];
      const p1 = coords[i];
      const cpX = Math.round((p0.x + p1.x) / 2);
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const mainWave = buildWavePath(0, 1);
  const echoWave = buildWavePath(1, 0.72);

  return (
    <div className="hero-wave-stage" aria-hidden="true">
      <svg
        className="hero-wave-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="heroWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isPlaying ? 'var(--concert-primary)' : primaryColor} />
            <stop offset="50%" stopColor={isPlaying ? 'var(--concert-secondary)' : secondaryColor} />
            <stop offset="100%" stopColor={isPlaying ? 'var(--concert-accent)' : accentColor} />
          </linearGradient>
        </defs>
        {isPlaying && (
          <path
            d={echoWave}
            fill="none"
            stroke="var(--concert-secondary)"
            strokeOpacity="0.45"
            strokeWidth={isBeatPulse ? '3' : '2'}
            strokeLinecap="round"
          />
        )}
        <path
          d={mainWave}
          fill="none"
          stroke="url(#heroWaveGrad)"
          strokeWidth={isBeatPulse ? '4.5' : '3.2'}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: isPlaying
              ? `drop-shadow(0 0 ${isBeatPulse ? '14px' : '6px'} ${accentColor})`
              : 'none',
            transition: 'stroke-width 80ms ease, filter 80ms ease',
          }}
        />
      </svg>
    </div>
  );
}
