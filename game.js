const player = document.getElementById('player');
const gameWindow = document.getElementById('game-window');
const coinCountDisplay = document.getElementById('coin-count');
const livesCountDisplay = document.getElementById('lives-count');

// Physics & Game Variables
let playerX = 50;
let playerY = 40;
let velocityY = 0;
let isJumping = false;
let cameraX = 0;
let score = 0;
let lives = 3;

const gravity = 0.6;
const jumpForce = 12;
const moveSpeed = 5;

// Keep track of keys pressed
const keys = {};

// Level Obstacles data for collision checking
const platforms = [
    { left: 0, bottom: 0, width: 1300, height: 40 },
    { left: 200, bottom: 120, width: 120, height: 30 },
    { left: 400, bottom: 180, width: 150, height: 30 },
    { left: 650, bottom: 120, width: 100, height: 30 },
    { left: 850, bottom: 200, width: 150, height: 30 }
];

let coins = Array.from(document.querySelectorAll('.coin')).map(el => ({
    element: el,
    left: parseInt(el.style.left),
    bottom: parseInt(el.style.bottom),
    collected: false
}));

let enemies = [
    { element: document.getElementById('enemy1'), left: 450, start: 400, end: 550, dir: 1, speed: 1.5 },
    { element: document.getElementById('enemy2'), left: 880, start: 850, end: 980, dir: 1, speed: 2 }
];

// Input Listeners
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function updateGame() {
    // 1. Handle Horizontal Movement
    if (keys['ArrowRight']) {
        playerX += moveSpeed;
    }
    if (keys['ArrowLeft'] && playerX > 10) {
        playerX -= moveSpeed;
    }

    // 2. Handle Jumping
    if ((keys['Space'] || keys['ArrowUp']) && !isJumping) {
        velocityY = jumpForce;
        isJumping = true;
    }

    // Apply gravity
    velocityY -= gravity;
    playerY += velocityY;

    // 3. Collision with Platforms
    let onGround = false;
    
    platforms.forEach(plat => {
        // Check alignment overhead/underfoot
        if (playerX + 30 > plat.left && playerX < plat.left + plat.width) {
            // Landing on top of a platform
            if (playerY >= plat.bottom + plat.height - 10 && playerY + velocityY <= plat.bottom + plat.height) {
                playerY = plat.bottom + plat.height;
                velocityY = 0;
                isJumping = false;
                onGround = true;
            }
        }
    });

    if (!onGround && playerY > 40) {
        isJumping = true;
    }

    // Prevent falling past bottom of screen
    if (playerY < 40) {
        playerY = 40;
        velocityY = 0;
        isJumping = false;
    }

    // 4. Update Camera / Side-Scrolling
    if (playerX > 300) {
        cameraX = playerX - 300;
    }
    gameWindow.style.backgroundPosition = `-${cameraX * 0.5}px 0px`;
    
    // Shift elements relative to the camera view
    player.style.left = `${playerX - cameraX}px`;
    player.style.bottom = `${playerY}px`;

    document.querySelectorAll('.platform').forEach((plat, index) => {
        plat.style.left = `${platforms[index].left - cameraX}px`;
    });

    document.querySelector('.flag').style.left = `${1150 - cameraX}px`;

    // 5. Check Coin Collection
    coins.forEach(coin => {
        if (!coin.collected && playerX + 30 > coin.left && playerX < coin.left + 20 &&
            playerY + 38 > coin.bottom && playerY < coin.bottom + 20) {
            coin.collected = true;
            coin.element.style.display = 'none';
            score++;
            coinCountDisplay.innerText = score;
        }
        coin.element.style.left = `${coin.left - cameraX}px`;
    });

    // 6. Move & Update Enemies
    enemies.forEach(enemy => {
        enemy.left += enemy.speed * enemy.dir;
        if (enemy.left > enemy.end || enemy.left < enemy.start) {
            enemy.dir *= -1; // Reverse direction
        }
        enemy.element.style.left = `${enemy.left - cameraX}px`;

        // Check Hit/Collision with Enemy
        if (playerX + 30 > enemy.left && playerX < enemy.left + 25 &&
            playerY < 40 + 25 && playerY > 40) {
            
            // Did Mario jump on top of the enemy?
            if (velocityY < 0 && playerY > 50) {
                enemy.element.style.display = 'none';
                enemies = enemies.filter(e => e !== enemy);
                velocityY = 8; // Bounce up
            } else {
                // Mario took damage
                resetPlayer();
            }
        }
    });

    // 7. Win Condition (Reached Flag)
    if (playerX >= 1150) {
        alert("🎉 You Win! Thank you for playing!");
        playerX = 50;
        cameraX = 0;
    }

    requestAnimationFrame(updateGame);
}

function resetPlayer() {
    lives--;
    livesCountDisplay.innerText = lives;
    if (lives <= 0) {
        alert("Game Over! Try again.");
        lives = 3;
        score = 0;
        coinCountDisplay.innerText = score;
        livesCountDisplay.innerText = lives;
    }
    playerX = 50;
    playerY = 40;
    velocityY = 0;
    cameraX = 0;
}

// Start Game Loop
requestAnimationFrame(updateGame);
