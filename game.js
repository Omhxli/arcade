const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

// Load images
const skullImg = new Image();
skullImg.src = 'images/skull.png';

const glassImg = new Image();
glassImg.src = 'images/glass.png';

const flameImg = new Image();
flameImg.src = 'images/flame.png';

// Game variables
const flames = [];
let glasses = [];
let glassesCollected = 0;
let score = 0;
let lives = 3;
let gameOver = false;
let hit = false;
let pause = false;

const skull = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    size: 50,
    speed: 5
};

const keys = {};

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function moveSkull() {
    if (keys['w'] || keys['ArrowUp']) skull.y -= skull.speed;
    if (keys['s'] || keys['ArrowDown']) skull.y += skull.speed;
    if (keys['a'] || keys['ArrowLeft']) skull.x -= skull.speed;
    if (keys['d'] || keys['ArrowRight']) skull.x += skull.speed;

    skull.x = Math.max(0, Math.min(skull.x, canvas.width - skull.size));
    skull.y = Math.max(0, Math.min(skull.y, canvas.height - skull.size));
}

function spawnGlass() {
    let x = getRandomInt(50, canvas.width - 50);
    let y = getRandomInt(50, canvas.height - 50);
    glasses = [{ x, y, size: 30 }];
}

function drawGlasses() {
    glasses.forEach(glass => {
        ctx.drawImage(glassImg, glass.x, glass.y, glass.size, glass.size);
    });
}

function checkGlassCollision() {
    glasses = glasses.filter(glass => {
        if (
            skull.x < glass.x + glass.size &&
            skull.x + skull.size > glass.x &&
            skull.y < glass.y + glass.size &&
            skull.y + skull.size > glass.y
        ) {
            glassesCollected++;
            score += 5;
            spawnFlames(glassesCollected);
            return false;
        }
        return true;
    });

    if (glasses.length === 0) {
        spawnGlass();
    }
}

function spawnFlames(numFlames) {
    for (let i = 0; i < numFlames; i++) {
        const side = getRandomInt(1, 5);
        let flame = { x: 0, y: 0, size: 30, speedX: 0, speedY: 0 };

        if (side === 1) {
            flame.x = getRandomInt(0, canvas.width - flame.size);
            flame.y = 0;
            flame.speedY = 2;
        } else if (side === 2) {
            flame.x = canvas.width - flame.size;
            flame.y = getRandomInt(0, canvas.height - flame.size);
            flame.speedX = -2;
        } else if (side === 3) {
            flame.x = getRandomInt(0, canvas.width - flame.size);
            flame.y = canvas.height - flame.size;
            flame.speedY = -2;
        } else if (side === 4) {
            flame.x = 0;
            flame.y = getRandomInt(0, canvas.height - flame.size);
            flame.speedX = 2;
        }

        flames.push(flame);
    }
}

// Improved collision detection for skull-flame collision
function checkFlameCollision() {
    flames.forEach(flame => {
        if (!hit && 
            skull.x < flame.x + flame.size &&
            skull.x + skull.size > flame.x &&
            skull.y < flame.y + flame.size &&
            skull.y + skull.size > flame.y
        ) {
            hit = true;
            lives--;
            document.getElementById('lives').innerText = lives;

            if (lives > 0) {
                resetGame();
            } else {
                gameOver = true;
                displayGameOver();
            }
        }
    });
}

function resetGame() {
    pause = true;
    setTimeout(() => {
        skull.x = canvas.width / 2 - 25;
        skull.y = canvas.height / 2 - 25;

        // Clear flames and respawn them based on collected glasses
        flames.length = 0;
        spawnFlames(glassesCollected);

        // Clear glasses and spawn a new one
        glasses = [];
        spawnGlass();

        pause = false;
        hit = false;
    }, 3000);
}

function displayGameOver() {
    ctx.fillStyle = "orange";
    
    // Game Over message
    ctx.font = "40px Arial";
    const gameOverText = "Game Over!";
    const gameOverTextWidth = ctx.measureText(gameOverText).width;
    ctx.fillText(gameOverText, (canvas.width / 2) - (gameOverTextWidth / 2), canvas.height / 2);

    // Refresh to play again message
    ctx.font = "20px Arial";
    const refreshText = "Refresh to play again";
    const refreshTextWidth = ctx.measureText(refreshText).width;
    ctx.fillText(refreshText, (canvas.width / 2) - (refreshTextWidth / 2), canvas.height / 2 + 40);
}

function moveFlames() {
    flames.forEach(flame => {
        flame.x += flame.speedX;
        flame.y += flame.speedY;
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(skullImg, skull.x, skull.y, skull.size, skull.size);
    drawGlasses();
    flames.forEach(flame => {
        ctx.drawImage(flameImg, flame.x, flame.y, flame.size, flame.size);
    });

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    if (gameOver) {
        displayGameOver();
    }
}
function updateScore() {
    document.getElementById('score').innerText = score;
}

// Call updateScore() wherever the score changes
function checkGlassCollision() {
    glasses = glasses.filter(glass => {
        if (
            skull.x < glass.x + glass.size &&
            skull.x + skull.size > glass.x &&
            skull.y < glass.y + glass.size &&
            skull.y + skull.size > glass.y
        ) {
            glassesCollected++;
            score += 5;

            // Update the score in the HTML whenever it changes
            updateScore();

            spawnFlames(glassesCollected);  // Spawn flames after collecting glass
            return false;  // Remove glass after collection
        }
        return true;
    });

    // Spawn new glass if none left
    if (glasses.length === 0) {
        spawnGlass();
    }
}

function gameLoop() {
    if (!pause && !gameOver) {
        moveSkull();
        moveFlames();
        checkGlassCollision();
        checkFlameCollision();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

spawnGlass();
gameLoop();
