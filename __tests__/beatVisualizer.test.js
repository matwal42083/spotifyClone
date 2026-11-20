import {
  RESTING_THEME,
  BEATS_PALETTE,
  calculateBeatIntervalMs,
  generateEqualizerBars,
  computeNextVisualState,
  applyThemeToDocument,
} from '../src/utils/beatVisualizer';
import { analyzeFrequencyFrame } from '../src/utils/audioBeatDetector';

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

  test('produces mixed concert colors across equalizer bars and UI regions when playing', () => {
    const state = computeNextVisualState({
      isPlaying: true,
      bpm: 128,
      tickCount: 3,
      randomFn: () => 0.1,
    });
    expect(state.equalizerBarColors).toHaveLength(16);
    expect(new Set(state.equalizerBarColors).size).toBeGreaterThan(1);
    expect(new Set(Object.values(state.concertColors)).size).toBeGreaterThan(1);
  });

  test('live audio FFT analyzer freezes bars at 15% on silence and triggers beat hit on bass transient', () => {
    const silentBins = new Uint8Array(256).fill(0);
    const silentFrame = analyzeFrequencyFrame(silentBins, 60, 0, 500, 16);
    expect(silentFrame.isSilent).toBe(true);
    expect(silentFrame.isBeatHit).toBe(false);
    expect(silentFrame.bars.every((h) => h === 15)).toBe(true);

    const kickBins = new Uint8Array(256).fill(20);
    for (let i = 0; i < 10; i += 1) {
      kickBins[i] = 220;
    }
    const kickFrame = analyzeFrequencyFrame(kickBins, 50, 0, 500, 16);
    expect(kickFrame.isSilent).toBe(false);
    expect(kickFrame.isBeatHit).toBe(true);
    expect(kickFrame.bars[0]).toBeGreaterThan(80);
  });
});
