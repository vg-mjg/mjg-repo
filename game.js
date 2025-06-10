const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = 300;
const HEIGHT = 100;
const PLAYER_RADIUS = 3;
const PLAYER_SPEED = 2.5;
const ENEMY_RADIUS = 10;
const ENEMY_AREA_X = 200;
const BOSS_MAX_HP = 300; // Doubled from 150

// Stage timing (milliseconds)
const INTRO_TIME = 16000; // Changed to 16 seconds
const STAGE1_TIME = 7000;
const STAGE2_TIME = 6000;
const STAGE3_TIME = 5000;

// Game states
const GAME_STATE = {
  BANNER: 0,
  DIALOGUE: 1,
  PLAYING: 2,
  WIN_DIALOGUE: 3,
  END_SCREEN: 4,
  GAME_OVER: 5
};

// State
let keys = {};
let gameState = GAME_STATE.BANNER;
let stage = 0;
let lastStageChange = 0;
let bossHP = BOSS_MAX_HP;
let dialogueIndex = 0;
let winDialogueIndex = 0;
let lastDialogueTime = 0;
let introTextIndex = 0;
let lastIntroTextTime = 0;

// Player object
let player = {
  x: 20,
  y: HEIGHT / 2,
  radius: PLAYER_RADIUS
};

// Enemy object
let enemy = {
  x: WIDTH - 30,
  y: HEIGHT / 2,
  radius: ENEMY_RADIUS,
  vx: 1.3,
  vy: 1.1
};

// Bullet arrays
let enemyBullets = [];
let playerBullets = [];
let lastBulletTime = 0;
let lastAimedBulletTime = 0;
let lastStreamTime = 0;
let lastFractalTime = 0;
let lastPlayerShootTime = 0;

// Fractal pattern state
let fractalSeed = 0;

// Load assets
let bannerImg = new Image();
bannerImg.src = 'game_assets/ugr_banner.png';
let bgImg = new Image();
bgImg.src = 'game_assets/bg.png';
let endImg = new Image();
endImg.src = 'game_assets/end.png';
let meidoImg = new Image();
meidoImg.src = 'game_assets/meido.png';
let bulletImg = new Image();
bulletImg.src = 'game_assets/bullet.png';
let bossImg = new Image();
bossImg.src = 'game_assets/amaekoromo-0.png';

