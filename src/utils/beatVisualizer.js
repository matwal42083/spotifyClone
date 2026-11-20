// Beat-reactive concert-light color, tempo, and 16-band graphic equalizer engine

export const DEFAULT_BAR_COUNT = 16;

export const RESTING_CONCERT_COLORS = {
  primary: '#1DB954',
  secondary: '#1DB954',
  accent: '#1DB954',
  border: '#1DB954',
  glow: '#1DB954',
};

// Baseline dark-mode Spotify Green theme applied when playback is paused
export const RESTING_THEME = {
  backgroundColor: '#000000',
  foregroundColor: '#1DB954',
  isBeatPulse: false,
  intervalMs: 0,
  equalizerBars: Array(DEFAULT_BAR_COUNT).fill(15),
  equalizerBarColors: Array(DEFAULT_BAR_COUNT).fill('#1DB954'),
  concertColors: { ...RESTING_CONCERT_COLORS },
};

// Neon palette preserved for deterministic beat unit tests
export const BEATS_PALETTE = [
  '#1DB954',
  '#FF2A85',
  '#00F0FF',
  '#FFB800',
  '#A855F7',
  '#3B82F6',
];

// Curated rock/metal concert lighting scenes (cohesive stage washes, never random clashing hues)
export const CONCERT_SCENES = [
  {
    name: 'Crimson Fire',
    primary: '#FF1E2D',
    secondary: '#FF6B00',
    accent: '#FFD000',
    border: '#FF2A3B',
    glow: '#FF1E2D',
  },
  {
    name: 'Electric Blue',
    primary: '#0070FF',
    secondary: '#00D4FF',
    accent: '#60A5FA',
    border: '#1D8CFF',
    glow: '#0088FF',
  },
  {
    name: 'Laser Green',
    primary: '#1DB954',
    secondary: '#39FF14',
    accent: '#00E676',
    border: '#1DB954',
    glow: '#22C55E',
  },
  {
    name: 'Stadium Gold',
    primary: '#FFD600',
    secondary: '#FF9100',
    accent: '#FFF176',
    border: '#FACC15',
    glow: '#FFB300',
  },
  {
    name: 'Ultraviolet',
    primary: '#9333EA',
    secondary: '#C026D3',
    accent: '#A855F7',
    border: '#A855F7',
    glow: '#9333EA',
  },
  {
    name: 'Chrome Ice',
    primary: '#E2E8F0',
    secondary: '#38BDF8',
    accent: '#93C5FD',
    border: '#7DD3FC',
    glow: '#38BDF8',
  },
];

/**
 * Converts a track BPM into a millisecond beat interval (defaults to 500ms / 120 BPM).
 */
export function calculateBeatIntervalMs(bpm) {
  if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) {
    return 500;
  }
  return Math.round(60000 / bpm);
}

/**
 * Generates bar height percentages (15% at rest, 25%-100% when playing).
 * Uses a rhythmic center-weighted spectrum curve so bars move dynamically to the beat.
 */
export function generateEqualizerBars(
  isPlaying,
  isBeatPulse = false,
  randomFn = Math.random,
  barCount = DEFAULT_BAR_COUNT
) {
  if (!isPlaying) {
    return Array(barCount).fill(15);
  }
  const boost = isBeatPulse ? 20 : 0;
  return Array.from({ length: barCount }, () => {
    const raw = Math.round(25 + randomFn() * 55 + boost);
    return Math.max(15, Math.min(100, raw));
  });
}

/**
 * Generates independent mixed concert-light colors for each equalizer bar.
 */
export function generateEqualizerBarColors(
  isPlaying,
  randomFn = Math.random,
  barCount = DEFAULT_BAR_COUNT,
  tickCount = 0
) {
  if (!isPlaying) {
    return Array(barCount).fill('#1DB954');
  }
  const len = BEATS_PALETTE.length;
  return Array.from({ length: barCount }, (_, idx) => {
    const pick = Math.floor(randomFn() * len);
    const mixedIndex = (pick + idx + tickCount) % len;
    return BEATS_PALETTE[Math.max(0, mixedIndex)];
  });
}

/**
 * Selects a cohesive rock/metal concert lighting scene (Red, Blue, Green, Yellow, Purple, Chrome)
 * cycling cleanly by beat tick so the entire stage shares harmonious colors with zero clashing.
 */
