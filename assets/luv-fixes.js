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

  .manifesto {
    isolation: isolate;
  }

  .manifesto > p,
  .manifesto > h2 {
    z-index: 3;
    pointer-events: none;
  }

  .manifesto > p {
    transform: translateY(10px);
  }

  .manifesto > h2 {
    margin-top: 34px !important;
  }

  .manifesto-signal {
    --flight-y: 0px;
    --flight-tilt: 0deg;
    z-index: 5;
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
    filter: drop-shadow(0 0 13px #aa62ffcc) drop-shadow(0 0 24px #c9ff5340);
  }

  .manifesto-signal.is-flight {
    will-change: transform;
  }

  .manifesto-signal.is-flight i {
    animation: none !important;
    opacity: 1 !important;
    transform: scaleY(1) !important;
  }

  .manifesto-signal.is-crashed {
    filter: drop-shadow(0 0 13px #c9ff53aa);
  }

  .flappy-field {
    z-index: 1;
    pointer-events: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .flappy-score {
    z-index: 4;
    position: absolute;
    top: 38px;
    left: 50%;
    min-width: 210px;
    transform: translateX(-50%);
    color: #b4aabd;
    font: 9px/1.2 monospace;
    letter-spacing: .2em;
    text-align: center;
    text-transform: uppercase;
    opacity: 0;
    transition: opacity .25s ease, color .25s ease;
  }

  .manifesto.is-game-active .flappy-score,
  .manifesto.is-game-over .flappy-score {
    opacity: 1;
  }

  .manifesto.is-game-over .flappy-score {
    color: var(--acid);
  }

  .flappy-obstacle {
    --gap-top: 95px;
    --gap-bottom: 225px;
    position: absolute;
    top: 0;
    left: 0;
    width: 42px;
    height: 100%;
    will-change: transform;
    opacity: .72;
  }

  .flappy-obstacle span {
    position: absolute;
    left: 0;
    width: 100%;
    border: 1px solid #aa62ff5c;
    background: linear-gradient(90deg, #aa62ff0a, #aa62ff1f 70%, #c9ff5317);
    box-shadow: inset 0 0 22px #aa62ff0d, 0 0 18px #aa62ff0d;
  }

  .flappy-obstacle .flappy-top {
    top: 0;
    height: var(--gap-top);
    border-top: 0;
  }

  .flappy-obstacle .flappy-bottom {
    top: var(--gap-bottom);
    bottom: 0;
    border-bottom: 0;
  }

  .flappy-obstacle span::after {
    content: "";
    position: absolute;
    left: -5px;
    width: calc(100% + 10px);
    height: 5px;
    border: 1px solid #c9ff536b;
    background: #100b18;
    box-shadow: 0 0 12px #aa62ff42;
  }

  .flappy-obstacle .flappy-top::after { bottom: -1px; }
  .flappy-obstacle .flappy-bottom::after { top: -1px; }

  @media (max-width: 580px) {
    .project-card.project-artistico .project-cover {
      background-color: #030204;
      background-position: center !important;
      background-repeat: no-repeat;
      background-size: contain !important;
    }

    .manifesto > p {
      transform: translateY(9px);
    }

    .manifesto > h2 {
      margin-top: 31px !important;
    }

    .flappy-score {
      top: 28px;
      font-size: 8px;
    }

    .flappy-obstacle {
      width: 31px;
    }
  }
`;
document.head.append(style);

let audioContext;
let sfxTimer = 0;
const gameStates = new WeakMap();

function connectTone(context, destination, startAt, config) {
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(config.from, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(config.to, startAt + config.duration);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(config.cutoff, startAt);
  filter.frequency.exponentialRampToValueAtTime(Math.max(120, config.cutoff * 0.42), startAt + config.duration);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(config.volume, startAt + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + config.duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + config.duration + 0.03);
}

function connectImpactNoise(context, destination, startAt) {
  const duration = 0.24;
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    const fade = 1 - index / data.length;
    data[index] = (Math.random() * 2 - 1) * fade * fade;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(520, startAt);
  filter.frequency.exponentialRampToValueAtTime(140, startAt + duration);
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(0.18, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(startAt);
}

async function playCinematicSfx(signal) {
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

  const startAt = audioContext.currentTime + 0.008;
  const compressor = audioContext.createDynamicsCompressor();
  const master = audioContext.createGain();
  compressor.threshold.value = -20;
  compressor.knee.value = 16;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.22;
  master.gain.value = 0.82;
  compressor.connect(master);
  master.connect(audioContext.destination);

  connectTone(audioContext, compressor, startAt, {
    type: "sine", from: 94, to: 45, duration: 0.52, volume: 0.5, cutoff: 1200,
  });
  connectTone(audioContext, compressor, startAt, {
    type: "triangle", from: 188, to: 76, duration: 0.38, volume: 0.18, cutoff: 1800,
  });
  connectTone(audioContext, compressor, startAt + 0.015, {
    type: "sine", from: 376, to: 132, duration: 0.25, volume: 0.07, cutoff: 2400,
  });
  connectImpactNoise(audioContext, compressor, startAt);

  signal.classList.add("is-sfx-playing");
  window.clearTimeout(sfxTimer);
  sfxTimer = window.setTimeout(() => signal.classList.remove("is-sfx-playing"), 460);
}

function updateScore(state, gameOver = false) {
  const score = String(state.score).padStart(2, "0");
  const isEnglish = document.documentElement.lang === "en";
  state.scoreElement.textContent = gameOver
    ? `${isEnglish ? "PRECISION" : "PRECISIÓN"} ${score} · ${isEnglish ? "TAP TO RETRY" : "TOCÁ PARA REINTENTAR"}`
    : `${isEnglish ? "PRECISION" : "PRECISIÓN"} · ${score}`;
}

function clearObstacles(state) {
  state.obstacles.forEach((obstacle) => obstacle.element.remove());
  state.obstacles.length = 0;
}

function createObstacle(state) {
  const sectionHeight = state.section.clientHeight;
  const signalCenter = state.signal.offsetTop + state.signal.offsetHeight / 2;
  const gapHeight = Math.max(112, Math.min(146, sectionHeight * 0.24));
  const centerMin = Math.max(gapHeight / 2 + 18, signalCenter - state.topLimit + 10);
  const centerMax = Math.min(sectionHeight - gapHeight / 2 - 45, signalCenter + 14);
  const gapCenter = centerMin + Math.random() * Math.max(1, centerMax - centerMin);
  const gapTop = Math.round(gapCenter - gapHeight / 2);
  const gapBottom = Math.round(gapCenter + gapHeight / 2);
  const element = document.createElement("div");
  element.className = "flappy-obstacle";
  element.style.setProperty("--gap-top", `${gapTop}px`);
  element.style.setProperty("--gap-bottom", `${gapBottom}px`);
  element.innerHTML = '<span class="flappy-top"></span><span class="flappy-bottom"></span>';
  state.field.append(element);

  state.obstacles.push({
    element,
    gapTop,
    gapBottom,
    passed: false,
    width: element.offsetWidth,
    x: -element.offsetWidth - 8,
  });
}

function finishGame(state) {
  if (!state.active) return;
  state.active = false;
  state.gameOver = true;
  state.signal.classList.add("is-crashed");
  state.section.classList.remove("is-game-active");
  state.section.classList.add("is-game-over");
  updateScore(state, true);
}

function moveObstacles(state, frameScale, timestamp) {
  const sectionWidth = state.section.clientWidth;
  const speed = Math.max(105, sectionWidth / 4.8);
  const signalRect = state.signal.getBoundingClientRect();
  const sectionRect = state.section.getBoundingClientRect();
  const birdLeft = signalRect.left - sectionRect.left + 5;
  const birdRight = signalRect.right - sectionRect.left - 5;
  const birdTop = signalRect.top - sectionRect.top + 4;
  const birdBottom = signalRect.bottom - sectionRect.top - 4;

  if (timestamp - state.lastSpawn > 1850) {
    createObstacle(state);
    state.lastSpawn = timestamp;
  }

  state.obstacles.forEach((obstacle) => {
    obstacle.x += (speed / 60) * frameScale;
    obstacle.element.style.transform = `translate3d(${obstacle.x.toFixed(2)}px, 0, 0)`;

    const overlapsX = birdRight > obstacle.x && birdLeft < obstacle.x + obstacle.width;
    if (overlapsX && (birdTop < obstacle.gapTop || birdBottom > obstacle.gapBottom)) {
      finishGame(state);
    }

    if (!obstacle.passed && obstacle.x > birdRight) {
      obstacle.passed = true;
      state.score += 1;
      updateScore(state);
    }
  });

  state.obstacles = state.obstacles.filter((obstacle) => {
    if (obstacle.x <= sectionWidth + 70) return true;
    obstacle.element.remove();
    return false;
  });
}

function animateGame(state, timestamp) {
  const frameScale = Math.min(Math.max((timestamp - state.lastTimestamp) / 16.67, 0.15), 2);
  state.lastTimestamp = timestamp;
  state.velocity += 0.34 * frameScale;
  state.y += state.velocity * frameScale;

  if (state.y < -state.topLimit) {
    state.y = -state.topLimit;
    state.velocity = 0.9;
  }

  if (state.y >= 0) {
    state.y = 0;
    state.velocity = 0;
  }

  if (state.active) moveObstacles(state, frameScale, timestamp);

  const tilt = Math.max(-17, Math.min(13, state.velocity * 2.25));
  state.signal.style.setProperty("--flight-y", `${state.y.toFixed(2)}px`);
  state.signal.style.setProperty("--flight-tilt", `${tilt.toFixed(2)}deg`);

  if (state.active || state.y < 0) {
    state.frame = window.requestAnimationFrame((time) => animateGame(state, time));
  } else {
    state.frame = 0;
  }
}

function resetGame(state) {
  clearObstacles(state);
  state.score = 0;
  state.gameOver = false;
  state.active = true;
  state.lastSpawn = performance.now() - 500;
  state.section.classList.remove("is-game-over");
  state.section.classList.add("is-game-active");
  state.signal.classList.remove("is-crashed");
  updateScore(state);
}

function createGame(signal) {
  const section = signal.closest(".manifesto");
  const field = document.createElement("div");
  const scoreElement = document.createElement("div");
  field.className = "flappy-field";
  field.setAttribute("aria-hidden", "true");
  scoreElement.className = "flappy-score";
  scoreElement.setAttribute("aria-live", "polite");
  section.prepend(field);
  section.append(scoreElement);

  const state = {
    active: false,
    field,
    frame: 0,
    gameOver: false,
    lastSpawn: 0,
    lastTimestamp: performance.now(),
    obstacles: [],
    score: 0,
    scoreElement,
    section,
    signal,
    topLimit: window.matchMedia("(max-width: 580px)").matches ? 138 : 178,
    velocity: 0,
    y: 0,
  };
  updateScore(state);
  gameStates.set(signal, state);
  return state;
}

function flap(signal) {
  const state = gameStates.get(signal) || createGame(signal);
  if (!state.active) resetGame(state);

  signal.classList.add("is-flight");
  state.velocity = -9.1;
  state.lastTimestamp = performance.now();
  if (!state.frame) {
    state.frame = window.requestAnimationFrame((time) => animateGame(state, time));
  }

  void playCinematicSfx(signal);
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
      ? "Play precision game and cinematic sound"
      : "Jugar precisión y reproducir sonido cinematográfico",
  );
  createGame(signal);
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
