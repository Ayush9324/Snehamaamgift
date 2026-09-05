const teachername = "Dr.Sneha";
const teacherGreeting = `${teachername} Ma’am`;
document.querySelectorAll("[data-teacher-name]").forEach((element) => {
  element.textContent = teacherGreeting;
});
document.querySelector("[data-teacher-greeting]").textContent = `${teacherGreeting}!`;

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
const resetScroll = () => window.scrollTo(0, 0);
window.addEventListener("load", () => setTimeout(resetScroll, 0));
window.addEventListener("pageshow", () => setTimeout(resetScroll, 0));

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.14 });
revealItems.forEach((item) => revealObserver.observe(item));

document.querySelectorAll(".magic-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("is-read");
    card.querySelector("i").textContent = card.classList.contains("is-read") ? "a little magic ✦" : "tap me";
  });
});

const envelope = document.querySelector("#envelope");
const strip = document.querySelector("#tearStrip");
const instruction = document.querySelector("#tearInstruction");
const celebration = document.querySelector("#celebration");
let dragging = false;
let progress = 0;
let lastTick = 0;
let audioContext;

function tick() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  audioContext ||= new AudioCtor();
  if (audioContext.state === "suspended") audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(520, audioContext.currentTime + .035);
  gain.gain.setValueAtTime(.045, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .045);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + .05);
}

function setProgress(next) {
  progress = Math.max(0, Math.min(100, next));
  const pathLeft = envelope.clientWidth * .13;
  const pathWidth = envelope.clientWidth * .74;
  const pathHeight = envelope.clientHeight * .47;
  const pathPosition = progress / 100;
  const pathDepth = pathPosition <= .5 ? pathPosition * 2 : (1 - pathPosition) * 2;
  const pathX = pathLeft + pathWidth * pathPosition;
  const pathY = envelope.clientHeight * .26 + pathHeight * pathDepth;
  const slope = pathPosition <= .5 ? pathHeight / (pathWidth / 2) : -pathHeight / (pathWidth / 2);
  const angle = Math.atan(slope) * 180 / Math.PI;
  strip.style.left = `${pathX - strip.offsetWidth / 2}px`;
  strip.style.top = `${pathY - strip.offsetHeight / 2}px`;
  strip.style.transform = `rotate(${angle}deg)`;
  strip.setAttribute("aria-valuenow", Math.round(progress));
  const crossed = Math.min(8, Math.ceil(progress / 12.5));
  if (crossed > lastTick) {
    while (lastTick < crossed) {
      lastTick += 1;
      tick();
    }
  }
  if (progress >= 100) finishTear();
}

function finishTear() {
  if (envelope.classList.contains("open")) return;
  dragging = false;
  progress = 100;
  strip.style.transform = "rotate(0deg)";
  strip.classList.add("is-torn");
  envelope.classList.add("open");
  instruction.textContent = "A little note, just for you ✦";
  celebration.classList.add("is-visible");
}

function updateFromPointer(event) {
  const point = event.clientX ?? event.touches?.[0]?.clientX;
  if (point == null) return;
  const bounds = envelope.getBoundingClientRect();
  const start = bounds.left + bounds.width * .11;
  const available = bounds.width - strip.offsetWidth - bounds.width * .11;
  setProgress(((point - start - strip.offsetWidth / 2) / available) * 100);
}

strip.addEventListener("pointerdown", (event) => {
  if (envelope.classList.contains("open")) return;
  dragging = true;
  lastTick = Math.floor(progress / 12.5);
  strip.setPointerCapture(event.pointerId);
  updateFromPointer(event);
});
strip.addEventListener("pointermove", (event) => {
  if (dragging) updateFromPointer(event);
});
strip.addEventListener("pointerup", (event) => {
  if (dragging) updateFromPointer(event);
  dragging = false;
  if (progress >= 95) finishTear();
});
strip.addEventListener("pointercancel", () => { dragging = false; });
strip.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    setProgress(progress + (event.key === "ArrowRight" ? 8 : -8));
  }
});
window.addEventListener("resize", () => { if (!envelope.classList.contains("open")) setProgress(progress); });