// Audio
let bgMusic = new Audio('game_assets/music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

// Dialogue data
const dialogues = [
  { speaker: "Meido", text: "..." },
  { speaker: "Meido", text: "I can still hear it..." },
  { speaker: "Meido", text: "It's 'that' song. From the cursed lands" },
  { speaker: "Meido", text: "His name is stuck on my mind" },
  { speaker: "Meido", text: "My heart is made of softer things..." },
  { speaker: "AmaeKoromo", text: "Hehehe..." },
  { speaker: "Meido", text: "amaekoromo-0.png!!!???" },
  { speaker: "AmaeKoromo", text: "It was me! I posted it!" },
  { speaker: "Meido", text: "You're a jonger?" },
  { speaker: "AmaeKoromo", text: "I am whatever makes you mad" },
  { speaker: "Meido", text: "AMAE KODOMO ZEROOOOO!!!" },
  { speaker: "AmaeKoromo", text: "IT'S KOROMOOOOOO!!!!" },
  { speaker: "Meido", text: "I won't forgive you!" },
  { speaker: "AmaeKoromo", text: "It won't end until you beat me!" }
];

const winDialogues = [
  { speaker: "AmaeKoromo", text: "Impossible... I have been defeated!" },
  { speaker: "Meido", text: "The music... has ended" },
  { speaker: "AmaeKoromo", text: "Guhh... It wasn't even me who posted that." },
  { speaker: "AmaeKoromo", text: "I'm not a filthy jonger" },
  { speaker: "Meido", text: "For example, if I told you to kill yourself..." },
  { speaker: "AmaeKoromo", text: "*dies*" }
];

// Intro text during stage 0
const introTexts = [
  "Tsumo or Ron, the gamble is clear",
  "Do you really have nothing to fear?",
  "Show me that your heart is made of steel!"
];

// Utility for random angle (in radians) within a range
function randomAngle(min, max) {
  return min + Math.random() * (max - min);
}

// Enemy movement
function moveEnemy() {
  if (stage === 0) {
    // Intro: gentle floating motion
    enemy.y += Math.sin(performance.now() * 0.002) * 0.3;
    // Keep within bounds
    enemy.y = Math.max(enemy.radius, Math.min(HEIGHT - enemy.radius, enemy.y));
  } else if (stage < 3) {
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    // Confine to right-side area
    if (enemy.x > WIDTH - enemy.radius) {
      enemy.x = WIDTH - enemy.radius;
      enemy.vx *= -1;
    }
    if (enemy.x < ENEMY_AREA_X + enemy.radius) {
      enemy.x = ENEMY_AREA_X + enemy.radius;
      enemy.vx *= -1;
    }
    if (enemy.y < enemy.radius) {
      enemy.y = enemy.radius;
      enemy.vy *= -1;
    }
    if (enemy.y > HEIGHT - enemy.radius) {
      enemy.y = HEIGHT - enemy.radius;
      enemy.vy *= -1;
    }
  } else if (stage === 3) {
    // Steady in the middle of the right area
    enemy.x = WIDTH - ENEMY_RADIUS - 5;
    enemy.y = HEIGHT / 2;
  }
}

function spawnRandomBullet() {
  const angle = randomAngle(Math.PI - Math.PI / 9, Math.PI + Math.PI / 9);
  const speed = 1.2 + Math.random() * 1.0;
  enemyBullets.push({
    x: enemy.x,
    y: enemy.y,
    radius: 3,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed
  });
}

function spawnAimedBullet() {
  let dx = player.x - enemy.x;
  let dy = player.y - enemy.y;
  let len = Math.sqrt(dx * dx + dy * dy);
  let speed = 1.7 + Math.random() * 0.7;
  let vx = (dx / len) * speed;
  let vy = (dy / len) * speed;
  enemyBullets.push({
    x: enemy.x,
    y: enemy.y,
    radius: 3,
    vx,
    vy
  });
}

function spawnStreamBullet() {
  spawnAimedBullet();
}

function spawnFractalBullets(level, x, y, angle, spread, speed, decay, seed) {
  if (level <= 0) return;
  enemyBullets.push({
    x, y, radius: 3,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed
  });
  if (level > 1) {
    let n = 2 + (seed % 3);
    let angleOffset = Math.sin(seed) * 0.3;
    for (let i = 0; i < n; ++i) {
      let newAngle = angle + spread * (i - (n-1)/2) / (n > 1 ? (n-1) : 1) + angleOffset;
      spawnFractalBullets(level - 1, x, y, newAngle, spread / (1.4 + (seed % 2) * 0.35), speed * decay, decay, seed + i + 1);
    }
  }
}

function spawnPlayerBullet() {
  playerBullets.push({
    x: player.x + player.radius,
    y: player.y,
    width: 8,
    height: 4,
    speed: 4
  });
}

function movePlayer() {
  if (gameState !== GAME_STATE.PLAYING) return;
  
  if (keys['ArrowLeft'] || keys['a']) {
    player.x -= PLAYER_SPEED;
  }
  if (keys['ArrowRight'] || keys['d']) {
    player.x += PLAYER_SPEED;
  }
  if (keys['ArrowUp'] || keys['w']) {
    player.y -= PLAYER_SPEED;
  }
  if (keys['ArrowDown'] || keys['s']) {
    player.y += PLAYER_SPEED;
  }
  // Clamp to bounds
  player.x = Math.max(player.radius, Math.min(WIDTH - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(HEIGHT - player.radius, player.y));
}

function updateBullets() {
  if (gameState !== GAME_STATE.PLAYING) return;
  
  // Update enemy bullets
  for (let b of enemyBullets) {
    b.x += b.vx;
    b.y += b.vy;
  }
  enemyBullets = enemyBullets.filter(b =>
    b.x > -b.radius && b.x < WIDTH + b.radius &&
    b.y > -b.radius && b.y < HEIGHT + b.radius
  );

  // Update player bullets
  for (let b of playerBullets) {
    b.x += b.speed;
  }
  playerBullets = playerBullets.filter(b => b.x < WIDTH + b.width);
}

function checkCollision() {
  if (gameState !== GAME_STATE.PLAYING || stage === 0) return;

  // Player vs enemy bullets
  for (let b of enemyBullets) {
    let dx = player.x - b.x;
    let dy = player.y - b.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.radius + b.radius) {
      gameState = GAME_STATE.GAME_OVER;
    }
  }

  // Player vs enemy
  let dx = player.x - enemy.x;
  let dy = player.y - enemy.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < player.radius + enemy.radius) {
    gameState = GAME_STATE.GAME_OVER;
  }

  // Player bullets vs enemy
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    let b = playerBullets[i];
    let dx = (b.x + b.width/2) - enemy.x;
    let dy = (b.y + b.height/2) - enemy.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < b.width/2 + enemy.radius) {
      playerBullets.splice(i, 1);
      bossHP = Math.max(0, bossHP - 5);
      if (bossHP <= 0) {
        // Boss defeated - go to win dialogue and stop music immediately
        gameState = GAME_STATE.WIN_DIALOGUE;
        winDialogueIndex = 0;
        enemyBullets = []; // Clear enemy bullets
        // Stop music immediately when winning
        bgMusic.pause();
        bgMusic.currentTime = 0;
      }
    }
  }
}

