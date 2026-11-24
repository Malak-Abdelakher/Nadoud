// ===== EDIT THIS =====
document.getElementById("friendName").textContent = "Nadoudddd";
const SLIDE_SECONDS = 3;

const MESSAGE = {
  title: "To my forever bestie 💌",
  text:  "Happy Birthday! Thank you for every laugh, every adventure and every moment we've shared.\nI'm so lucky to have you in my life, and I will always love to annoy you.",
  question: "Do you love me? Try clicking No and see what happens 😏",
  yes: "Yes 💖",
  no:  "No",
  yesReply: "Yaaay! I knew it! 🥳 Happy Birthday!",
  noReply:  "Nice try 😏 the answer is Yes!"
};
// =====================

const envelope = document.getElementById("envelope");
const intro    = document.getElementById("intro");
const gallery  = document.getElementById("gallery");
const heart    = document.getElementById("heart");
const cards    = [...heart.querySelectorAll(".glass")];

/* ---------- envelope ---------- */
function openLetter() {
  if (envelope.classList.contains("open")) return;
  envelope.classList.add("open");
  setTimeout(() => intro.classList.add("leaving"), 1100);
  setTimeout(() => {
    intro.style.display = "none";
    gallery.classList.remove("hidden");
    layoutHeart();                       // cards start at the center...
    requestAnimationFrame(() => requestAnimationFrame(flyOut)); // ...then fly out
  }, 1800);
}
envelope.addEventListener("click", openLetter);
envelope.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") openLetter();
});

/* ---------- heart layout ---------- */
function heartPoint(t) {                 // classic heart curve, mapped to 0-100 %
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { left: 50 + (x / 17) * 40, top: 50 - ((y + 2.5) / 14.5) * 40 };
}

// more than 12 photos -> an outer heart plus a smaller inner heart
const innerCount = cards.length > 12 ? Math.floor(cards.length * 0.35) : 0;
const outerCount = cards.length - innerCount;

function layoutHeart() {
  const size = heart.clientWidth;
  const w = size * Math.min(0.26, 0.52 / Math.sqrt(cards.length)) * (innerCount ? 1.05 : 1);
  cards.forEach((card, i) => {
    card.style.setProperty("--w", w + "px");
    if (card.classList.contains("placed")) place(card, i);
  });
}
function place(card, i) {
  let p;
  if (i < outerCount) {
    p = heartPoint(Math.PI + (i / outerCount) * 2 * Math.PI);
  } else {
    const j = i - outerCount;
    const q = heartPoint(Math.PI + ((j + 0.5) / innerCount) * 2 * Math.PI);
    p = { left: 50 + (q.left - 50) * 0.5, top: 48 + (q.top - 50) * 0.5 };
  }
  card.style.left = p.left + "%";
  card.style.top  = p.top + "%";
}
function flyOut() {
  cards.forEach((card, i) => {
    card.style.transitionDelay = i * 90 + "ms";
    card.classList.add("placed");
    place(card, i);
  });
  setTimeout(() => {
    cards.forEach(c => c.style.transitionDelay = "0ms");
    heart.classList.add("beat");
  }, cards.length * 90 + 900);
}
window.addEventListener("resize", layoutHeart);

/* ---------- slideshow ---------- */
const ss     = document.getElementById("slideshow");
const ssImg  = document.getElementById("ssImg");
const ssCap  = document.getElementById("ssCap");
const ssCnt  = document.getElementById("ssCount");
const ssPlay = document.getElementById("ssPlay");
const slides = cards.map(c => ({
  src: c.querySelector("img").getAttribute("src"),
  alt: c.querySelector("img").alt,
  caption: c.dataset.text || ""
}));
let idx = 0, timer = null;

function show(i) {
  idx = (i + slides.length) % slides.length;
  ssImg.classList.add("fade");
  setTimeout(() => {
    ssImg.src = slides[idx].src;
    ssImg.alt = slides[idx].alt;
    ssCap.textContent = slides[idx].caption;
    ssCnt.textContent = (idx + 1) + " / " + slides.length;
    ssImg.classList.remove("fade");
  }, 250);
}
function play()  { pause(); timer = setInterval(() => show(idx + 1), SLIDE_SECONDS * 1000); ssPlay.textContent = "❚❚"; }
function pause() { clearInterval(timer); timer = null; ssPlay.textContent = "▶"; }
function openShow(i = 0) {
  heart.classList.remove("beat");
  ss.classList.remove("hidden");
  show(i); play();
}
function closeShow() {
  pause();
  ss.classList.add("hidden");
  heart.classList.add("beat");
}

