const style = document.createElement("style");

style.dataset.luvFixes = "true";
style.textContent = `
  .project-modal article {
    overflow-x: hidden !important;
    overflow-y: auto;
  }

  .project-modal .modal-copy {
    min-width: 0;
  }

  .manifesto-signal {
    --flight-y: 0px;
    --flight-tilt: 0deg;
    color: inherit;
    cursor: pointer;
    background: transparent;
    border: 0;
    padding: 0;
    touch-action: manipulation;
    transform: translate3d(0, var(--flight-y), 0) rotate(var(--flight-tilt));
  }

  .manifesto-signal:focus-visible {
    outline: 1px solid var(--acid);
    outline-offset: 8px;
    border-radius: 2px;
  }

  .manifesto-signal i {
    animation: 1.2s ease-in-out infinite alternate signal !important;
  }

  .manifesto-signal i:nth-child(2) { animation-delay: -.7s !important; }
  .manifesto-signal i:nth-child(3) { animation-delay: -.25s !important; }
  .manifesto-signal i:nth-child(4) { animation-delay: -.55s !important; }

  .manifesto-signal.is-sfx-playing {
    filter: drop-shadow(0 0 10px #aa62ffb3);
  }

  .manifesto-signal.is-flight {
    will-change: transform;
  }

  .manifesto-signal.is-flight i {
    animation: none !important;
    opacity: 1 !important;
    transform: scaleY(1) !important;
  }

  @media (max-width: 580px) {
    .project-card.project-artistico .project-cover {
      background-color: #030204;
      background-position: center !important;
      background-repeat: no-repeat;
      background-size: contain !important;
    }
  }
`;
document.head.append(style);

let audioContext;
let sfxIndex = 0;
const flightStates = new WeakMap();

const sfxPresets = [
  [
    [523.25, 0, 0.18, "sine", 0.055, 784, 0],
    [659.25, 0.045, 0.2, "sine", 0.04, 987.77, 0.25],
  ],
  [
    [196, 0, 0.24, "triangle", 0.06, 783.99, -0.15],
    [392, 0.07, 0.16, "sine", 0.035, 1174.66, 0.2],
  ],
  [
    [1046.5, 0, 0.3, "sine", 0.035, 1318.51, -0.35],
    [1567.98, 0.055, 0.24, "sine", 0.025, 2093, 0.35],
  ],
  [
    [146.83, 0, 0.2, "triangle", 0.07, 73.42, 0],
    [587.33, 0.035, 0.13, "sine", 0.03, 880, 0.2],
  ],
  [
    [880, 0, 0.14, "sine", 0.035, 1174.66, -0.4],
    [1174.66, 0.035, 0.16, "sine", 0.03, 1567.98, -0.1],
    [1567.98, 0.07, 0.18, "sine", 0.025, 2093, 0.25],
  ],
];

function playTone(context, startAt, frequency, delay, duration, type, volume, endFrequency, pan) {
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const toneStart = startAt + delay;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, toneStart);
  if (endFrequency !== frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), toneStart + duration);
  }

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(6500, toneStart);
  filter.Q.value = 0.7;

  gain.gain.setValueAtTime(0.0001, toneStart);
  gain.gain.exponentialRampToValueAtTime(volume, toneStart + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + duration);

  oscillator.connect(filter);
  filter.connect(gain);

  if (context.createStereoPanner) {
    const panner = context.createStereoPanner();
    panner.pan.value = pan;
    gain.connect(panner);
    panner.connect(context.destination);
  } else {
    gain.connect(context.destination);
  }

  oscillator.start(toneStart);
  oscillator.stop(toneStart + duration + 0.02);
}

async function playSfx(signal) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioContext ??= new AudioContextClass();
  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch {
      return;
    }
  }
  if (audioContext.state !== "running") return;

  const startAt = audioContext.currentTime + 0.01;
  const preset = sfxPresets[sfxIndex % sfxPresets.length];
  sfxIndex += 1;

  preset.forEach((tone) => playTone(audioContext, startAt, ...tone));
  signal.classList.add("is-sfx-playing");
  window.setTimeout(() => signal.classList.remove("is-sfx-playing"), 360);
}

function animateFlight(signal, state, timestamp) {
  const frameScale = Math.min((timestamp - state.lastTimestamp) / 16.67, 2);
  state.lastTimestamp = timestamp;
  state.velocity += 0.32 * frameScale;
  state.y += state.velocity * frameScale;

  if (state.y < -88) {
    state.y = -88;
    state.velocity = 0.7;
  }

  if (state.y >= 0) {
    state.y = 0;
    state.velocity = 0;
    state.frame = 0;
  } else {
    state.frame = window.requestAnimationFrame((time) => animateFlight(signal, state, time));
  }

  const tilt = Math.max(-14, Math.min(12, state.velocity * 2.2));
  signal.style.setProperty("--flight-y", `${state.y.toFixed(2)}px`);
  signal.style.setProperty("--flight-tilt", `${tilt.toFixed(2)}deg`);
}

function flap(signal) {
  let state = flightStates.get(signal);
  if (!state) {
    state = { frame: 0, lastTimestamp: performance.now(), velocity: 0, y: 0 };
    flightStates.set(signal, state);
  }

  signal.classList.add("is-flight");
  state.velocity = -5.8;
  state.lastTimestamp = performance.now();
  if (!state.frame) {
    state.frame = window.requestAnimationFrame((time) => animateFlight(signal, state, time));
  }

  void playSfx(signal);
}

function enhanceSignal() {
  const signal = document.querySelector(".manifesto-signal");
  if (!signal || signal.dataset.luvSfxReady) return;

  signal.dataset.luvSfxReady = "true";
  signal.removeAttribute("aria-hidden");
  signal.setAttribute("role", "button");
  signal.setAttribute("tabindex", "0");
  signal.setAttribute(
    "aria-label",
    document.documentElement.lang === "en"
      ? "Lift the signal and play a sound effect"
      : "Elevar la señal y reproducir un efecto de sonido",
  );
  signal.addEventListener("pointerdown", () => flap(signal));
  signal.addEventListener("click", (event) => {
    if (event.detail === 0) flap(signal);
  });
  signal.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    flap(signal);
  });
}

function markArtisticCard() {
  document.querySelectorAll(".project-card").forEach((card) => {
    if (card.querySelector("h3")?.textContent?.trim() === "Luv") {
      card.classList.add("project-artistico");
    }
  });
}

function applyFixes() {
  enhanceSignal();
  markArtisticCard();
}

function start() {
  applyFixes();
  new MutationObserver(applyFixes).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "complete") {
  window.setTimeout(start, 0);
} else {
  window.addEventListener("load", start, { once: true });
}
