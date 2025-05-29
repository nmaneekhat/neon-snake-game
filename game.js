const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = {};
let speed = 5;
const maxSpeed = 15;
const speedIncreaseInterval = 20000;
let lastSpeedIncrease = Date.now();

let gameInterval;
let gameStarted = false;
let gamePaused = false;
let gameOver = false;
let score = 0;

const bgMusic = document.getElementById('backgroundMusic');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

let musicMuted = false;
let sfxMuted = false;

bgMusic.volume = 0.3;
eatSound.volume = 0.8;
gameOverSound.volume = 0.8;

bgMusic.load();
eatSound.load();
gameOverSound.load();

function startBackgroundMusic() {
  if (!musicMuted) {
    bgMusic.play().catch(() => {});
  }
  window.removeEventListener('click', startBackgroundMusic);
  window.removeEventListener('keydown', startBackgroundMusic);
}

function startGame() {
  document.getElementById('startOverlay').style.display = 'none';

  gameStarted = true; // Mark the game as started

  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speed = 5;
  lastSpeedIncrease = Date.now();
  gameOver = false;
  gamePaused = false;
  document.getElementById('gameOverPopup').style.display = 'none';
  document.getElementById('pauseOverlay').classList.add("hidden");

  placeFood();
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000 / speed);

  bgMusic.currentTime = 0;
  if (!musicMuted) {
    bgMusic.play().catch(() => {});  // Play music only now on Play button click
  }

  // Reset pause button text to "Pause" when game starts
  document.getElementById('pauseBtn').textContent = "Pause/Spacebar";
}

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

  // Neon effect for snake
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#39ff14';

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#39ff14' : '#00cc66';
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

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

function update() {
  if (gamePaused || gameOver) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (
    head.x < 0 || head.x >= tileCountX ||
    head.y < 0 || head.y >= tileCountY ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (!sfxMuted) eatSound.play();
    placeFood();
  } else {
    snake.pop();
  }

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

  if (key === 'ArrowUp' && !goingDown) nextDirection = { x: 0, y: -1 };
  else if (key === 'ArrowDown' && !goingUp) nextDirection = { x: 0, y: 1 };
  else if (key === 'ArrowLeft' && !goingRight) nextDirection = { x: -1, y: 0 };
  else if (key === 'ArrowRight' && !goingLeft) nextDirection = { x: 1, y: 0 };
}

function pauseGameToggle() {
  if (gameOver) return;
 
  if (!gamePaused) {
    // Pause game
    gamePaused = true;
    clearInterval(gameInterval);
    document.getElementById('pauseOverlay').classList.remove("hidden");
    document.getElementById('pauseBtn').textContent = 'Resume/Spacebar';
    bgMusic.pause();
  } else {
    // Resume game
    resumeGame();
    document.getElementById('pauseBtn').textContent = "Pause/Spacebar";
  }
}

function resumeGame() {
  if (gameOver || !gamePaused) return;  // Don't resume if game is over or already running

  gamePaused = false;
  document.getElementById('pauseOverlay').classList.add("hidden");
  document.getElementById('pauseBtn').textContent = 'Pause';

  clearInterval(gameInterval);  // clear previous interval to avoid duplicates
  gameInterval = setInterval(gameLoop, 1000 / speed);

  if (!musicMuted) bgMusic.play();
}

function toggleMusicMute() {
  musicMuted = !musicMuted;
  const musicBtn = document.getElementById('muteMusicBtn');
  musicBtn.textContent = musicMuted ? 'Unmute Music' : 'Mute Music';
  if (musicMuted) {
    bgMusic.pause();
  } else if (!gamePaused && !gameOver) {
    bgMusic.play();
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

function returnToMenu() {
  gameStarted = false; //Reset the game
  location.reload(); // or redirect to home/menu page if you have one
}

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    if (gameStarted && !gameOver) {
       pauseGameToggle(); //Only allow pause/resume if game has started
    }
  } else {
    if (gameStarted && !gamePaused) {
      changeDirection(e);
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('pauseBtn').addEventListener('click', pauseGameToggle);
  document.getElementById('muteMusicBtn').addEventListener('click', toggleMusicMute);
  document.getElementById('muteSfxBtn').addEventListener('click', toggleSfxMute);
  document.getElementById('tryAgainBtn').addEventListener('click', tryAgain);
  document.getElementById('resumeBtn').addEventListener('click', resumeGame);
  document.getElementById('quitBtn').addEventListener('click', returnToMenu);
});
