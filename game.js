// ====== CONFIG ======
const GRAVITY = 0.4;
const FLAP_STRENGTH = -7;
const GAP_HEIGHT = 140;
const PIPE_SPEED = 2;
const PIPE_INTERVAL = 120;
const HEART_LIFETIME = 60;

// ====== FIREBASE CONFIG ======
const FIREBASE_URL = "https://flappy-love-default-rtdb.firebaseio.com/scores.json";

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

// ====== LOAD SCORES FROM FIREBASE ======
async function loadScores() {
  try {
    console.log("Loading scores from Firebase...");
    const res = await fetch(FIREBASE_URL);
    if (res.ok) {
      const data = await res.json();
      console.log("Scores from Firebase:", data);
      if (data && typeof data === 'object') {
        if (data.Allister !== undefined) scores.Allister = data.Allister;
        if (data.Luca !== undefined) scores.Luca = data.Luca;
      }
    }
  } catch (e) {
    console.log("Error loading scores:", e);
  }
  
  console.log("Final scores:", scores);
  updateLeaderboardDisplay();
  updateTopPlayerLabel();
}

// ====== SAVE SCORES TO FIREBASE ======
async function saveScores() {
  try {
    console.log("Saving scores to Firebase:", scores);
    const res = await fetch(FIREBASE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scores)
    });
    
    if (res.ok) {
      console.log("Scores saved successfully");
      updateLeaderboardDisplay();
      updateTopPlayerLabel();
    } else {
      console.log("Failed to save:", res.status);
    }
  } catch (e) {
    console.log("Error saving scores:", e);
  }
}

// ====== UPDATE LEADERBOARD DISPLAY ======
function updateLeaderboardDisplay() {
  const allisterScore = scores.Allister || 0;
  const lucaScore = scores.Luca || 0;
  console.log("Displaying scores - Allister:", allisterScore, "Luca:", lucaScore);
  document.getElementById("allisterScore").textContent = allisterScore;
  document.getElementById("lucaScore").textContent = lucaScore;
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
  "You matter", "You're lovely", "You're warm", "You're special",
  "You make me smile", "You feel like home", "You're my light", "I adore you",
  "You're perfect", "Always you", "Forever us"
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
  const allisterScore = scores.Allister || 0;
  const lucaScore = scores.Luca || 0;
  const top = allisterScore > lucaScore ? "Allister" : (lucaScore > allisterScore ? "Luca" : "Tied");
  const topScore = Math.max(allisterScore, lucaScore);
  document.getElementById("topPlayerLabel").textContent =
    `✨ ${top} is leading with ${topScore} points ✨`;
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
  const count = big ? 30 : 8;
  const size = big ? 12 : 7;

  for (let i = 0; i < count; i++) {
    hearts.push({
      x,
      y,
      size,
      vx: (Math.random() - 0.5) * (big ? 5 : 3),
      vy: (Math.random() - 0.5) * (big ? 5 : 2.5) - (big ? 2 : 0.5),
      life: HEART_LIFETIME * (big ? 2.5 : 1),
      rotation: Math.random() * Math.PI * 2
    });
  }
}

// ====== MESSAGES ======
function triggerMessage() {
  if (Math.random() < 0.4) {
    currentMessage = messages[Math.floor(Math.random() * messages.length)];
    messageTimer = 140;
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
  }, 1500);
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
    h.vy += 0.15;
    h.rotation += 0.1;
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
  grad.addColorStop(0.4, "#ffe8f0");
  grad.addColorStop(0.6, "#f0e6ff");
  grad.addColorStop(1, "#e8f4ff");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 182, 193, 0.3)";
  for (let i = 0; i < 5; i++) {
    const x = 50 + i * 60;
    const y = 20 + (Math.sin(frame * 0.01 + i) * 5);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPipes() {
  ctx.fillStyle = "rgba(255, 182, 211, 0.9)";
  ctx.shadowColor = "rgba(255, 111, 168, 0.3)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  for (const p of pipes) {
    drawRoundedRect(p.x, 0, 70, p.top, 20);
    drawRoundedRect(p.x, p.bottom, 70, canvas.height - p.bottom, 20);
  }
  
  ctx.shadowColor = "transparent";
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

  ctx.shadowColor = "rgba(255, 111, 168, 0.4)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

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

  ctx.shadowColor = "transparent";
  ctx.restore();
}

function drawHearts() {
  for (const h of hearts) {
    ctx.save();
    ctx.globalAlpha = h.life / HEART_LIFETIME;
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rotation);

    ctx.fillStyle = "#ff6fa8";
    ctx.shadowColor = "rgba(255, 111, 168, 0.6)";
    ctx.shadowBlur = 8;

    ctx.beginPath();
    const s = h.size;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-s, -s, -s * 1.5, s / 2, 0, s);
    ctx.bezierCurveTo(s * 1.5, s / 2, s, -s, 0, 0);

    ctx.fill();
    ctx.restore();
  }
}

function drawMessage() {
  if (messageTimer <= 0) return;
  
  const alpha = messageTimer > 100 ? 1 : (messageTimer / 100);
  ctx.save();
  ctx.globalAlpha = alpha;
  
  ctx.fillStyle = "rgba(255, 111, 168, 0.9)";
  ctx.font = "italic 18px Georgia, serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(255, 182, 193, 0.5)";
  ctx.shadowBlur = 8;
  ctx.fillText(currentMessage, canvas.width / 2, 70);
  
  ctx.restore();
}

function drawGameOver() {
  if (!gameOver) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const allisterScore = scores.Allister || 0;
  const lucaScore = scores.Luca || 0;
  const topPlayer = allisterScore > lucaScore ? "Allister" : "Luca";
  const topScore = Math.max(allisterScore, lucaScore);

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  
  const cardX = canvas.width / 2 - 120;
  const cardY = canvas.height / 2 - 90;
  const cardW = 240;
  const cardH = 180;
  
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 20);
  ctx.fill();

  ctx.shadowColor = "transparent";

  ctx.fillStyle = "#ff6fa8";
  ctx.font = "bold 26px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, cardY + 50);
  
  ctx.fillStyle = "#4e342e";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Your Score: ${score}`, canvas.width / 2, cardY + 80);
  
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#ff6fa8";
  ctx.fillText(`${topPlayer} is leading`, canvas.width / 2, cardY + 110);
  ctx.fillStyle = "#a06fb8";
  ctx.fillText(`${topScore} points`, canvas.width / 2, cardY + 130);
  
  ctx.fillStyle = "#9a88b3";
  ctx.font = "11px sans-serif";
  ctx.fillText("Tap to play again", canvas.width / 2, cardY + 155);
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
  console.log("Loading scores...");
  await loadScores();
  resetBird();
  loop();
})();