function drawBanner() {
  if (bannerImg.complete) {
    ctx.drawImage(bannerImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click to Start', WIDTH / 2, HEIGHT / 2);
  }
}

function drawDialogue() {
  // Draw background
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // DON'T draw characters during dialogue - they appear only when game starts

  if (dialogueIndex < dialogues.length) {
    let dialogue = dialogues[dialogueIndex];
    
    // Draw avatar - stretched as large as possible while fitting in 300x100
    let avatarImg = dialogue.speaker === "Meido" ? meidoImg : bossImg;
    if (avatarImg.complete) {
      // Calculate max size that fits in the canvas, leaving space for text box
      let maxWidth = WIDTH - 20; // Leave 10px margin on each side
      let maxHeight = HEIGHT - 45; // Leave space for text box (35px) + margin (10px)
      
      // Get image natural dimensions
      let imgAspectRatio = avatarImg.naturalWidth / avatarImg.naturalHeight;
      
      // Calculate size maintaining aspect ratio
      let avatarWidth, avatarHeight;
      if (maxWidth / maxHeight > imgAspectRatio) {
        // Height is the limiting factor
        avatarHeight = maxHeight;
        avatarWidth = avatarHeight * imgAspectRatio;
      } else {
        // Width is the limiting factor
        avatarWidth = maxWidth;
        avatarHeight = avatarWidth / imgAspectRatio;
      }
      
      let avatarX = (WIDTH - avatarWidth) / 2; // Centered horizontally
      let avatarY = 10; // Small margin from top
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarWidth, avatarHeight);
    }

    // Draw dialogue box
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#000';
    ctx.fillRect(10, HEIGHT - 35, WIDTH - 20, 20); // Made text box smaller
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, HEIGHT - 35, WIDTH - 20, 20);
    
    // Dialogue text
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(dialogue.text, 15, HEIGHT - 22);
    ctx.restore();
    
    // Skip text outside the box
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Press S to skip', 15, HEIGHT - 5);
    ctx.restore();
  }
}