document.getElementById("playBtn").addEventListener("click", () => openShow(0));
cards.forEach((c, i) => c.addEventListener("click", () => openShow(i)));
document.getElementById("ssNext").addEventListener("click", () => { show(idx + 1); if (timer) play(); });
document.getElementById("ssPrev").addEventListener("click", () => { show(idx - 1); if (timer) play(); });
ssPlay.addEventListener("click", () => timer ? pause() : play());
document.getElementById("ssClose").addEventListener("click", closeShow);
document.addEventListener("keydown", e => {
  if (ss.classList.contains("hidden")) return;
  if (e.key === "ArrowRight") show(idx + 1);
  if (e.key === "ArrowLeft")  show(idx - 1);
  if (e.key === "Escape")     closeShow();
});

// swipe on phones
let sx = 0;
ss.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
ss.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
}, { passive: true });


/* ---------- message: Yes / No ---------- */
const msg      = document.getElementById("msg");
const yesBtn   = document.getElementById("yesBtn");
const noBtn    = document.getElementById("noBtn");
const replyEl  = document.getElementById("reply");
const answers  = document.getElementById("answers");
let noHome = null, noTries = 0;

document.getElementById("msgTitle").textContent    = MESSAGE.title;
document.getElementById("msgText").textContent     = MESSAGE.text;
document.getElementById("msgQuestion").textContent = MESSAGE.question;
yesBtn.textContent = MESSAGE.yes;
noBtn.textContent  = MESSAGE.no;

function openMsg() { heart.classList.remove("beat"); msg.classList.remove("hidden"); }
function closeMsg() {
  msg.classList.add("hidden");
  heart.classList.add("beat");
  resetNo(); replyEl.textContent = ""; answers.style.display = "";
}
function resetNo() {
  noBtn.classList.remove("dodge");
  noBtn.style.left = noBtn.style.top = "";
  noBtn.style.transform = "";
  noBtn.style.display = "";
  yesBtn.style.transform = "";
  noTries = 0;
}
document.getElementById("msgBtn").addEventListener("click", openMsg);
document.getElementById("msgClose").addEventListener("click", closeMsg);

// the "No" button runs away, then shrinks; after a few tries it gives in
function dodge(e) {
  e.preventDefault();
  noTries++;
  if (noTries > 6) { replyEl.textContent = MESSAGE.noReply; noBtn.style.display = "none"; return; }
  const r = noBtn.getBoundingClientRect();
  noBtn.classList.add("dodge");
  const x = Math.random() * (window.innerWidth  - r.width  - 20) + 10;
  const y = Math.random() * (window.innerHeight - r.height - 20) + 10;
  noBtn.style.left = x + "px";
  noBtn.style.top  = y + "px";
  noBtn.style.transform = "scale(" + Math.max(0.5, 1 - noTries * 0.08) + ")";
  yesBtn.style.transform = "scale(" + (1 + noTries * 0.1) + ")";
}
noBtn.addEventListener("mouseenter", dodge);
noBtn.addEventListener("touchstart", dodge, { passive: false });
noBtn.addEventListener("click", dodge);

yesBtn.addEventListener("click", () => {
  answers.style.display = "none";
  noBtn.style.display = "none";
  replyEl.textContent = MESSAGE.yesReply;
  for (let i = 0; i < 60; i++) {
    const c = document.createElement("span");
    c.className = "confetti";
    c.textContent = ["💖","🎉","🎂","✨","💗","🎈"][i % 6];
    c.style.left = Math.random() * 100 + "vw";
    c.style.fontSize = 16 + Math.random() * 22 + "px";
    c.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
    c.style.animationDelay = Math.random() * 1.2 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 7000);
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !msg.classList.contains("hidden")) closeMsg();
});