const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreCounter = document.getElementById('scoreCounter');
const container = document.getElementById('gameContainer');

// Asset paths
const PLAYER_RUN = 'game_assets/shiroko-8.png';
const PLAYER_LOSE = 'game_assets/shiroko-7.png';
const BANNER = 'game_assets/banner.png';
const BG_SCROLL = 'game_assets/scroll.png';
const OBSTACLE_IMG = 'game_assets/kujouriu-1.png';

// Game Constants (Tweaked for bigger sprites and lower placement)
const PLAYER_WIDTH = 36, PLAYER_HEIGHT = 42; // Larger player
const OBSTACLE_WIDTH = 28, OBSTACLE_HEIGHT = 40; // Larger obstacle

const GROUND_Y = 100 - 12 - PLAYER_HEIGHT; // Move lower (12px margin from bottom)
const PLAYER_X = 30;
const JUMP_VELOCITY = -7.5;
const GRAVITY = 0.32;

const BASE_OBSTACLE_SPEED = 3.2;
const BASE_BG_SCROLL_SPEED = 1.2;
let obstacleSpeed = BASE_OBSTACLE_SPEED;
let bgScrollSpeed = BASE_BG_SCROLL_SPEED;

const MIN_OBSTACLE_GAP = 70; // px, increased for better fairness
const MIN_OBSTACLE_TIME = 50; // frames, increased for better fairness
const MAX_OBSTACLE_TIME = 95;

const SPEED_INCREASE_EVERY = 2000; // points
const SPEED_INCREASE_AMOUNT = 0.45; // px/frame

let playerImg = new Image(),
    loseImg = new Image(),
    bannerImg = new Image(),
    bgImg = new Image(),
    obstacleImg = new Image();
playerImg.src = PLAYER_RUN;
loseImg.src = PLAYER_LOSE;
bannerImg.src = BANNER;
bgImg.src = BG_SCROLL;
obstacleImg.src = OBSTACLE_IMG;

let gameState = 'BANNER'; // BANNER, PLAY, GAME_OVER

let player = {
  y: GROUND_Y,
  vy: 0,
  img: playerImg,
};

let obstacles = [];
let frame = 0;
let score = 0;
let nextObstacleFrame = 0;
let bgScrollX = 0;
let speedLevel = 0;

function resetGame() {
  player.y = GROUND_Y;
  player.vy = 0;
  player.img = playerImg;
  obstacles = [];
  frame = 0;
  score = 0;
  scoreCounter.textContent = score;
  nextObstacleFrame = Math.floor(Math.random() * (MAX_OBSTACLE_TIME - MIN_OBSTACLE_TIME)) + MIN_OBSTACLE_TIME;
  bgScrollX = 0;
  speedLevel = 0;
  obstacleSpeed = BASE_OBSTACLE_SPEED;
  bgScrollSpeed = BASE_BG_SCROLL_SPEED;
}

function spawnObstacle(x) {
  obstacles.push({
    x: typeof x === "number" ? x : canvas.width,
    y: GROUND_Y + (PLAYER_HEIGHT - OBSTACLE_HEIGHT), // align bottom with player
    width: OBSTACLE_WIDTH,
    height: OBSTACLE_HEIGHT,
  });
}

// Returns true if the last obstacle is far enough (by px) from canvas right edge to allow a new spawn
function canSpawnObstacle() {
  if (obstacles.length === 0) return true;
  const last = obstacles[obstacles.length - 1];
  // Make sure the last obstacle is at least MIN_OBSTACLE_GAP away from the right edge
  return last.x < canvas.width - MIN_OBSTACLE_GAP;
}

// Returns true if there is enough horizontal distance between the last two obstacles
function isLastObstacleFarEnough() {
  if (obstacles.length < 2) return true;
  const last = obstacles[obstacles.length - 1];
  const prev = obstacles[obstacles.length - 2];
  // Make sure the gap between obstacles is at least MIN_OBSTACLE_GAP at spawn time
  return last.x - (prev.x + prev.width) >= MIN_OBSTACLE_GAP;
}

function maybeIncreaseSpeed() {
  // Calculate the speed level based on score
  let newLevel = Math.floor(score / SPEED_INCREASE_EVERY);
  if (newLevel > speedLevel) {
    // Increase both obstacle and background speed by fixed amount
    let diff = newLevel - speedLevel;
    obstacleSpeed += SPEED_INCREASE_AMOUNT * diff;
    bgScrollSpeed += (SPEED_INCREASE_AMOUNT * diff) * (BASE_BG_SCROLL_SPEED / BASE_OBSTACLE_SPEED);
    speedLevel = newLevel;
  }
}