function drawWinDialogue() {
  // Draw background
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Draw characters during win dialogue
  drawPlayer();
  drawEnemy();

  if (winDialogueIndex < winDialogues.length) {
    let dialogue = winDialogues[winDialogueIndex];
    
    // Draw avatar - stretched as large as possible while fitting in 300x100
    let avatarImg = dialogue.speaker === "Meido" ? meidoImg : bossImg;
    if (avatarImg.complete) {
      // Calculate max size that fits in the canvas, leaving space for text box
      let maxWidth = WIDTH - 20; // Leave 10px margin on each side
      let maxHeight = HEIGHT - 45; // Leave space for text box (35px) + margin (10px)
      
      // Get image natural dimensions
      let imgAspectRatio = avatarImg.naturalWidth / avatarImg.naturalHeight;
      
      // Calculate size maintaining aspect ratio
      let avatarWidth, avatarHeight;
      if (maxWidth / maxHeight > imgAspectRatio) {
        // Height is the limiting factor
        avatarHeight = maxHeight;
        avatarWidth = avatarHeight * imgAspectRatio;
      } else {
        // Width is the limiting factor
        avatarWidth = maxWidth;
        avatarHeight = avatarWidth / imgAspectRatio;
      }
      
      let avatarX = (WIDTH - avatarWidth) / 2; // Centered horizontally
      let avatarY = 10; // Small margin from top
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarWidth, avatarHeight);
    }

    // Draw dialogue box
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#000';
    ctx.fillRect(10, HEIGHT - 35, WIDTH - 20, 20); // Made text box smaller
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, HEIGHT - 35, WIDTH - 20, 20);
    
    // Dialogue text
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(dialogue.text, 15, HEIGHT - 22);
    ctx.restore();
    
    // Skip text outside the box
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Press S to skip', 15, HEIGHT - 5);
    ctx.restore();
  }
}

function drawEndScreen() {
  if (endImg.complete) {
    ctx.drawImage(endImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The End', WIDTH / 2, HEIGHT / 2);
    ctx.font = '10px sans-serif';
    ctx.fillText('Click to restart', WIDTH / 2, HEIGHT / 2 + 15);
  }
}

function drawPlayer() {
  // Draw meido image overlay first
  if (meidoImg.complete) {
    let imgSize = player.radius * 8;
    ctx.drawImage(meidoImg, 
      player.x - imgSize/2, 
      player.y - imgSize/2, 
      imgSize, 
      imgSize
    );
  }

  // Draw hitbox circle on top (green and transparent)
  if (gameState === GAME_STATE.PLAYING) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(68, 255, 68, 0.4)';
    ctx.shadowColor = '#44ff44';
    ctx.shadowBlur = 2;
    ctx.fill();
    ctx.restore();
  }
}

function drawEnemy() {
  // Draw enemy hitbox circle (faint)
  if (gameState === GAME_STATE.PLAYING) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 227, 77, 0.3)';
    ctx.shadowColor = '#ffe34d';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.restore();
  }

  // Draw boss image overlay
  if (bossImg.complete) {
    let imgSize = enemy.radius * 2.5;
    ctx.drawImage(bossImg, 
      enemy.x - imgSize/2, 
      enemy.y - imgSize/2, 
      imgSize, 
      imgSize
    );
  }
}

