/**
 * UI audio helpers. Lightweight cues use Web Audio; the panel/menu open cue
 * decodes the app-local MP3 in /public/audio into that same unlocked context.
 */
let ctx: AudioContext | null = null;
let muted = false;
let panelOpenBuffer: AudioBuffer | null = null;
let panelCloseBuffer: AudioBuffer | null = null; // the open cue's portion, reversed (used for close)
let panelOpenLoad: Promise<AudioBuffer | null> | null = null;
let panelOpenSource: AudioBufferSourceNode | null = null; // single panel cue at a time (open OR close)

const PANEL_OPEN_SRC = '/audio/panel-open.mp3';
const PANEL_OPEN_SECONDS = 0.9; // portion of the source buffer to use (in buffer time)
const PANEL_OPEN_RATE = 0.8; // playback speed — < 1 = slower / lower pitch (real length = SECONDS / RATE)

/** Mute/unmute all UI sound (toggled with the M key). */
export function setAudioMuted(m: boolean): void {
  muted = m;
  if (m && panelOpenSource) {
    try {
      panelOpenSource.stop();
    } catch {
      /* already stopped */
    }
    panelOpenSource = null;
  }
}
export function isAudioMuted(): boolean {
  return muted;
}

function audioCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function primeAudioContext(c: AudioContext): void {
  void c.resume?.();
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    g.gain.value = 0;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.03);
  } catch {
    /* ignore */
  }
}

// Browsers block audio until a user gesture. Safari/iOS need an actual sound node played
// inside the gesture — resume() alone leaves the clock frozen so scheduled chimes never
// fire. So on the first interaction (e.g. the mission "BEGIN" click) we resume AND play a
// 0-gain blip to truly unlock, then the select / return chimes work from the first click.
function unlockOnGesture(): void {
  const c = audioCtx();
  if (!c) return;
  primeAudioContext(c);
  void loadPanelOpen(c);
  if (c.state === 'running') {
    window.removeEventListener('pointerdown', unlockOnGesture);
    window.removeEventListener('keydown', unlockOnGesture);
    window.removeEventListener('touchstart', unlockOnGesture);
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockOnGesture);
  window.addEventListener('keydown', unlockOnGesture);
  window.addEventListener('touchstart', unlockOnGesture, { passive: true });
}

/**
 * Node selection feedback is intentionally silent. The selected-node state still
 * drives the visual focus and panel behavior.
 */
export function playSelect(): void {
  return;
}

