// Âm thanh tổng hợp bằng Web Audio — không dùng file, chạy offline, không lo bản quyền.
// Trình duyệt chỉ cho phát sau lần chạm đầu tiên: unlockAudio() được gọi từ sự kiện chạm/phím.

export interface SoundConfig {
  sfx: boolean;
  sfxVolume: number; // 0–1
  ambient: boolean;
  ambientVolume: number; // 0–1
  haptics: boolean;
}

export const defaultSound: SoundConfig = { sfx: true, sfxVolume: 0.6, ambient: false, ambientVolume: 0.35, haptics: true };

let cfg: SoundConfig = { ...defaultSound };
let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let ambientBus: GainNode | null = null;
let ambientNodes: AudioNode[] = [];
let noiseBuf: AudioBuffer | null = null;

function context(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  sfxBus = ctx.createGain();
  sfxBus.gain.value = cfg.sfxVolume;
  sfxBus.connect(ctx.destination);
  ambientBus = ctx.createGain();
  ambientBus.gain.value = 0;
  ambientBus.connect(ctx.destination);
  return ctx;
}

/** Gọi trong một thao tác của người dùng (chạm, phím) để trình duyệt cho phép phát âm thanh */
export function unlockAudio() {
  const c = context();
  const run = () => {
    if (cfg.ambient) startAmbient();
    if (deferred) {
      const play = deferred;
      deferred = null;
      play();
    }
  };
  if (c && c.state === 'suspended') c.resume().then(run, () => {});
  else run();
}

export function setSoundConfig(next: SoundConfig) {
  const wasAmbient = cfg.ambient;
  cfg = { ...next };
  if (ctx && sfxBus && ambientBus) {
    sfxBus.gain.setTargetAtTime(cfg.sfxVolume, ctx.currentTime, 0.05);
    if (cfg.ambient) {
      if (!wasAmbient || !ambientNodes.length) startAmbient();
      ambientBus.gain.setTargetAtTime(cfg.ambientVolume * 0.6, ctx.currentTime, 0.4);
    } else if (wasAmbient) stopAmbient();
  }
}

function ready(): AudioContext | null {
  if (!cfg.sfx) return null;
  const c = context();
  if (!c || c.state !== 'running') return null;
  return c;
}

function noise(c: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  // Nhiễu nâu (brown noise): trầm, êm như tiếng nước
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    d[i] = last * 3.5;
  }
  noiseBuf = buf;
  return buf;
}

/** Một nốt có đường bao âm lượng (attack nhanh, tắt dần) */
function tone(
  c: AudioContext,
  { freq, to, type = 'sine', start = 0, dur = 0.2, vol = 0.3, attack = 0.005 }: { freq: number; to?: number; type?: OscillatorType; start?: number; dur?: number; vol?: number; attack?: number },
) {
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(sfxBus!);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Tiếng chuông: nốt gốc + các bồi âm không hoà âm như chuông kim loại */
function bell(c: AudioContext, freq: number, start = 0, vol = 0.18, dur = 1.2) {
  [
    [1, 1],
    [2.76, 0.45],
    [5.4, 0.22],
    [8.93, 0.1],
  ].forEach(([m, v]) => tone(c, { freq: freq * m, start, dur: dur / Math.sqrt(m), vol: vol * v }));
}

function swish(c: AudioContext, { start = 0, dur = 0.5, vol = 0.2, from = 300, to = 3000 }: { start?: number; dur?: number; vol?: number; from?: number; to?: number }) {
  const t = c.currentTime + start;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(sfxBus!);
  src.start(t, Math.random() * 2);
  src.stop(t + dur + 0.05);
}

export function vibrate(pattern: number | number[]) {
  // Trình duyệt chặn rung trước lần chạm đầu tiên — bỏ qua thay vì để lỗi ra console
  const active = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive ?? true;
  if (cfg.haptics && active && 'vibrate' in navigator) navigator.vibrate(pattern);
}

/** Âm thanh để dành: phát ngay khi người dùng chạm lần đầu (vd. rương mở lúc vừa vào app) */
let deferred: (() => void) | null = null;

export const sfx = {
  /** 🔔 khánh đồng: tick nhiệm vụ, lưu, chấm thẻ */
  drop() {
    const c = ready();
    if (!c) return;
    khanh(c, 1318.5, 0, 0.14);
  },
  /** 🎵 một nốt đàn tranh: chuyển tab, lật thẻ */
  bubble() {
    const c = ready();
    if (!c) return;
    pluck(c, 587.33, 0, 0.1);
  },
  /** 🔔 chuông chùa: trả lời đúng */
  chime() {
    const c = ready();
    if (!c) return;
    bell(c, 392, 0, 0.2, 2.4);
    bell(c, 784, 0.02, 0.08, 1.6);
    vibrate(18);
  },
  /** 🥁 trống trầm: trả lời sai — nhẹ, không chói */
  wrong() {
    const c = ready();
    if (!c) return;
    tone(c, { freq: 120, to: 48, dur: 0.42, vol: 0.32 });
    swish(c, { dur: 0.16, vol: 0.1, from: 260, to: 120 });
    vibrate([25, 60, 25]);
  },
  /** 🎶 đàn tranh lướt ngũ cung + khánh: qua khảo hạch, xong phiên ôn */
  fanfare() {
    const c = ready();
    if (!c) return;
    [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5].forEach((f, i) => pluck(c, f, i * 0.055, 0.12));
    khanh(c, 1046.5, 0.5, 0.12);
    vibrate([20, 40, 20, 40, 60]);
  },
  /** ⚡ đột phá cảnh giới: sấm rền → cồng → đàn tranh và chuông ngân */
  treasure() {
    const c = ready();
    if (!c) {
      if (cfg.sfx) deferred = () => sfx.treasure();
      return;
    }
    // Sấm rền xa
    const t = c.currentTime;
    const rumble = c.createBufferSource();
    rumble.buffer = noise(c);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 140;
    const rg = c.createGain();
    rg.gain.setValueAtTime(0.0001, t);
    rg.gain.exponentialRampToValueAtTime(0.9, t + 0.25);
    rg.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    rumble.connect(lp).connect(rg).connect(sfxBus!);
    rumble.start(t, Math.random() * 2);
    rumble.stop(t + 1.9);
    // Tiếng cồng: nốt thấp, bồi âm kim loại, ngân dài
    [
      [98, 0.22],
      [196.5, 0.1],
      [270.5, 0.08],
      [529, 0.04],
    ].forEach(([f, v]) => tone(c, { freq: f, start: 0.7, dur: 4, vol: v, attack: 0.02 }));
    // Đàn tranh lướt lên và chuông ngân trên cao
    [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5, 1568].forEach((f, i) => pluck(c, f, 1.1 + i * 0.07, 0.11));
    [1568, 2093, 2349].forEach((f, i) => bell(c, f, 2 + i * 0.18, 0.07, 2.2));
    vibrate([40, 60, 40, 60, 120]);
  },
};

/** Nốt đàn tranh: dây gảy tắt nhanh, có luyến nhẹ xuống ở đầu nốt */
function pluck(c: AudioContext, freq: number, start: number, vol: number) {
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const f = c.createBiquadFilter();
  const g = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq * 1.03, t);
  osc.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
  f.type = 'lowpass';
  f.frequency.setValueAtTime(freq * 8, t);
  f.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.5);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  osc.connect(f).connect(g).connect(sfxBus!);
  osc.start(t);
  osc.stop(t + 1.2);
}