function drawEnemyBullets() {
  ctx.save();
  ctx.fillStyle = '#ff4444';
  for (let b of enemyBullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlayerBullets() {
  // Draw green rectangular bullets instead of using image
  ctx.save();
  ctx.fillStyle = '#44ff44';
  for (let b of playerBullets) {
    ctx.fillRect(b.x, b.y - b.height/2, b.width, b.height);
  }
  ctx.restore();
}

function drawHealthBar() {
  ctx.save();
  ctx.globalAlpha = 0.7;
  
  let barX = enemy.x - 20;
  let barY = enemy.y - enemy.radius - 15;
  let barWidth = 40;
  let barHeight = 6;
  
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  let healthPercent = bossHP / BOSS_MAX_HP;
  ctx.fillStyle = healthPercent > 0.3 ? '#4CAF50' : '#f44336';
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  ctx.restore();
}

function drawGameOver() {
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Mahjong Dream, the tiles are falling...', WIDTH / 2, HEIGHT / 2);
  ctx.font = '10px sans-serif';
  ctx.fillText('Click to save the day', WIDTH / 2, HEIGHT / 2 + 15);
  ctx.restore();
}

function drawIntroText(now) {
  // Show intro text during stage 0
  if (stage === 0) {
    // Show texts sequentially without looping
    let timeSinceStart = now - lastStageChange;
    let currentTextIndex = Math.floor(timeSinceStart / 5000);
    
    // Only show text if we haven't gone past the last one
    if (currentTextIndex < introTexts.length) {
      // Draw AmaeKoromo avatar - stretched as large as possible
      if (bossImg.complete) {
        // Calculate max size that fits in the canvas, leaving space for text box
        let maxWidth = WIDTH - 20; // Leave 10px margin on each side
        let maxHeight = HEIGHT - 45; // Leave space for text box (35px) + margin (10px)
        
        // Get image natural dimensions
        let imgAspectRatio = bossImg.naturalWidth / bossImg.naturalHeight;
        
        // Calculate size maintaining aspect ratio
        let avatarWidth, avatarHeight;
        if (maxWidth / maxHeight > imgAspectRatio) {
          // Height is the limiting factor
          avatarHeight = maxHeight;
          avatarWidth = avatarHeight * imgAspectRatio;
        } else {
          // Width is the limiting factor
          avatarWidth = maxWidth;
          avatarHeight = avatarWidth / imgAspectRatio;
        }
        
        let avatarX = (WIDTH - avatarWidth) / 2; // Centered horizontally
        let avatarY = 10; // Small margin from top
        ctx.drawImage(bossImg, avatarX, avatarY, avatarWidth, avatarHeight);
      }

      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#000';
      ctx.fillRect(10, HEIGHT - 35, WIDTH - 20, 20); // Made text box smaller
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, HEIGHT - 35, WIDTH - 20, 20);
      
      // Draw intro text
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(introTexts[currentTextIndex], 15, HEIGHT - 22);
      ctx.restore();
    }
  }
}

function drawGame() {
  // Draw background
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Only draw characters when game has actually started (not during dialogue phase)
  if (gameState === GAME_STATE.PLAYING) {
    drawPlayer();
    drawEnemy();
    drawEnemyBullets();
    drawPlayerBullets();
    drawHealthBar();
  }
  
  // Draw intro text if in stage 0
  if (stage === 0) {
    drawIntroText(performance.now());
  }
}

function updateStage(now) {
  if (gameState !== GAME_STATE.PLAYING) return;
  
  if (stage === 0 && now - lastStageChange > INTRO_TIME) {
    stage = 1;
    lastStageChange = now;
  } else if (stage === 1 && now - lastStageChange > STAGE1_TIME) {
    stage = 2;
    lastStageChange = now;
  } else if (stage === 2 && now - lastStageChange > STAGE2_TIME) {
    stage = 3;
    lastStageChange = now;
    fractalSeed = Math.floor(Math.random() * 10000);
  } else if (stage === 3 && now - lastStageChange > STAGE3_TIME) {
    stage = 1;
    lastStageChange = now;
    enemy.vx = 1.3 * (Math.random() < 0.5 ? 1 : -1);
    enemy.vy = 1.1 * (Math.random() < 0.5 ? 1 : -1);
  }
}

function startGame() {
  gameState = GAME_STATE.PLAYING;
  lastStageChange = performance.now();
  stage = 0;
  bossHP = BOSS_MAX_HP;
  enemyBullets = [];
  playerBullets = [];
  player.x = 20;
  player.y = HEIGHT / 2;
  enemy.x = WIDTH - 30;
  enemy.y = HEIGHT / 2;
  
  // Start music
  bgMusic.currentTime = 0;
  bgMusic.play().catch(e => console.log('Audio play failed:', e));
}

function gameLoop(now) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  switch (gameState) {
    case GAME_STATE.BANNER:
      drawBanner();
      break;
      
    case GAME_STATE.DIALOGUE:
      drawDialogue();
      break;
      
    case GAME_STATE.PLAYING:
      movePlayer();
      moveEnemy();
      updateBullets();
      checkCollision();
      drawGame();
      updateStage(now);

      // Automatic player shooting (only after intro)
      if (stage > 0 && now - lastPlayerShootTime > 200) {
        spawnPlayerBullet();
        lastPlayerShootTime = now;
      }

      // Stage patterns
      if (stage === 1) {
        if (now - lastBulletTime > 270) {
          spawnRandomBullet();
          lastBulletTime = now;
        }
        if (now - lastAimedBulletTime > 750) {
          spawnAimedBullet();
          lastAimedBulletTime = now;
        }
      } else if (stage === 2) {
        if (now - lastStreamTime > 110) {
          spawnStreamBullet();
          lastStreamTime = now;
        }
        enemy.vx *= 1.0007;
        enemy.vy *= 1.0007;
      } else if (stage === 3) {
        if (now - lastFractalTime > 950) {
          let pulse = Math.floor((now - lastStageChange) / 950);
          let baseAngle = Math.PI + Math.sin(fractalSeed + pulse) * 0.4;
          let spread = Math.PI / (2.4 + 1.2 * Math.cos(fractalSeed + pulse * 0.7));
          let levels = 2 + (fractalSeed + pulse) % 2;
          let speed = 2.4 + 0.5 * Math.cos(fractalSeed + pulse);
          let decay = 0.55 + 0.1 * Math.abs(Math.sin(fractalSeed + pulse));
          spawnFractalBullets(levels, enemy.x, enemy.y, baseAngle, spread, speed, decay, fractalSeed + pulse * 13);
          lastFractalTime = now;
        }
      }
      break;
      
    case GAME_STATE.WIN_DIALOGUE:
      drawWinDialogue();
      break;
      
    case GAME_STATE.END_SCREEN:
      drawEndScreen();
      break;
      
    case GAME_STATE.GAME_OVER:
      drawGame();
      drawGameOver();
      break;
  }

  requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', e => {
  // Only prevent default behavior during gameplay (when music is playing)
  if (gameState === GAME_STATE.PLAYING && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
    e.preventDefault();
  }
  
  keys[e.key] = true;
  
  if (gameState === GAME_STATE.DIALOGUE && e.key.toLowerCase() === 's') {
    startGame();
  }
  
  if (gameState === GAME_STATE.WIN_DIALOGUE && e.key.toLowerCase() === 's') {
    gameState = GAME_STATE.END_SCREEN;
  }
});

document.addEventListener('keyup', e => {
  // Only prevent default behavior during gameplay (when music is playing)
  if (gameState === GAME_STATE.PLAYING && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
    e.preventDefault();
  }
  
  keys[e.key] = false;
});

canvas.addEventListener('click', e => {
  switch (gameState) {
    case GAME_STATE.BANNER:
      gameState = GAME_STATE.DIALOGUE;
      dialogueIndex = 0;
      break;
      
    case GAME_STATE.DIALOGUE:
      dialogueIndex++;
      if (dialogueIndex >= dialogues.length) {
        startGame();
      }
      break;
      
    case GAME_STATE.WIN_DIALOGUE:
      winDialogueIndex++;
      if (winDialogueIndex >= winDialogues.length) {
        gameState = GAME_STATE.END_SCREEN;
      }
      break;
      
    case GAME_STATE.END_SCREEN:
    case GAME_STATE.GAME_OVER:
      gameState = GAME_STATE.BANNER;
      bgMusic.pause();
      bgMusic.currentTime = 0;
      break;
  }
});

// Start loop
gameLoop(performance.now());