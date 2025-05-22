const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCountX = canvas.width / gridSize; // 45 for 900 width
const tileCountY = canvas.height / gridSize; // 30 for 600 height

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = {};
let speed = 5;
const maxSpeed = 15;
const speedIncreaseInterval = 20000; // 20 seconds
let lastSpeedIncrease = Date.now();

let gameInterval;
let gamePaused = false;
let gameOver = false;

let score = 0;
let waitingForFirstMove = true;


const bgMusic = document.getElementById('backgroundMusic');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');





let musicMuted = false;
let sfxMuted = false;

// Audio setup
bgMusic.volume = 0.3;
eatSound.volume = 0.8;
gameOverSound.volume = 0.8;

bgMusic.load();
eatSound.load();
gameOverSound.load();

// Start music after user interaction to fix autoplay restrictions
function startBackgroundMusic() {
  if (!musicMuted) {
    bgMusic.play().catch(() => {});
  }
  window.removeEventListener('click', startBackgroundMusic);
  window.removeEventListener('keydown', startBackgroundMusic);
}

window.addEventListener('click', startBackgroundMusic);
window.addEventListener('keydown', startBackgroundMusic);

function placeFood() {
  food = {
    x: Math.floor(Math.random() * tileCountX),
    y: Math.floor(Math.random() * tileCountY),
  };
  while (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
    food.x = Math.floor(Math.random() * tileCountX);
    food.y = Math.floor(Math.random() * tileCountY);
  }
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    2 * Math.PI
  );
  ctx.fill();

  // Set neon glow effect
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#39ff14'; // neon green glow

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#39ff14' : '#00cc66'; // head = neon green, body = green
    ctx.fillRect(
      snake[i].x * gridSize,
      snake[i].y * gridSize,
      gridSize,
      gridSize
    );

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      snake[i].x * gridSize,
      snake[i].y * gridSize,
      gridSize,
      gridSize
    );
  }

  // Reset glow effect after drawing snake
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Draw score
  document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

function update() {
  if (gamePaused || gameOver) return;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Check wall collision (game over if snake hits wall)
  if (
    head.x < 0 || head.x >= tileCountX ||
    head.y < 0 || head.y >= tileCountY
  ) {
    endGame();
    return;
  }

  // Check self collision
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (!sfxMuted) eatSound.play();
    if (!sfxMuted) gameOverSound.play();

    placeFood();
  } else {
    snake.pop();
  }

  // Increase speed every speedIncreaseInterval milliseconds if below maxSpeed
  if (Date.now() - lastSpeedIncrease > speedIncreaseInterval && speed < maxSpeed) {
    speed++;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000 / speed);
    lastSpeedIncrease = Date.now();
  }
}

function endGame() {
  gameOver = true;
  clearInterval(gameInterval);
  if (!musicMuted) gameOverSound.play();
  bgMusic.pause();
  document.getElementById('gameOverPopup').style.display = 'flex';
}

function gameLoop() {
  update();
  draw();
}

function changeDirection(event) {
  const key = event.key;
  const goingUp = direction.y === -1;
  const goingDown = direction.y === 1;
  const goingLeft = direction.x === -1;
  const goingRight = direction.x === 1;

  if (key === 'ArrowUp' && !goingDown) direction = { x: 0, y: -1 };
  else if (key === 'ArrowDown' && !goingUp) direction = { x: 0, y: 1 };
  else if (key === 'ArrowLeft' && !goingRight) direction = { x: -1, y: 0 };
  else if (key === 'ArrowRight' && !goingLeft) direction = { x: 1, y: 0 };
}

function startGame() {
  // 👉 Add this line to hide the start overlay
  document.getElementById('startOverlay').style.display = 'none';

  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  score = 0;
  speed = 5;
  lastSpeedIncrease = Date.now();
  gameOver = false;
  gamePaused = false;
  document.getElementById('gameOverPopup').style.display = 'none';

  placeFood();

  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000 / speed);
  bgMusic.currentTime = 0;
  if (!musicMuted) bgMusic.play();
}


function pauseGame() {
  if (gameOver) return;

  gamePaused = !gamePaused;
  const pauseBtn = document.getElementById('pauseBtn');
  pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';

  if (gamePaused) {
    clearInterval(gameInterval);
    bgMusic.pause();
  } else {
    gameInterval = setInterval(gameLoop, 1000 / speed);
    if (!musicMuted) bgMusic.play();
  }
}

function toggleMusicMute() {
  musicMuted = !musicMuted;
  const musicBtn = document.getElementById('muteMusicBtn');
  if (musicMuted) {
    bgMusic.pause();
    musicBtn.textContent = 'Unmute Music';
  } else {
    if (!gamePaused && !gameOver) bgMusic.play();
    musicBtn.textContent = 'Mute Music';
  }
}

function toggleSfxMute() {
  sfxMuted = !sfxMuted;
  const sfxBtn = document.getElementById('muteSfxBtn');
  sfxBtn.textContent = sfxMuted ? 'Unmute SFX' : 'Mute SFX';
}


function tryAgain() {
  startGame();
}

window.addEventListener('keydown', changeDirection);

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('pauseBtn').addEventListener('click', pauseGame);
  document.getElementById('muteMusicBtn').addEventListener('click', toggleMusicMute);
  document.getElementById('muteSfxBtn').addEventListener('click', toggleSfxMute);
  document.getElementById('tryAgainBtn').addEventListener('click', tryAgain);
});