function loadPanelOpen(c: AudioContext): Promise<AudioBuffer | null> {
  if (panelOpenBuffer) return Promise.resolve(panelOpenBuffer);
  if (panelOpenLoad) return panelOpenLoad;
  panelOpenLoad = fetch(PANEL_OPEN_SRC)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${PANEL_OPEN_SRC}`);
      return res.arrayBuffer();
    })
    .then((data) => c.decodeAudioData(data))
    .then((buffer) => {
      panelOpenBuffer = buffer;
      return buffer;
    })
    .catch(() => null);
  return panelOpenLoad;
}

/** Build a buffer holding the first `PANEL_OPEN_SECONDS` of `buffer`, REVERSED — so the close cue
 * is the open cue's audio played backwards (its sonic "opposite"). Cached after the first build. */
function reversedPanelBuffer(c: AudioContext, buffer: AudioBuffer): AudioBuffer {
  if (panelCloseBuffer) return panelCloseBuffer;
  const len = Math.min(Math.floor(PANEL_OPEN_SECONDS * buffer.sampleRate), buffer.length);
  const rev = c.createBuffer(buffer.numberOfChannels, len, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = rev.getChannelData(ch);
    for (let i = 0; i < len; i++) dst[i] = src[len - 1 - i];
  }
  panelCloseBuffer = rev;
  return rev;
}

// Play a panel cue (open or its reversed close) — slowed, with a gentle fade-out (and an optional
// short fade-in, used by the reversed close to avoid a click on its abrupt onset).
function startPanelCue(c: AudioContext, buffer: AudioBuffer, fadeIn = 0): void {
  if (panelOpenSource) {
    try {
      panelOpenSource.stop();
    } catch {
      /* already stopped */
    }
  }

  const source = c.createBufferSource();
  const gain = c.createGain();
  const t = c.currentTime;
  // play it back slower (lower pitch, stretched) — `bufferPortion` is BUFFER time, but at a
  // slower rate it occupies more REAL time, so the fade/stop are scheduled against `realDuration`.
  const rate = PANEL_OPEN_RATE;
  const bufferPortion = Math.min(PANEL_OPEN_SECONDS, buffer.duration);
  const realDuration = bufferPortion / rate;

  source.buffer = buffer;
  source.playbackRate.value = rate;
  // gentle fade-out over the tail (in real time); capped to half the cue for very short clips
  const fade = Math.min(0.55, realDuration * 0.45);
  // exponential ramps read as a natural fade to the ear (linear sounds like an abrupt cut)
  if (fadeIn > 0) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(1.0, t + fadeIn);
  } else {
    gain.gain.setValueAtTime(1.0, t);
  }
  gain.gain.setValueAtTime(1.0, t + Math.max(fadeIn, realDuration - fade));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + realDuration);

  source.connect(gain);
  gain.connect(c.destination);
  source.start(t, 0, bufferPortion);
  source.stop(t + realDuration + 0.02);
  panelOpenSource = source;
  source.onended = () => {
    if (panelOpenSource === source) panelOpenSource = null;
    try {
      source.disconnect();
      gain.disconnect();
    } catch {
      /* already torn down */
    }
  };
}

/**
 * Sci-fi panel/menu open. Uses the first 0.9 seconds of the supplied MP3, slowed;
 * replaying a panel open restarts the cue from the beginning.
 */
export function playPanelOpen(): void {
  if (muted) return;
  const c = audioCtx();
  if (!c) return;
  primeAudioContext(c);
  if (panelOpenBuffer) {
    startPanelCue(c, panelOpenBuffer);
    return;
  }
  void loadPanelOpen(c).then((buffer) => {
    if (!muted && buffer) startPanelCue(c, buffer);
  });
}

/**
 * Sci-fi panel/menu CLOSE — the open cue played in REVERSE (its sonic opposite), slowed, with a
 * short fade-in so the reversed onset doesn't click. Builds the reversed buffer lazily on first use.
 */
export function playPanelClose(): void {
  if (muted) return;
  const c = audioCtx();
  if (!c) return;
  primeAudioContext(c);
  if (panelOpenBuffer) {
    startPanelCue(c, reversedPanelBuffer(c, panelOpenBuffer), 0.05);
    return;
  }
  void loadPanelOpen(c).then((buffer) => {
    if (!muted && buffer) startPanelCue(c, reversedPanelBuffer(c, buffer), 0.05);
  });
}

/**
 * The "return / overview" sound — a very slow, deep "whop": one low sine that
 * sweeps downward while the lowpass closes, giving a soft round descending
 * whoomp. No harsh attack; long mellow tail.
 */
export function playReturn(): void {
  if (muted) return;
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;

  const o = c.createOscillator();
  o.type = 'sine';
  // slow descending "whoomp" kept in the audible mid-range (laptop speakers roll off
  // below ~150 Hz, so a deep tail would be inaudible)
  o.frequency.setValueAtTime(420, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 1.0);

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(2200, t);
  lp.frequency.exponentialRampToValueAtTime(720, t + 1.0); // close the filter as it sinks
  lp.Q.value = 0.7;

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.28, t + 0.08); // soft round attack
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5); // long mellow tail

  o.connect(lp);
  lp.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + 1.56);
  o.onended = () => {
    try {
      g.disconnect();
      lp.disconnect();
    } catch {
      /* already torn down */
    }
  };
}
