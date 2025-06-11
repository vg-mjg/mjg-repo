class TableTennisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.playerScoreElement = document.getElementById('playerScore');
        this.aiScoreElement = document.getElementById('aiScore');
        this.gameContainer = document.getElementById('game-container');
        
        // Set canvas size programmatically
        this.canvas.width = 300;
        this.canvas.height = 200;
        
        // Load sound effects
        this.hitSound = new Audio('takyuu/hit.mp3');
        this.hitSound.volume = 0.5;
        this.loseSound = new Audio('takyuu/lose.mp3');
        this.loseSound.volume = 0.7;
        this.bgm = new Audio('takyuu/bgm.mp3');
        this.bgm.volume = 0.3;
        this.bgm.loop = true;
        this.lastHitTime = 0; // Prevent rapid audio playback
        
        // Load banner image
        this.bannerImage = new Image();
        this.bannerImage.src = 'takyuu/banner.png';
        
        // Game state
        this.showBanner = true;
        this.gameRunning = false;
        this.gameEnded = false;
        this.winner = null;
        this.playerScore = 0;
        this.aiScore = 0;
        this.serving = false;
        this.serveDelay = 0;
        this.whoServes = 'player'; // 'player' or 'ai'
        this.lastServe = null; // Track who served last to alternate
        this.outOfBounds = false;
        this.outOfBoundsDelay = 0;
        
        // Ball properties
        this.ball = {
            x: 150,
            y: 100,
            radius: 4,
            speedX: 4, // Increased from 3
            speedY: 3, // Increased from 2
            maxSpeed: 6 // Reduced from 8 to 6 for better control
        };
        
        // Paddle properties
        this.paddleWidth = 4; // Increased from 3
        this.paddleHeight = 25; // Increased from 20
        
        // Player paddle (can move anywhere)
        this.playerPaddle = {
            x: 290,
            y: 90,
            speed: 0
        };
        
        // AI paddle (can move anywhere)
        this.aiPaddle = {
            x: 7,
            y: 90,
            speed: 3.2,
            targetY: 90,
            randomTimer: 0,
            lastBallDirection: 0 // Track ball direction to prevent following backwards
        };
        
        // Store original positions
        this.originalPlayerPaddle = { x: 290, y: 90 };
        this.originalAiPaddle = { x: 7, y: 90 };
        
        this.mouseX = 290;
        this.mouseY = 100;

        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Listen on the whole window for mouse movement
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.showBanner) {
                this.showBanner = false;
                this.gameContainer.classList.remove('banner-active');
                // Restore canvas size for gameplay
                this.canvas.width = 300;
                this.canvas.height = 200;
            } else if (!this.gameRunning || this.gameEnded) {
                this.startGame();
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameEnded = false;
        this.winner = null;
        this.playerScore = 0;
        this.aiScore = 0;
        this.playerScoreElement.textContent = this.playerScore;
        this.aiScoreElement.textContent = this.aiScore;
        // Start background music when game actually begins
        this.bgm.currentTime = 0;
        this.bgm.play().then(() => {
            console.log('BGM started successfully');
        }).catch(e => {
            console.log('BGM play failed:', e);
            // Try to play again after user interaction
            document.addEventListener('click', () => {
                this.bgm.play().catch(e2 => console.log('BGM retry failed:', e2));
            }, { once: true });
        });
        this.whoServes = Math.random() > 0.5 ? 'player' : 'ai';
        this.lastServe = null; // Reset serve tracking
        this.serveBall();
    }
    
    serveBall() {
        this.serving = true;
        this.serveDelay = this.whoServes === 'ai' ? 60 : 0; // 1 second delay for AI (60 frames at 60fps)
        
        // Reset paddle positions
        this.playerPaddle.x = this.originalPlayerPaddle.x;
        this.playerPaddle.y = this.originalPlayerPaddle.y;
        this.aiPaddle.x = this.originalAiPaddle.x;
        this.aiPaddle.y = this.originalAiPaddle.y;
        
        // Ball starts at the middle of each player's side
        if (this.whoServes === 'player') {
            this.ball.x = 225; // Middle of right side (150 + 300) / 2
            this.ball.y = this.canvas.height / 2;
        } else {
            this.ball.x = 75; // Middle of left side (0 + 150) / 2
            this.ball.y = this.canvas.height / 2;
        }
        this.ball.speedX = 0;
        this.ball.speedY = 0;
        
        // Reset AI random movement
        this.aiPaddle.randomTimer = 0;
        this.aiPaddle.targetY = this.ball.y;
    }
    
    updateGame() {
        if (!this.gameRunning || this.showBanner || this.gameEnded) return;
        
        // Handle out of bounds delay
        if (this.outOfBounds) {
            if (this.outOfBoundsDelay > 0) {
                this.outOfBoundsDelay--;
                // Continue moving ball off screen
                this.ball.x += this.ball.speedX;
                this.ball.y += this.ball.speedY;
                return;
            } else {
                this.outOfBounds = false;
                this.serveBall();
                return;
            }
        }
        
        // Handle serve delay
        if (this.serving) {
            if (this.serveDelay > 0) {
                this.serveDelay--;
                return;
            } else {
                this.serving = false;
            }
        }
        
        // Player paddle follows mouse (constrained to right half)
        let px = this.mouseX - this.paddleWidth / 2;
        let py = this.mouseY - this.paddleHeight / 2;
        // Constrain to right half
        if (px < 150) px = 150;
        if (px > this.canvas.width - this.paddleWidth) px = this.canvas.width - this.paddleWidth;
        if (py < 0) py = 0;
        if (py > this.canvas.height - this.paddleHeight) py = this.canvas.height - this.paddleHeight;
        this.playerPaddle.x = px;
        this.playerPaddle.y = py;

        // AI paddle behavior - always move when it's AI's turn or ball is in motion
        if (this.ball.speedX !== 0 || this.ball.speedY !== 0 || this.whoServes === 'ai') {
            // Special behavior for AI serving - move directly to ball
            if (this.whoServes === 'ai' && this.ball.speedX === 0 && this.ball.speedY === 0) {
                // Move AI paddle to ball position to serve
                let targetX = this.ball.x - this.paddleWidth - 2;
                let targetY = this.ball.y - this.paddleHeight / 2;
                
                // Move X
                if (this.aiPaddle.x < targetX - 2) {
                    this.aiPaddle.x += this.aiPaddle.speed;
                } else if (this.aiPaddle.x > targetX + 2) {
                    this.aiPaddle.x -= this.aiPaddle.speed;
                }
                // Move Y
                if (this.aiPaddle.y < targetY - 2) {
                    this.aiPaddle.y += this.aiPaddle.speed;
                } else if (this.aiPaddle.y > targetY + 2) {
                    this.aiPaddle.y -= this.aiPaddle.speed;
                }
            } else {
                // Improved AI behavior - more strategic positioning
                let targetX, targetY;
                
                if (this.ball.speedX > 0) {
                    // Ball is moving away from AI - stay in defensive ready position
                    targetX = 50; // Consistent defensive position
                    targetY = this.canvas.height / 2; // Center court
                } else if (this.ball.speedX < 0) {
                    // Ball is coming toward AI - predict intercept point
                    let timeToReach = Math.abs(this.ball.x - this.aiPaddle.x) / Math.abs(this.ball.speedX);
                    let predictedY = this.ball.y + this.ball.speedY * timeToReach;
                    
                    // Position for optimal hit
                    targetX = Math.max(20, Math.min(this.ball.x - 15, 130));
                    targetY = Math.max(this.paddleHeight/2, Math.min(this.canvas.height - this.paddleHeight/2, predictedY));
                } else {
                    // Ball is stationary - maintain ready position
                    targetX = 60;
                    targetY = this.ball.y;
                }
                
                // Constrain target positions to AI's side
                targetX = Math.max(5, Math.min(145, targetX));
                targetY = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, targetY));
                
                // Move toward target position smoothly
                let xDiff = targetX - this.aiPaddle.x;
                let yDiff = targetY - this.aiPaddle.y;
                
                if (Math.abs(xDiff) > 2) {
                    this.aiPaddle.x += Math.sign(xDiff) * Math.min(this.aiPaddle.speed, Math.abs(xDiff) * 0.8);
                }
                
                if (Math.abs(yDiff) > 2) {
                    this.aiPaddle.y += Math.sign(yDiff) * Math.min(this.aiPaddle.speed, Math.abs(yDiff) * 0.8);
                }
            }
        }
        
        // Constrain AI paddle to left half
        if (this.aiPaddle.x < 0) this.aiPaddle.x = 0;
        if (this.aiPaddle.x > 150 - this.paddleWidth) this.aiPaddle.x = 150 - this.paddleWidth;
        if (this.aiPaddle.y < 0) this.aiPaddle.y = 0;
        if (this.aiPaddle.y > this.canvas.height - this.paddleHeight) this.aiPaddle.y = this.canvas.height - this.paddleHeight;

        // Ball collision with paddles (check before updating position)
        this.checkPaddleCollision();

        // Update ball position
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Ball collision with top and bottom walls - improved collision detection
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.speedY = Math.abs(this.ball.speedY);
        } else if (this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.y = this.canvas.height - this.ball.radius;
            this.ball.speedY = -Math.abs(this.ball.speedY);
        }
        
        // Check if ball goes out of bounds (scoring) - FIXED scoring logic
        if (this.ball.x < -50) { 
            // Ball went out on AI's side (left) - AI scores (Player failed to return)
            this.aiScore++;
            this.aiScoreElement.textContent = this.aiScore;
            console.log(`AI scored! Player: ${this.playerScore}, AI: ${this.aiScore}`);
            // Check for game end
            if (this.checkGameEnd()) return;
            // Play lose sound
            this.loseSound.currentTime = 0;
            this.loseSound.play().catch(e => console.log('Audio play failed:', e));
            // Determine who serves next based on scoring rules
            this.determineNextServer();
            this.outOfBounds = true;
            // Wait for 0.5 seconds (30 frames at 60 fps)
            this.outOfBoundsDelay = 30;
        } else if (this.ball.x > this.canvas.width + 50) { 
            // Ball went out on Player's side (right) - Player scores (AI failed to return)
            this.playerScore++;
            this.playerScoreElement.textContent = this.playerScore;
            console.log(`Player scored! Player: ${this.playerScore}, AI: ${this.aiScore}`);
            // Check for game end
            if (this.checkGameEnd()) return;
            // Play lose sound
            this.loseSound.currentTime = 0;
            this.loseSound.play().catch(e => console.log('Audio play failed:', e));
            // Determine who serves next based on scoring rules
            this.determineNextServer();
            this.outOfBounds = true;
            // Wait for 0.5 seconds (30 frames at 60 fps)
            this.outOfBoundsDelay = 30;
        }
    }
    
    checkGameEnd() {
        const totalPoints = this.playerScore + this.aiScore;
        
        // Standard game: first to 11 points with at least 2 point lead
        if (this.playerScore >= 11 || this.aiScore >= 11) {
            const pointDifference = Math.abs(this.playerScore - this.aiScore);
            
            if (pointDifference >= 2) {
                this.gameEnded = true;
                this.winner = this.playerScore > this.aiScore ? 'AI' : 'Player';
                console.log(`Game ended: Player ${this.playerScore} - AI ${this.aiScore}, Winner: ${this.winner}`);
                this.gameRunning = false;
                
                // Stop background music
                this.bgm.pause();
                this.bgm.currentTime = 0;
                
                return true;
            }
        }
        
        return false;
    }
    
    determineNextServer() {
        const totalPoints = this.playerScore + this.aiScore;
        
        // In deuce (both players at 10+), alternate serve every point
        if (this.playerScore >= 10 && this.aiScore >= 10) {
            this.whoServes = this.whoServes === 'player' ? 'ai' : 'player';
        } else {
            // Normal serving: every 2 points
            if (Math.floor(totalPoints / 2) % 2 === 0) {
                this.whoServes = 'player';
            } else {
                this.whoServes = 'ai';
            }
        }
        
        this.lastServe = this.whoServes;
    }
    
    checkPaddleCollision() {
        const currentTime = Date.now();
        
        // Improved Player paddle collision - better detection for fast movement
        if (
            this.ball.x + this.ball.radius >= this.playerPaddle.x - 5 && // Expanded detection zone
            this.ball.x - this.ball.radius <= this.playerPaddle.x + this.paddleWidth + 5 &&
            this.ball.y + this.ball.radius >= this.playerPaddle.y - 5 &&
            this.ball.y - this.ball.radius <= this.playerPaddle.y + this.paddleHeight + 5 &&
            (this.ball.speedX > 0 || (this.ball.speedX === 0 && this.whoServes === 'player')) // Allow serve hits
        ) {
            // Additional check: make sure ball is actually moving toward paddle or serving
            if (this.ball.speedX > 0 || (this.ball.speedX === 0 && this.ball.speedY === 0)) {
                // Play hit sound with cooldown
                if (currentTime - this.lastHitTime > 100) { // 100ms cooldown
                    this.hitSound.currentTime = 0;
                    this.hitSound.play().catch(e => console.log('Audio play failed:', e));
                    this.lastHitTime = currentTime;
                }
                
                // Move ball away from paddle to prevent sticking/passing through
                this.ball.x = this.playerPaddle.x - this.ball.radius - 2; // Extra buffer
                // For player serve, start the ball movement
                if (this.ball.speedX === 0 && this.ball.speedY === 0) {
                    this.ball.speedX = -4; // Increased from -3
                    this.ball.speedY = (Math.random() - 0.5) * 3; // Increased from 2
                } else {
                    // Normal collision - ensure ball bounces away
                    this.ball.speedX = -Math.abs(this.ball.speedX); // Force negative speed
                    const hitPos = (this.ball.y - this.playerPaddle.y) / this.paddleHeight;
                    this.ball.speedY += (hitPos - 0.5) * 2;
                    // Speed up slightly
                    this.ball.speedX *= 1.01;
                    this.ball.speedY *= 1.01;
                }
                // Cap velocity after collision
                this.capBallVelocity();
            }
        }
        
        // Improved AI paddle collision - better detection for fast movement
        if (
            this.ball.x + this.ball.radius >= this.aiPaddle.x - 5 && // Expanded detection zone
            this.ball.x - this.ball.radius <= this.aiPaddle.x + this.paddleWidth + 5 &&
            this.ball.y + this.ball.radius >= this.aiPaddle.y - 5 &&
            this.ball.y - this.ball.radius <= this.aiPaddle.y + this.paddleHeight + 5 &&
            (this.ball.speedX < 0 || (this.ball.speedX === 0 && this.whoServes === 'ai')) // Allow serve hits
        ) {
            // Additional check: make sure ball is actually moving toward paddle or serving
            if (this.ball.speedX < 0 || (this.ball.speedX === 0 && this.ball.speedY === 0)) {
                // Play hit sound with cooldown
                if (currentTime - this.lastHitTime > 100) { // 100ms cooldown
                    this.hitSound.currentTime = 0;
                    this.hitSound.play().catch(e => console.log('Audio play failed:', e));
                    this.lastHitTime = currentTime;
                }
                
                // Move ball away from paddle to prevent sticking/passing through
                this.ball.x = this.aiPaddle.x + this.paddleWidth + this.ball.radius + 2; // Extra buffer
                // For AI serve, start the ball movement
                if (this.ball.speedX === 0 && this.ball.speedY === 0) {
                    this.ball.speedX = 4; // Increased from 3
                    this.ball.speedY = (Math.random() - 0.5) * 3; // Increased from 2
                } else {
                    // Improved AI collision - more strategic ball direction
                    this.ball.speedX = Math.abs(this.ball.speedX); // Force positive speed
                    const hitPos = (this.ball.y - this.aiPaddle.y) / this.paddleHeight;
                    
                    // AI tries to hit towards corners more strategically
                    if (hitPos < 0.3) {
                        this.ball.speedY = -Math.abs(this.ball.speedY) * 1.2;
                    } else if (hitPos > 0.7) {
                        this.ball.speedY = Math.abs(this.ball.speedY) * 1.2;
                    } else {
                        this.ball.speedY += (hitPos - 0.5) * 3;
                    }
                    
                    // Speed up more aggressively
                    this.ball.speedX *= 1.02;
                    this.ball.speedY *= 1.02;
                }
                // Cap velocity after collision
                this.capBallVelocity();
            }
        }
    }
    
    capBallVelocity() {
        // Cap individual components
        this.ball.speedX = Math.max(-this.ball.maxSpeed, Math.min(this.ball.maxSpeed, this.ball.speedX));
        this.ball.speedY = Math.max(-this.ball.maxSpeed, Math.min(this.ball.maxSpeed, this.ball.speedY));
        
        // Also cap total velocity magnitude
        const totalSpeed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
        if (totalSpeed > this.ball.maxSpeed) {
            const scale = this.ball.maxSpeed / totalSpeed;
            this.ball.speedX *= scale;
            this.ball.speedY *= scale;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Show banner if not started
        if (this.showBanner) {
            // Set canvas to banner size
            this.canvas.width = 300;
            this.canvas.height = 100;
            
            if (this.bannerImage.complete && this.bannerImage.naturalWidth > 0) {
                // Draw banner at its natural size without any scaling
                this.ctx.drawImage(this.bannerImage, 0, 0);
            } else {
                // Fallback background while image loads
                this.ctx.fillStyle = '#27ae60';
                this.ctx.fillRect(0, 0, 300, 100);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Loading...', 150, 50);
            }
            return; // Don't render anything else when showing banner
        }

        // Draw center line
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(150, 0);
        this.ctx.lineTo(150, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw only top and bottom borders
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);
        
        // Top border
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.canvas.width, 0);
        this.ctx.stroke();
        
        // Bottom border
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.stroke();

        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
            this.playerPaddle.x,
            this.playerPaddle.y,
            this.paddleWidth,
            this.paddleHeight
        );
        this.ctx.fillRect(
            this.aiPaddle.x,
            this.aiPaddle.y,
            this.paddleWidth,
            this.paddleHeight
        );

        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();

        // Draw start message, serve message, or game end message
        if (this.gameEnded && this.winner) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.winner} Wins!`, 150, 90);
            this.ctx.font = '10px Arial';
            this.ctx.fillText('Click to play again', 150, 110);
            console.log(`Rendering winner: ${this.winner}`);
        } else if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click to Start', 150, 100);
        } else if (this.serving && this.serveDelay > 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('AI serving...', 150, 100);
        } else if (this.ball.speedX === 0 && this.ball.speedY === 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            // Show deuce indicator
            if (this.playerScore >= 10 && this.aiScore >= 10) {
                this.ctx.fillText(`DEUCE - ${this.whoServes === 'ai' ? 'AI' : 'Player'} serves`, 150, 100);
            } else {
                this.ctx.fillText(`${this.whoServes === 'ai' ? 'AI' : 'Player'} - Hit the ball to serve!`, 150, 100);
            }
        }
    }
    
    gameLoop() {
        this.updateGame();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new TableTennisGame();
});