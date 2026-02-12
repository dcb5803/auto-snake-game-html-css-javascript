const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const statusText = document.getElementById("mode-statusText");

// Game Constants
const box = 20;
let score = 0;
let gameMode = "manual"; 
let direction = "RIGHT";
let nextDirection = "RIGHT";
let snake = [{ x: 10 * box, y: 10 * box }];
let food = spawnFood();

// Initialize Game Loop
let gameInterval = setInterval(gameLoop, 100);

// Set Mode Function
window.setMode = function(mode) {
    gameMode = mode;
    statusText.innerText = mode.charAt(0).toUpperCase() + mode.slice(1);
    
    // Toggle Button Styles
    document.getElementById("manualBtn").classList.toggle("active", mode === 'manual');
    document.getElementById("autoBtn").classList.toggle("active", mode === 'auto');
};

// Input Listener
document.addEventListener("keydown", (e) => {
    if (gameMode !== "manual") return;
    if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
    else if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    else if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
    else if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
});

function spawnFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}

// AI Pathfinding: Simple Greedy algorithm avoiding immediate death
function getAiMove() {
    const head = snake[0];
    const moves = [
        { dir: "UP", x: head.x, y: head.y - box },
        { dir: "DOWN", x: head.x, y: head.y + box },
        { dir: "LEFT", x: head.x - box, y: head.y },
        { dir: "RIGHT", x: head.x + box, y: head.y }
    ];

    // Filter out moves that hit walls or snake body
    const safeMoves = moves.filter(move => {
        const hitWall = move.x < 0 || move.x >= canvas.width || move.y < 0 || move.y >= canvas.height;
        const hitSelf = snake.some(segment => segment.x === move.x && segment.y === move.y);
        return !hitWall && !hitSelf;
    });

    if (safeMoves.length === 0) return direction; // Give up if no safe moves

    // Sort safe moves by Manhattan distance to food
    safeMoves.sort((a, b) => {
        const distA = Math.abs(a.x - food.x) + Math.abs(a.y - food.y);
        const distB = Math.abs(b.x - food.x) + Math.abs(b.y - food.y);
        return distA - distB;
    });

    return safeMoves[0].dir;
}

function gameLoop() {
    if (gameMode === "auto") {
        direction = getAiMove();
    } else {
        direction = nextDirection;
    }

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "UP") headY -= box;
    if (direction === "DOWN") headY += box;
    if (direction === "LEFT") headX -= box;
    if (direction === "RIGHT") headX += box;

    // Check Wall Collision
    if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height) {
        return resetGame();
    }

    // Check Self Collision
    if (snake.some(segment => segment.x === headX && segment.y === headY)) {
        return resetGame();
    }

    const newHead = { x: headX, y: headY };

    // Check Food Collision
    if (headX === food.x && headY === food.y) {
        score++;
        scoreElement.innerText = `Score: ${score}`;
        food = spawnFood();
    } else {
        snake.pop();
    }

    snake.unshift(newHead);
    draw();
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(food.x + box/2, food.y + box/2, box/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#4CAF50" : "#2E7D32";
        ctx.fillRect(part.x, part.y, box - 1, box - 1);
    });
}

window.resetGame = function() {
    snake = [{ x: 10 * box, y: 10 * box }];
    food = spawnFood();
    score = 0;
    scoreElement.innerText = "Score: 0";
    direction = "RIGHT";
    nextDirection = "RIGHT";
};
