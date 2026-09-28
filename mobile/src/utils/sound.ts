import { Platform, Vibration } from "react-native";
import { useStore } from "../store/store";

let audioCtx: any = null;

function getAudioContext() {
  if (Platform.OS !== "web") return null;
  try {
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playCoinSound() {
  const soundEnabled = useStore.getState().soundEnabled ?? true;
  if (!soundEnabled) return;

  // Haptic feedback
  try {
    Vibration.vibrate(15);
  } catch {}

  // Web Audio Synth
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {}
}

export function playSuccessSound() {
  const soundEnabled = useStore.getState().soundEnabled ?? true;
  if (!soundEnabled) return;

  // Haptic feedback
  try {
    Vibration.vibrate([0, 25, 40, 45]);
  } catch {}

  // Web Audio Synth: 3-note chime
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch {}
}

export function playClickSound() {
  const soundEnabled = useStore.getState().soundEnabled ?? true;
  if (!soundEnabled) return;

  try {
    Vibration.vibrate(8);
  } catch {}

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {}
}

export function playErrorSound() {
  const soundEnabled = useStore.getState().soundEnabled ?? true;
  if (!soundEnabled) return;

  try {
    Vibration.vibrate([0, 30, 40, 30]);
  } catch {}

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch {}
}

export function playMunchSound() {
  const soundEnabled = useStore.getState().soundEnabled ?? true;
  if (!soundEnabled) return;

  try {
    Vibration.vibrate([0, 15, 30, 20]);
  } catch {}

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    // 2-tone "crunch-crunch" sound
    [0, 0.08].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + delay;

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    });
  } catch {}
}

export function playPurrSound() {
  const soundEnabled = useStore.getState().soundEnabled ?? true;
  if (!soundEnabled) return;

  try {
    Vibration.vibrate(20);
  } catch {}

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch {}
}

export function playFanfareSound() {
  const soundEnabled = useStore.getState().soundEnabled ?? true;
  if (!soundEnabled) return;

  try {
    Vibration.vibrate([0, 30, 50, 60, 40, 80]);
  } catch {}

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    // Grand fanfare: C4, G4, C5, E5, G5
    const fanfareNotes = [261.63, 392.0, 523.25, 659.25, 783.99];
    fanfareNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + idx * 0.08;
      const duration = idx === fanfareNotes.length - 1 ? 0.6 : 0.2;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  } catch {}
}