/** Khánh đồng: tiếng gõ kim loại trong, bồi âm không hoà âm */
function khanh(c: AudioContext, freq: number, start: number, vol: number) {
  [
    [1, 1],
    [2.4, 0.5],
    [4.1, 0.25],
  ].forEach(([m, v]) => tone(c, { freq: freq * m, start, dur: 1.6 / Math.sqrt(m), vol: vol * v, attack: 0.002 }));
}

// ---------- Gió núi chạy nền, thỉnh thoảng có chuông gió xa ----------
let chimeTimer: ReturnType<typeof setTimeout> | null = null;

function startAmbient() {
  const c = context();
  if (!c || !ambientBus || ambientNodes.length || c.state !== 'running') return;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  // Gió: dải tần giữa, tâm dải và âm lượng dâng hạ chậm như từng cơn gió
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.8;
  bp.frequency.value = 600;
  const gust = c.createGain();
  gust.gain.value = 0.5;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 0.35;
  lfo.connect(lfoDepth).connect(gust.gain);
  const lfo2 = c.createOscillator();
  lfo2.frequency.value = 0.045;
  const lfo2Depth = c.createGain();
  lfo2Depth.gain.value = 300;
  lfo2.connect(lfo2Depth).connect(bp.frequency);
  src.connect(bp).connect(gust).connect(ambientBus);
  [src, lfo, lfo2].forEach((n) => n.start());
  ambientNodes = [src, lfo, lfo2];
  ambientBus.gain.setTargetAtTime(cfg.ambientVolume * 0.6, c.currentTime, 0.8);

  const ring = () => {
    if (!ctx || !ambientBus || !ambientNodes.length) return;
    // chuông gió xa đi thẳng vào kênh nền để theo âm lượng nhạc nền
    const notes = [1568, 1760, 2093, 2349, 2637];
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const t = ctx.currentTime + i * (0.12 + Math.random() * 0.2);
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      osc.connect(g).connect(ambientBus);
      osc.start(t);
      osc.stop(t + 1.7);
    }
    chimeTimer = setTimeout(ring, 5000 + Math.random() * 7000);
  };
  chimeTimer = setTimeout(ring, 3000);
}

function stopAmbient() {
  if (!ctx || !ambientBus) return;
  if (chimeTimer) clearTimeout(chimeTimer);
  chimeTimer = null;
  ambientBus.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  const nodes = ambientNodes;
  ambientNodes = [];
  setTimeout(() => nodes.forEach((n) => (n as AudioScheduledSourceNode).stop?.()), 1500);
}
