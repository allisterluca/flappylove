* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Georgia, serif;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff0f7 0%, #f5e6ff 50%, #e8f4ff 100%);
  color: #4b3b5a;
  position: relative;
  overflow: hidden;
}

/* Decorative background elements */
body::before {
  content: "";
  position: fixed;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 20% 50%, rgba(255, 182, 193, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(200, 180, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  animation: drift 20s ease-in-out infinite;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
}

.game-wrapper {
  text-align: center;
  padding: 16px;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 2.2rem;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
  color: #ff6fa8;
  text-shadow: 0 2px 8px rgba(255, 111, 168, 0.3);
  font-weight: 700;
}

.subtitle {
  font-size: 0.95rem;
  margin-bottom: 10px;
  color: #7b6a8f;
  letter-spacing: 0.02em;
}

.info-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 15px rgba(255, 111, 168, 0.12);
  backdrop-filter: blur(10px);
}

.top-player {
  display: block;
  margin: 8px 0 12px;
  font-size: 0.95rem;
  color: #ff6fa8;
  font-weight: 600;
  letter-spacing: 0.05em;
}

canvas {
  border-radius: 24px;
  box-shadow: 0 15px 40px rgba(255, 111, 168, 0.25);
  background: linear-gradient(to bottom, #b3e5ff 0%, #e6f7ff 40%, #ffeaf5 100%);
  border: 2px solid rgba(255, 182, 193, 0.3);
  transition: transform 0.2s ease;
}

canvas:hover {
  transform: translateY(-2px);
}

/* Overlays */

.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 230, 247, 0.85), rgba(247, 240, 255, 0.85));
  backdrop-filter: blur(8px);
  z-index: 100;
}

.overlay.hidden {
  display: none;
}

.overlay-card {
  background: white;
  padding: 24px 26px;
  border-radius: 24px;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 182, 193, 0.2);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overlay-card h2 {
  margin-bottom: 8px;
  color: #ff6fa8;
  font-size: 22px;
}

.overlay-card h3 {
  margin-top: 12px;
  margin-bottom: 8px;
  color: #7b6a8f;
}

.overlay-card p {
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #5b4b6a;
}

.tiny-note {
  font-size: 0.75rem;
  color: #9a88b3;
  letter-spacing: 0.05em;
}

.bottom-note {
  margin-top: 10px;
  opacity: 0.9;
}

/* Leaderboard */
.leaderboard {
  margin: 14px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.15), rgba(200, 180, 255, 0.1));
  border-radius: 10px;
  border-left: 3px solid #ff6fa8;
}

.player-name {
  font-weight: 600;
  color: #4b3b5a;
  font-size: 0.95rem;
}

.player-score {
  font-weight: 700;
  color: #ff6fa8;
  font-size: 1.1rem;
  min-width: 30px;
  text-align: right;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  letter-spacing: 0.05em;
}

.btn.primary {
  background: linear-gradient(135deg, #ff8fbf, #ff6fa8);
  color: white;
  box-shadow: 0 6px 20px rgba(255, 111, 168, 0.35);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 111, 168, 0.4);
}

.btn.primary:active {
  transform: translateY(0);
}

.btn.secondary {
  background: linear-gradient(135deg, #b3c6ff, #8fa4ff);
  color: white;
  box-shadow: 0 6px 20px rgba(143, 164, 255, 0.35);
}

.btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(143, 164, 255, 0.4);
}

.btn.secondary:active {
  transform: translateY(0);
}
