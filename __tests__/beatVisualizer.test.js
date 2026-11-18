import {
  RESTING_THEME,
  BEATS_PALETTE,
  calculateBeatIntervalMs,
  generateEqualizerBars,
  computeNextVisualState,
  applyThemeToDocument,
} from '../src/utils/beatVisualizer';

describe('Beat Visualizer Engine [SDD-REQ-03]', () => {
  test('returns #000000 background and #1DB954 foreground when not playing', () => {
    const state = computeNextVisualState({ isPlaying: false, bpm: 120 });
    expect(state).toEqual(RESTING_THEME);
    expect(state.backgroundColor).toBe('#000000');
    expect(state.foregroundColor).toBe('#1DB954');
    expect(state.isBeatPulse).toBe(false);
    expect(state.equalizerBars).toHaveLength(16);
    expect(state.equalizerBars.every((h) => h === 15)).toBe(true);
  });

  test('cycles foreground color and pulses to exact BPM when playing', () => {
    const state = computeNextVisualState({
      isPlaying: true,
      bpm: 120,
      tickCount: 2,
      randomFn: () => 0.25,
    });
    expect(state.backgroundColor).toBe('#000000');
    expect(BEATS_PALETTE).toContain(state.foregroundColor);
    expect(state.foregroundColor).toBe('#FF2A85');
    expect(state.isBeatPulse).toBe(true);
    expect(state.intervalMs).toBe(500);
    expect(generateEqualizerBars(true, true, () => 0.5)).toHaveLength(16);
    expect(state.equalizerBars.every((h) => h > 15)).toBe(true);

    applyThemeToDocument(state);
    expect(document.documentElement.style.getPropertyValue('--fg-color')).toBe(
      '#FF2A85'
    );
    expect(
      document.documentElement.style.getPropertyValue('--beat-scale')
    ).toBe('1.02');
  });

  test('falls back to 500ms (120 BPM) when BPM metadata is missing or invalid', () => {
    expect(calculateBeatIntervalMs(null)).toBe(500);
    expect(calculateBeatIntervalMs(undefined)).toBe(500);
    expect(calculateBeatIntervalMs(0)).toBe(500);
    const fallbackState = computeNextVisualState({
      isPlaying: true,
      bpm: null,
      tickCount: 1,
      randomFn: () => 0.5,
    });
    expect(fallbackState.intervalMs).toBe(500);
    expect(fallbackState.isBeatPulse).toBe(false);
  });
});
