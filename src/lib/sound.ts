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
  /** 💧 giọt nước: tick checklist, lưu */
  drop() {
    const c = ready();
    if (!c) return;
    tone(c, { freq: 420, to: 1250, dur: 0.12, vol: 0.28 });
    tone(c, { freq: 900, to: 1700, start: 0.05, dur: 0.08, vol: 0.08 });
  },
  /** 🫧 bọt nước: chuyển tab, lật thẻ */
  bubble() {
    const c = ready();
    if (!c) return;
    tone(c, { freq: 260, to: 700, dur: 0.07, vol: 0.14 });
  },
  /** 🔔 chuông gió: trả lời đúng */
  chime() {
    const c = ready();
    if (!c) return;
    bell(c, 1046.5, 0, 0.16);
    bell(c, 1568, 0.09, 0.12);
    vibrate(18);
  },
  /** 🌊 nước gợn trầm: trả lời sai — nhẹ, không chói */
  wrong() {
    const c = ready();
    if (!c) return;
    tone(c, { freq: 240, to: 150, type: 'triangle', dur: 0.32, vol: 0.18 });
    swish(c, { dur: 0.35, vol: 0.12, from: 900, to: 250 });
    vibrate([25, 60, 25]);
  },
  /** ✨ chuỗi chuông: đạt mini test, mở khoá tuần, xong phiên ôn */
  fanfare() {
    const c = ready();
    if (!c) return;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => bell(c, f, i * 0.09, 0.15, 1.4));
    [2093, 2637, 3136].forEach((f, i) => tone(c, { freq: f, start: 0.5 + i * 0.07, dur: 0.25, vol: 0.05 }));
    vibrate([20, 40, 20, 40, 60]);
  },
  /** 🗝️ mở rương kho báu: nắp gỗ kẽo kẹt → luồng sáng → chuông phép thuật → xu vàng leng keng */
  treasure() {
    const c = ready();
    if (!c) {
      if (cfg.sfx) deferred = () => sfx.treasure();
      return;
    }
    // Nắp gỗ kẽo kẹt
    const t = c.currentTime;
    const creak = c.createOscillator();
    const cf = c.createBiquadFilter();
    const cg = c.createGain();
    creak.type = 'sawtooth';
    creak.frequency.setValueAtTime(70, t);
    creak.frequency.linearRampToValueAtTime(130, t + 0.55);
    cf.type = 'bandpass';
    cf.Q.value = 6;
    cf.frequency.setValueAtTime(400, t);
    cf.frequency.linearRampToValueAtTime(900, t + 0.55);
    cg.gain.setValueAtTime(0.0001, t);
    cg.gain.exponentialRampToValueAtTime(0.09, t + 0.08);
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    creak.connect(cf).connect(cg).connect(sfxBus!);
    creak.start(t);
    creak.stop(t + 0.65);
    // Luồng sáng bừng lên
    swish(c, { start: 0.5, dur: 0.8, vol: 0.16, from: 250, to: 5000 });
    // Chuỗi chuông phép thuật đi lên (ngũ cung)
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5, 1568, 1760, 2093];
    scale.forEach((f, i) => bell(c, f, 0.75 + i * 0.06, 0.11, 1.6));
    // Hợp âm nền ngân dài
    [261.63, 329.63, 392, 523.25].forEach((f) => {
      tone(c, { freq: f, start: 0.8, dur: 2.6, vol: 0.05, attack: 0.4 });
      tone(c, { freq: f * 1.004, start: 0.8, dur: 2.6, vol: 0.04, attack: 0.4 });
    });
    // Xu vàng leng keng
    for (let i = 0; i < 12; i++) {
      const f = 2400 + Math.random() * 2600;
      const s = 1.1 + Math.random() * 1.3;
      tone(c, { freq: f, start: s, dur: 0.18, vol: 0.05, type: 'square' });
      tone(c, { freq: f * 1.5, start: s + 0.01, dur: 0.12, vol: 0.03 });
    }
    vibrate([40, 60, 40, 60, 120]);
  },
};

// ---------- Sóng biển chạy nền ----------
function startAmbient() {
  const c = context();
  if (!c || !ambientBus || ambientNodes.length || c.state !== 'running') return;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  // Lớp sóng trầm: lọc thấp, tần số cắt và âm lượng dâng hạ chậm như sóng vỗ
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  const swell = c.createGain();
  swell.gain.value = 0.55;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 0.4;
  lfo.connect(lfoDepth).connect(swell.gain);
  const lfo2 = c.createOscillator();
  lfo2.frequency.value = 0.07;
  const lfo2Depth = c.createGain();
  lfo2Depth.gain.value = 320;
  lfo2.connect(lfo2Depth).connect(lp.frequency);
  src.connect(lp).connect(swell).connect(ambientBus);
  // Lớp bọt sóng: tiếng xì nhẹ ở dải cao
  const src2 = c.createBufferSource();
  src2.buffer = noise(c);
  src2.loop = true;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const foam = c.createGain();
  foam.gain.value = 0.08;
  const foamDepth = c.createGain();
  foamDepth.gain.value = 0.06; // bọt dâng theo cùng nhịp sóng
  lfo.connect(foamDepth).connect(foam.gain);
  src2.connect(hp).connect(foam).connect(ambientBus);
  [src, src2, lfo, lfo2].forEach((n) => n.start());
  ambientNodes = [src, src2, lfo, lfo2];
  ambientBus.gain.setTargetAtTime(cfg.ambientVolume * 0.6, c.currentTime, 0.8);
}

function stopAmbient() {
  if (!ctx || !ambientBus) return;
  ambientBus.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  const nodes = ambientNodes;
  ambientNodes = [];
  setTimeout(() => nodes.forEach((n) => (n as AudioScheduledSourceNode).stop?.()), 1500);
}