export function generateConcertColors(
  isPlaying,
  randomFn = Math.random,
  tickCount = 0
) {
  if (!isPlaying) {
    return { ...RESTING_CONCERT_COLORS };
  }
  const sceneIndex = Math.abs(tickCount) % CONCERT_SCENES.length;
  const scene = CONCERT_SCENES[sceneIndex];
  return {
    primary: scene.primary,
    secondary: scene.secondary,
    accent: scene.accent,
    border: scene.border,
    glow: scene.glow,
  };
}

/**
 * Computes the next visual theme state for the current beat tick.
 */
export function computeNextVisualState({
  isPlaying,
  bpm = null,
  tickCount = 0,
  randomFn = Math.random,
} = {}) {
  if (!isPlaying) {
    return {
      ...RESTING_THEME,
      equalizerBars: [...RESTING_THEME.equalizerBars],
      equalizerBarColors: [...RESTING_THEME.equalizerBarColors],
      concertColors: { ...RESTING_CONCERT_COLORS },
    };
  }
  const rawIndex = Math.floor(randomFn() * BEATS_PALETTE.length);
  const safeIndex = Math.max(0, Math.min(BEATS_PALETTE.length - 1, rawIndex));
  const isBeatPulse = tickCount % 2 === 0;
  const intervalMs = calculateBeatIntervalMs(bpm);
  const concertColors = generateConcertColors(true, randomFn, tickCount);

  return {
    backgroundColor: '#000000',
    foregroundColor: BEATS_PALETTE[safeIndex],
    isBeatPulse,
    intervalMs,
    equalizerBars: generateEqualizerBars(true, isBeatPulse, randomFn),
    equalizerBarColors: generateEqualizerBarColors(
      true,
      randomFn,
      DEFAULT_BAR_COUNT,
      tickCount
    ),
    concertColors,
  };
}

/**
 * Syncs root CSS custom properties with the active concert-light visual theme state.
 */
export function applyThemeToDocument(visualState = RESTING_THEME) {
  if (typeof document === 'undefined' || !document.documentElement) {
    return;
  }
  const root = document.documentElement;
  const colors = visualState.concertColors || RESTING_CONCERT_COLORS;
  const durationMs = visualState.intervalMs
    ? Math.max(90, Math.round(visualState.intervalMs * 0.45))
    : 220;

  root.style.setProperty('--bg-color', visualState.backgroundColor);
  root.style.setProperty('--fg-color', visualState.foregroundColor);
  root.style.setProperty('--concert-primary', colors.primary);
  root.style.setProperty('--concert-secondary', colors.secondary);
  root.style.setProperty('--concert-accent', colors.accent);
  root.style.setProperty('--concert-border', colors.border);
  root.style.setProperty('--concert-glow', colors.glow);
  root.style.setProperty('--beat-duration', `${durationMs}ms`);
  root.style.setProperty('--beat-scale', visualState.isBeatPulse ? '1.02' : '1');
  root.style.setProperty('--beat-btn-scale', visualState.isBeatPulse ? '1.05' : '1');
  root.style.setProperty('--beat-speaker-scale', visualState.isBeatPulse ? '1.12' : '1');
  root.style.setProperty(
    '--beat-glow',
    visualState.isBeatPulse ? `0 0 14px ${visualState.foregroundColor}` : 'none'
  );
  root.style.setProperty(
    '--concert-shadow',
    visualState.isBeatPulse ? `0 0 18px ${colors.glow}` : 'none'
  );
  root.style.setProperty(
    '--concert-shadow-alt',
    visualState.isBeatPulse ? `0 0 16px ${colors.accent}` : 'none'
  );
  const isPlayingLive = Boolean(visualState.intervalMs);
  root.style.setProperty(
    '--concert-bg-opacity',
    isPlayingLive ? (visualState.isBeatPulse ? '1' : '0.42') : '0'
  );
  root.style.setProperty(
    '--concert-bg-gradient',
    isPlayingLive
      ? visualState.isBeatPulse
        ? `linear-gradient(135deg, ${colors.primary}cc 0%, ${colors.secondary}aa 35%, ${colors.accent}aa 70%, ${colors.glow}cc 100%)`
        : `linear-gradient(315deg, ${colors.primary}44 0%, ${colors.secondary}33 50%, ${colors.accent}44 100%)`
      : '#000000'
  );
}
