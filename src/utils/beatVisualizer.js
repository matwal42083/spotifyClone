// [SDD-REQ-03] Beat-Reactive Color, Tempo & 16-Band Graphic Equalizer Engine

// export const DEFAULT_BAR_COUNT with a value of 16
export const DEFAULT_BAR_COUNT = 16;

// Populate RESTING_THEME with properties backgroundColor: '#000000', foregroundColor: '#1DB954', isBeatPulse: false, intervalMs: 0, equalizerBars: Array(DEFAULT_BAR_COUNT).fill(15)
export const RESTING_THEME = {
  backgroundColor: '#000000',
  foregroundColor: '#1DB954',
  isBeatPulse: false,
  intervalMs: 0,
  equalizerBars: Array(DEFAULT_BAR_COUNT).fill(15)
};

// Populate BEATS_PALETTE with ['#1DB954', '#FF2A85', '#00F0FF', '#FFB800', '#A855F7', '#3B82F6']
export const BEATS_PALETTE = ['#1DB954', '#FF2A85', '#00F0FF', '#FFB800', '#A855F7', '#3B82F6'];

export function calculateBeatIntervalMs(bpm) {
  // if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) {
  if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) {
    // then return 500;
    return 500;
  }

  // return Math.round(60000 / bpm);
  return Math.round(60000 / bpm);

}

export function generateEqualizerBars(
  isPlaying,
  isBeatPulse = false,
  randomFn = Math.random,
  barCount = DEFAULT_BAR_COUNT
) {
  // if (!isPlaying) {
  if (!isPlaying) {
    // return Array(barCount).fill(15);
    return Array(barCount).fill(15);
  }
  // const boost = isBeatPulse ? 20 : 0;
  const boost = isBeatPulse ? 20 : 0;
  // return Array.from({ length: barCount }, () => {
  return Array.from({ length: barCount }, () => {
    // const raw = Math.round(25 + randomFn() * 55 + boost);
    const raw = Math.round(25 + randomFn() * 55 + boost);
    // return Math.max(15, Math.min(100, raw));
    return Math.max(15, Math.min(100, raw));
  });
}

export function computeNextVisualState({
  isPlaying,
  bpm = null,
  tickCount = 0,
  randomFn = Math.random,
} = {}) {
  // if (!isPlaying) 
  if (!isPlaying) {
    // return { ...RESTING_THEME, equalizerBars: [...RESTING_THEME.equalizerBars] };
    return { ...RESTING_THEME, equalizerBars: [...RESTING_THEME.equalizerBars] };
  }
  // const rawIndex = Math.floor(randomFn() * BEATS_PALETTE.length);
  const rawIndex = Math.floor(randomFn() * BEATS_PALETTE.length);
  // const safeIndex = Math.max(0, Math.min(BEATS_PALETTE.length - 1, rawIndex));
  const safeIndex = Math.max(0, Math.min(BEATS_PALETTE.length - 1, rawIndex))
  // const isBeatPulse = tickCount % 2 === 0;
  const isBeatPulse = tickCount % 2 === 0;
  // backgroundColor: '#000000', foregroundColor: BEATS_PALETTE[safeIndex], isBeatPulse, intervalMs: calculateBeatIntervalMs(bpm), equalizerBars: generateEqualizerBars(true, isBeatPulse, randomFn),
  return {
    backgroundColor: "#000000",
    foregroundColor: BEATS_PALETTE[safeIndex],
    isBeatPulse,
    intervalMs: calculateBeatIntervalMs(bpm),
    equalizerBars: generateEqualizerBars(true, isBeatPulse, randomFn)
  }
};

export function applyThemeToDocument(visualState = RESTING_THEME) {
  // if (typeof document === 'undefined' || !document.documentElement) {
  if (typeof document === 'undefined' || !document.documentElement) {
    return;
  }
  // Write const root = document.documentElement;
  const root = document.documentElement;
  // root.style.setProperty('--bg-color', visualState.backgroundColor);
  root.style.setProperty('--bg-color', visualState.backgroundColor);
  // root.style.setProperty('--fg-color', visualState.foregroundColor);
  root.style.setProperty('--fg-color', visualState.foregroundColor);
  // root.style.setProperty('--beat-scale', visualState.isBeatPulse ? '1.02' : '1');
  root.style.setProperty('--beat-scale', visualState.isBeatPulse ? '1.02' : '1');
  // root.style.setProperty('--beat-glow', visualState.isBeatPulse ? `0 0 14px ${visualState.foregroundColor}` : 'none');
  root.style.setProperty('--beat-glow', visualState.isBeatPulse ? `0 0 14px ${visualState.foregroundColor}` : 'none');
}

// LIVE HMR CHECK: Run `npx jest __tests__/beatVisualizer.test.js --watchAll=false` to verify all 3 visualizer tests turn GREEN!
// NEXT STEP: Once beatVisualizer.test.js passes, open src/data/fallbackCatalog.js
