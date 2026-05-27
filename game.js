// ====== CONFIG ======
const GRAVITY = 0.4;
const FLAP_STRENGTH = -7;
const GAP_HEIGHT = 140;
const PIPE_SPEED = 2;
const PIPE_INTERVAL = 120;
const HEART_LIFETIME = 60;

// ====== JSONBIN CONFIG ======
const BIN_ID = "6a16e56e8ef04f4538211ed5";
const MASTER_KEY = "$2a$10$msxHGavinuXEQqYiQHKCte2VN75FAT4TUMqtBY6MxCTcDLc.yYyi2";

const JSONBIN_BASE = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const JSONBIN_GET = `${JSONBIN_BASE}/latest`;

// ====== PROXY FALLBACK CHAIN ======
const PROXIES = [
  url => `https://corsproxy.io/?${url}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
];

// ====== CANVAS ======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ====== GAME STATE ======
let bird;
let pipes = [];
let hearts = [];
let frame = 0;
let score = 0;
let gameRunning = false;
let gameOver = false;

let scores = { Allister: 0, Luca: 0 };
let currentPlayer = null;

let currentMessage = "";
let messageTimer = 0;

// ====== PROXY FETCH WRAPPER ======
async function proxyFetch(url, options = {}) {
  for (const wrap of PROXIES) {
    const proxied = wrap(url);
    try {
      const res = await fetch(proxied, options);
      if (res.ok) return res;
    } catch (e) {}
  }
  throw new Error("All proxies failed");
}

// ====== LOAD SCORES ======
async function loadScores() {
  try {
    const res = await proxyFetch(JSONBIN_GET);
    const data = await res.json();
    if (data && data.record) scores = data.record;
  } catch (e) {
    console.log("Failed to load scores:", e);
    scores = { Allister: 0, Luca: 0 };
  }
}

// ====== SAVE SCORES ======
async function saveScores() {
  try {
    await proxyFetch(JSONBIN_BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify(scores)
    });
  } catch (e) {
    console.log("Failed to save scores:", e);
  }
}

// ====== BIRD COLORS ======
const birdFlag = {
  Allister: {
    top: "#FFB07C",
    mid: "#FFFFFF",
    bot: "#8EE28A",
    wing: "#FFE2C6",
    blush: "#FFB6C1",
    eye: "#0000AA"
  },
  Luca: {
    top: "#FF8A9A",
    mid: "#FFFFFF",
    bot: "#8FD3A0",
    wing: "#FFD6E0",
    blush: "#FFB6C1",
    eye: "#000000"
  }
};

// ====== WHISPERS ======
const messages = [
  "Szeretlek", "Hiányzol", "Fontos vagy", "Kedvellek", "Veled jó",
  "You matter", "You’re lovely", "You’re warm", "You’re special",
  "You make me smile", "You feel like home", "You’re my light"
];

// ====== PLAYER SELECTION ======
function selectPlayer(name) {
  currentPlayer = name;
  document.getElementById("currentPlayerLabel").textContent = "Player: " + name;
  document.getElementById("playerOverlay").classList.add("hidden");
  resetGame();
  startGame();
}

// ====== UI LABELS ======
function updateTopPlayerLabel() {
  const top = scores.Allister > scores.Luca ? "Allister" : "Luca";
  const topScore = Math.max(scores.Allister, scores.Luca);
  document.getElementById("topPlayerLabel").textContent =
    `Top: ${top} (${topScore})`;
}

function updateScoreLabel() {
  document.getElementById("currentScoreLabel").textContent = "Score: " + score;
}

// ====== BIRD ======
function resetBird() {
  bird = {
    x: canvas.width * 0.3,
    y: canvas.height / 2,
    radius: 14,
    velocity: 0
  };
}

function flap() {
  if (!gameRunning || gameOver) return;
  bird.velocity = FLAP_STRENGTH;
  spawnHeart(bird.x, bird.y);
}

// ====== PIPES ======
function spawnPipe() {
  const min = 60;
  const max = canvas.height - GAP_HEIGHT - 60;
  const top = Math.floor(Math.random() * (max - min)) + min;

  pipes.push({
    x: canvas.width,
    top,
    bottom: top + GAP_HEIGHT,
    passed: false
  });
}

// ====== HEARTS ======
function spawnHeart(x, y, big = false) {
  const count = big ? 25 : 6;
  const size = big ? 10 : 6;

  for (let i = 0; i < count; i++) {
    hearts.push({
      x,
      y,
      size,
      vx: (Math.random() - 0.5) * (big ? 4 : 2),
      vy: (Math.random() - 0.5) * (big ? 4 : 2),
      life: HEART_LIFETIME * (big ? 2 : 1)
    });
  }
}

// ====== MESSAGES ======
function triggerMessage() {
  if (Math.random() < 0.35) {
    currentMessage = messages[Math.floor(Math.random() * messages.length)];
    messageTimer = 120;
  }
}

// ====== GAME FLOW ======
function startGame() {
  if (!currentPlayer) return;
  gameRunning = true;
  gameOver = false;
  score = 0;
  pipes = [];
  hearts = [];
  frame = 0;
  resetBird();
  updateScoreLabel();
}

function endGame() {
  gameRunning = false;
  gameOver = true;

  const prevHigh = scores[currentPlayer] || 0;

  if (score > prevHigh) {
    scores[currentPlayer] = score;
    saveScores();
    updateTopPlayerLabel();
    spawnHeart(bird.x, bird.y, true);
  }

  setTimeout(() => {
    document.getElementById("playerOverlay").classList.remove("hidden");
    currentPlayer = null;
    document.getElementById("currentPlayerLabel").textContent = "Player: —";
  }, 1200);
}

function resetGame() {
  score = 0;
  pipes = [];
  hearts = [];
  frame = 0;
  gameOver = false;
  resetBird();
}

// ====== UPDATE ======
function update() {
  if (!gameRunning) return;

  frame++;

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  if (frame % PIPE_INTERVAL === 0) spawnPipe();

  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= PIPE_SPEED;

    if (!p.passed && p.x + 70 < bird.x) {
      p.passed = true;
      score++;
      updateScoreLabel();
      triggerMessage();
      spawnHeart(bird.x, bird.y);
    }

    if (p.x + 70 < 0) pipes.splice(i, 1);
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.x += h.vx;
    h.y += h.vy;
    h.life--;
    if (h.life <= 0) hearts.splice(i, 1);
  }

  if (messageTimer > 0) messageTimer--;

  if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height) {
    endGame();
  }

  for (const p of pipes) {
    if (
      bird.x + bird.radius > p.x &&
      bird.x - bird.radius < p.x + 70 &&
      (bird.y - bird.radius < p.top || bird.y + bird.radius > p.bottom)
    ) {
      endGame();
    }
  }
}

// ====== DRAW ======
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#ffd6e8");
  grad.addColorStop(0.5, "#e8e0ff");
  grad.addColorStop(1, "#d6f3ff");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPipes() {
  ctx.fillStyle = "#ffb6d9";

  for (const p of pipes) {
    drawRoundedRect(p.x, 0, 70, p.top, 20);
    drawRoundedRect(p.x, p.bottom, 70, canvas.height - p.bottom, 20);
  }
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();
}

function drawBird() {
  if (!currentPlayer) return;

  const f = birdFlag[currentPlayer];

  ctx.save();
  ctx.translate(bird.x, bird.y);

  ctx.beginPath();
  ctx.fillStyle = f.top;
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = f.wing;
  ctx.ellipse(-10, 2, 8, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = f.blush;
  ctx.arc(6, 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = f.eye;
  ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHearts() {
  for (const h of hearts) {
    ctx.save();
    ctx.globalAlpha = h.life / HEART_LIFETIME;
    ctx.fillStyle = "#ff6fa8";

    ctx.beginPath();
    const s = h.size;
    ctx.moveTo(h.x, h.y);
    ctx.bezierCurveTo(h.x - s, h.y - s, h.x - s * 1.5, h.y + s / 2, h.x, h.y + s);
    ctx.bezierCurveTo(h.x + s * 1.5, h.y + s / 2, h.x + s, h.y - s, h.x, h.y);

    ctx.fill();
    ctx.restore();
  }
}

function drawMessage() {
  if (messageTimer <= 0) return;
  ctx.fillStyle = "#4e342e";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(currentMessage, canvas.width / 2, 70);
}

function drawGameOver() {
  if (!gameOver) return;

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "16px sans-serif";
  ctx.fillText("Tap to flap again soon", canvas.width / 2, canvas.height / 2 + 10);
}

// ====== LOOP ======
function loop() {
  update();
  drawBackground();
  drawPipes();
  drawBird();
  drawHearts();
  drawMessage();
  drawGameOver();
  requestAnimationFrame(loop);
}

// ====== INPUT ======
canvas.addEventListener("mousedown", () => {
  if (gameOver) return;
  flap();
});

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (gameOver) return;
  flap();
}, { passive: false });

// ====== INIT ======
(async function init() {
  await loadScores();
  updateTopPlayerLabel();
  resetBird();
  loop();
})();