function update() {
  if (gameState === 'PLAY') {
    maybeIncreaseSpeed();

    // Player jump physics
    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.y >= GROUND_Y) {
      player.y = GROUND_Y;
      player.vy = 0;
    }

    // Obstacle logic
    for (let obs of obstacles) {
      obs.x -= obstacleSpeed;
    }
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    // Ensure at least one obstacle is on screen at all times
    const obstacleOnScreen = obstacles.some(
      obs => obs.x + obs.width > 0 && obs.x < canvas.width
    );
    if (!obstacleOnScreen) {
      // Only spawn a new one if:
      //  - no obstacles at all, OR
      //  - last obstacle is far enough away from right edge
      if (canSpawnObstacle()) {
        spawnObstacle();
      }
      nextObstacleFrame = frame + Math.floor(Math.random() * (MAX_OBSTACLE_TIME - MIN_OBSTACLE_TIME)) + MIN_OBSTACLE_TIME;
    }

    // Obstacle spawning with gap and timer logic
    if (frame >= nextObstacleFrame && canSpawnObstacle()) {
      // Also check the last two obstacles' distance at spawn time to prevent stacking
      if (
        Math.random() < 0.65 &&
        (obstacles.length === 0 || isLastObstacleFarEnough())
      ) {
        spawnObstacle();
      }
      nextObstacleFrame = frame + Math.floor(Math.random() * (MAX_OBSTACLE_TIME - MIN_OBSTACLE_TIME)) + MIN_OBSTACLE_TIME;
    }

    // Collision detection
    for (let obs of obstacles) {
      if (
        PLAYER_X + PLAYER_WIDTH > obs.x &&
        PLAYER_X < obs.x + obs.width &&
        player.y + PLAYER_HEIGHT > obs.y
      ) {
        gameState = 'GAME_OVER';
        player.img = loseImg;
        break;
      }
    }

    // Score
    score += 1;
    scoreCounter.textContent = score;

    // Background scroll
    bgScrollX -= bgScrollSpeed;
    if (bgImg.width) {
      while (bgScrollX <= -bgImg.width) {
        bgScrollX += bgImg.width;
      }
    }
  }
}

function drawBackground() {
  if (!bgImg.complete || !bgImg.width) {
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  let x = bgScrollX;
  while (x < canvas.width) {
    ctx.drawImage(bgImg, x, 0, bgImg.width, canvas.height);
    x += bgImg.width;
  }
}

function draw() {
  // Draw scrolling background
  drawBackground();

  if (gameState === 'BANNER') {
    // Draw banner image centered
    if (bannerImg.complete) {
      const scale = Math.min(canvas.width / bannerImg.width, canvas.height / bannerImg.height, 1);
      const imgW = bannerImg.width * scale;
      const imgH = bannerImg.height * scale;
      ctx.drawImage(
        bannerImg,
        (canvas.width - imgW) / 2,
        (canvas.height - imgH) / 2,
        imgW,
        imgH
      );
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      ctx.fillText("Click to Start!", canvas.width / 2, canvas.height - 10);
    }
    return;
  }

  // Draw ground
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + PLAYER_HEIGHT - 8);
  ctx.lineTo(canvas.width, GROUND_Y + PLAYER_HEIGHT - 8);
  ctx.stroke();

  // Draw obstacles (use image)
  for (let obs of obstacles) {
    if (obstacleImg.complete && obstacleImg.width) {
      ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
    } else {
      ctx.fillStyle = "#888";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
  }

  // Draw player
  ctx.drawImage(player.img, PLAYER_X, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);

  if (gameState === 'GAME_OVER') {
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#c22";
    ctx.textAlign = "center";
    ctx.fillText("Dealt in to meido.", canvas.width/2, canvas.height/2 + 10);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#222";
    ctx.fillText("LOOOOOOP?", canvas.width/2, canvas.height/2 + 30);
  }
}

function gameLoop() {
  update();
  draw();
  frame++;
  requestAnimationFrame(gameLoop);
}

// Controls: click to jump (PLAY), start (BANNER), or restart (GAME_OVER)
container.addEventListener('click', () => {
  if (gameState === 'BANNER') {
    resetGame();
    gameState = 'PLAY';
    return;
  }
  if (gameState === 'GAME_OVER') {
    resetGame();
    gameState = 'PLAY';
    return;
  }
  if (gameState === 'PLAY') {
    if (player.y >= GROUND_Y - 0.1) {
      player.vy = JUMP_VELOCITY;
      player.y += player.vy;
    }
  }
});

// Preload images before starting everything
let loaded = 0;
const totalToLoad = 5;
[playerImg, loseImg, bannerImg, bgImg, obstacleImg].forEach(img => {
  img.onload = () => {
    loaded++;
    if (loaded === totalToLoad) {
      gameState = 'BANNER';
      draw();
      gameLoop();
    }
  };
});
[playerImg, loseImg, bannerImg, bgImg, obstacleImg].forEach(img => {
  if (img.complete) img.onload();
});