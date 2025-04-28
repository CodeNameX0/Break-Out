const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
const ballRadius = 10;
let x = Math.random() * (canvas.width - 2 * ballRadius) + ballRadius; // 무작위 시작 위치
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 100; // 패들 너비를 100으로 설정
let paddleX = (canvas.width - paddleWidth) / 2;

// Key controls
let rightPressed = false;
let leftPressed = false;

// Brick properties
const brickRowCount = 5;
const brickColumnCount = 4; // 좌우 대칭을 위해 4개의 열로 설정
const brickWidth = 85; // 벽돌 너비를 조정하여 간격을 맞춤
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding) - brickPadding)) / 2; // 중앙 정렬

let bricks = [];
function initializeBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }; // status: 1 means the brick is visible
        }
    }
}
initializeBricks();

// Score and Level
let score = 0;
let level = 1;

// Game state
let gameStarted = false;

// Event listeners for key presses and touch events
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
canvas.addEventListener("touchstart", touchStartHandler);
canvas.addEventListener("touchmove", touchMoveHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Handle touch start
function touchStartHandler(e) {
    const touchX = e.touches[0].clientX - canvas.offsetLeft;
    updatePaddlePosition(touchX);
    e.preventDefault(); // Prevent scrolling during touch
}

// Handle touch move
function touchMoveHandler(e) {
    const touchX = e.touches[0].clientX - canvas.offsetLeft;
    updatePaddlePosition(touchX);
    e.preventDefault(); // Prevent scrolling during touch
}

// Update paddle position based on touch
function updatePaddlePosition(touchX) {
    // Smoothly update paddle position
    const targetX = touchX - paddleWidth / 2;

    // Prevent paddle from going out of bounds
    if (targetX < 0) {
        paddleX = 0;
    } else if (targetX + paddleWidth > canvas.width) {
        paddleX = canvas.width - paddleWidth;
    } else {
        paddleX = targetX;
    }
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Draw the paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Draw the bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Draw the score and level
function drawScoreAndLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
    ctx.fillText("Level: " + level, canvas.width - 80, 20);
}

// Collision detection for bricks
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    x > b.x &&
                    x < b.x + brickWidth &&
                    y > b.y &&
                    y < b.y + brickHeight
                ) {
                    dy = -dy;
                    b.status = 0; // Brick is destroyed
                    score++;
                    if (score === brickRowCount * brickColumnCount * level) {
                        nextLevel();
                    }
                }
            }
        }
    }
}

// Move to the next level
function nextLevel() {
    alert("Level " + level + " Complete!");
    level++;
    dx *= 1.2; // Increase ball speed
    dy *= 1.2;
    initializeBricks(); // Reset bricks
    x = Math.random() * (canvas.width - 2 * ballRadius) + ballRadius; // Reset ball position
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2; // Reset paddle position
}

// Update the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScoreAndLevel();
    collisionDetection();

    // Ball collision with walls
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        // Ball hits the paddle
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            // Game over
            alert("GAME OVER! You reached Level " + level);
            document.location.reload(); // Reload the page
            return;
        }
    }

    // Paddle movement (확장된 이동 범위)
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 10; // 이동 속도는 유지
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 10; // 이동 속도는 유지
    }

    // Update ball position
    x += dx;
    y += dy;

    requestAnimationFrame(draw); // Use requestAnimationFrame for smoother animation
}

// Start the game
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        draw(); // Start the game loop
    }
}

// Add a "Start" button
const startButton = document.createElement("button");
startButton.textContent = "Start";
startButton.style.position = "absolute";
startButton.style.top = "50%";
startButton.style.left = "50%";
startButton.style.transform = "translate(-50%, -50%)";
startButton.style.padding = "10px 20px";
startButton.style.fontSize = "16px";
document.body.appendChild(startButton);

startButton.addEventListener("click", () => {
    startButton.style.display = "none"; // Hide the button
    startGame();
});
