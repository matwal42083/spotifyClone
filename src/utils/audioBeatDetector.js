// Real-time Web Audio API FFT spectrum & beat-onset detector
// Drives the 16-band Graphic Equalizer and concert-light color shifts directly from live audio.

/**
 * Pure FFT frame analyzer: maps raw frequency bins into 16 logarithmic equalizer bars,
 * detects silence (paused/stopped music), and detects real bass/kick beat hits.
 */
export function analyzeFrequencyFrame(
  freqData,
  prevBassAvg = 0,
  lastBeatTime = 0,
  nowMs = 0,
  barCount = 16,
  prevFreqData = null,
  prevFluxAvg = 0
) {
  if (!freqData || freqData.length === 0) {
    return {
      bars: Array(barCount).fill(15),
      detailedBars: Array(48).fill(4),
      bassEnergy: 0,
      overallEnergy: 0,
      nextBassAvg: prevBassAvg * 0.9,
      nextFluxAvg: prevFluxAvg * 0.9,
      isSilent: true,
      isBeatHit: false,
    };
  }

  let totalSum = 0;
  for (let i = 0; i < freqData.length; i += 1) {
    totalSum += freqData[i];
  }
  const overallEnergy = totalSum / freqData.length;

  // Low-frequency bins (kick drum & bassline)
  const bassBinCount = Math.min(10, freqData.length);
  let bassSum = 0;
  for (let i = 0; i < bassBinCount; i += 1) {
    bassSum += freqData[i];
  }
  const bassEnergy = bassSum / bassBinCount;
  const isSilent = overallEnergy < 4 && bassEnergy < 8;

  if (isSilent) {
    return {
      bars: Array(barCount).fill(15),
      detailedBars: Array(48).fill(4),
      bassEnergy: 0,
      overallEnergy: 0,
      nextBassAvg: prevBassAvg * 0.85,
      nextFluxAvg: prevFluxAvg * 0.85,
      isSilent: true,
      isBeatHit: false,
    };
  }

  // Positive spectral flux across bass + snare/mid bins (works reliably on compressed Spotify audio)
  let spectralFlux = 0;
  if (prevFreqData && prevFreqData.length === freqData.length) {
    const fluxBins = Math.min(64, freqData.length);
    for (let i = 0; i < fluxBins; i += 1) {
      const diff = freqData[i] - prevFreqData[i];
      if (diff > 0) {
        spectralFlux += diff;
      }
    }
    spectralFlux /= fluxBins;
  }

  // Map frequency bins logarithmically across both 16 bands and 48 high-contrast EQ bands
  const maxBin = Math.min(freqData.length - 1, 160);
  const sampleSpectrum = (countTarget, highContrast = false) =>
    Array.from({ length: countTarget }, (_, idx) => {
      const startFrac = Math.pow(idx / countTarget, 1.45);
      const endFrac = Math.pow((idx + 1) / countTarget, 1.45);
      const startBin = Math.floor(startFrac * maxBin);
      const endBin = Math.max(startBin + 1, Math.floor(endFrac * maxBin));

      let bandSum = 0;
      let count = 0;
      for (let b = startBin; b < endBin && b < freqData.length; b += 1) {
        bandSum += freqData[b];
        count += 1;
      }
      const bandAvg = count > 0 ? bandSum / count : 0;

      if (!highContrast) {
        const heightPct = Math.round(15 + (bandAvg / 255) * 85);
        return Math.max(15, Math.min(100, heightPct));
      }

      // True EQ dynamics: drop very low (3%) when quiet, boost high peaks all the way to 100%
      const trebleLift = 1 + (idx / countTarget) * 0.45;
      const noiseGated = Math.max(0, bandAvg - 18) / 195;
      const curved = Math.pow(Math.min(1, noiseGated * trebleLift), 1.55);
      const heightPct = Math.round(3 + curved * 97);
      return Math.max(3, Math.min(100, heightPct));
    });

  const bars = sampleSpectrum(barCount, false);
  const detailedBars = sampleSpectrum(48, true);

  // Trigger a beat hit on either a spectral flux spike (kick/snare onset) OR bass transient
  const bassThreshold = Math.max(45, prevBassAvg * 1.12);
  const fluxThreshold = Math.max(3.5, prevFluxAvg * 1.35);
  const cooldownMs = 220;
  const canTrigger = nowMs - lastBeatTime > cooldownMs;
  const isBeatHit =
    canTrigger && (spectralFlux > fluxThreshold || bassEnergy > bassThreshold);

  const nextBassAvg = prevBassAvg === 0
    ? bassEnergy
    : prevBassAvg * 0.88 + bassEnergy * 0.12;
  const nextFluxAvg = prevFluxAvg === 0
    ? spectralFlux
    : prevFluxAvg * 0.85 + spectralFlux * 0.15;

  return {
    bars,
    detailedBars,
    bassEnergy,
    overallEnergy,
    nextBassAvg,
    nextFluxAvg,
    isSilent: false,
    isBeatHit,
  };
}

/**
 * Captures live browser tab audio via getDisplayMedia and streams real-time FFT frames
 * through Web Audio AnalyserNode at 60fps.
 */
export async function startLiveAudioCapture({ onFrame, onStop, onError }) {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getDisplayMedia !== 'function'
  ) {
    if (onError) {
      onError('Browser does not support live tab audio capture.');
    }
    return null;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: true,
    });
  } catch {
    if (onError) {
      onError('Audio capture cancelled. Select this tab and check "Share tab audio".');
    }
    return null;
  }

  // Discard unused video track so only audio is processed
  stream.getVideoTracks().forEach((track) => track.stop());

  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    if (onError) {
      onError('No audio track shared. Check "Share tab audio" in the browser prompt.');
    }
    return null;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.72;
  source.connect(analyser);

  const freqData = new Uint8Array(analyser.frequencyBinCount);
  const prevFreqData = new Uint8Array(analyser.frequencyBinCount);
  let rafId = null;
  let prevBassAvg = 0;
  let prevFluxAvg = 0;
  let lastBeatTime = 0;
  let active = true;

  const stop = () => {
    if (!active) return;
    active = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    audioTracks.forEach((track) => track.stop());
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
    if (onStop) onStop();
  };

  audioTracks[0].addEventListener('ended', stop);

  const loop = (nowMs) => {
    if (!active) return;
    analyser.getByteFrequencyData(freqData);
    const frame = analyzeFrequencyFrame(
      freqData,
      prevBassAvg,
      lastBeatTime,
      nowMs,
      16,
      prevFreqData,
      prevFluxAvg
    );
    prevFreqData.set(freqData);
    prevBassAvg = frame.nextBassAvg;
    prevFluxAvg = frame.nextFluxAvg;
    if (frame.isBeatHit) {
      lastBeatTime = nowMs;
    }
    if (onFrame) {
      onFrame(frame);
    }
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);
  return { stop };
}
