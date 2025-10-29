// --- 1. DOM Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverlay = document.getElementById('gameOverlay');
const startButton = document.getElementById('startButton');
const gameOverTitle = document.getElementById('gameOverTitle');
const startText = document.getElementById('startText');
const difficultySelect = document.getElementById('difficulty');

// Virtual control buttons
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// --- 2. Game Constants ---
const gridSize = 20; 
let canvasSize;
let tileCount; 

// --- 3. Game State ---
let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let isGameOver = false;
let gameLoopInterval = null;
let gameSpeed; // Will be set by difficulty

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

// --- 4. Game Functions ---

/**
 * Resizes the canvas to fit its container and calculates the grid.
 */
function resizeCanvas() {
    // Make canvas dimensions a multiple of the grid size
    // Use clientWidth of the parent container for a responsive fit
    const container = canvas.parentElement;
    canvasSize = Math.floor(container.clientWidth / gridSize) * gridSize; 
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    tileCount = canvasSize / gridSize;
}

/**
 * Initializes or resets the game to its starting state
 */
function initializeGame() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }
    
    // Set game speed from the dropdown
    gameSpeed = parseInt(difficultySelect.value);
    
    snake = [
        { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) } 
    ];
    direction = 'right';
    score = 0;
    isGameOver = false;
    
    scoreEl.textContent = score;
    gameOverlay.classList.remove('hidden');
    gameOverTitle.classList.add('hidden');
    startText.classList.remove('hidden');
    startButton.textContent = 'Start Game';
    startButton.classList.remove('bg-red-600', 'hover:bg-red-500');
    startButton.classList.add('bg-green-600', 'hover:bg-green-500');
    
    // Enable difficulty selection
    difficultySelect.disabled = false;

    generateFood();
    draw(); 
}

/**
 * Starts the main game loop
 */
function startGame() {
    if (isGameOver) {
        initializeGame(); // Reset if starting from game over
    }
    
    isGameOver = false;
    gameOverlay.classList.add('hidden');
    // Disable difficulty select while playing
    difficultySelect.disabled = true; 
    // Get speed *right before* starting
    gameSpeed = parseInt(difficultySelect.value); 
    
    gameLoopInterval = setInterval(update, gameSpeed);
}

/**
 * The main game loop function, called every `gameSpeed` milliseconds
 */
function update() {
    if (isGameOver) return;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Check for Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return triggerGameOver();
    }
    // Check for Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return triggerGameOver();
        }
    }

    snake.unshift(head);

    // Check for Food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

/**
 * Draws all game elements (snake, food) onto the canvas
 */
function draw() {
    ctx.fillStyle = '#1f2937'; // gray-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#10B981'; // green-500
    for (const segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.Y * gridSize, gridSize - 1, gridSize - 1);
    }
    // Make the head stand out
    ctx.fillStyle = '#34D399'; // green-400
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);


    // Draw food
    ctx.fillStyle = '#EF4444'; // red-500
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
}

/**
 * Generates a new piece of food in a valid location
 */
function generateFood() {
    let foodOnSnake = true;
    while (foodOnSnake) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        foodOnSnake = snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

/**
 * Ends the game and shows the game over screen
 */
function triggerGameOver() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    
    gameOverlay.classList.remove('hidden');
    gameOverTitle.classList.remove('hidden');
    startText.classList.add('hidden');
    startButton.textContent = 'Restart Game';
    startButton.classList.remove('bg-green-600', 'hover:bg-green-500');
    startButton.classList.add('bg-red-600', 'hover:bg-red-500');
    
    // Re-enable difficulty selection
    difficultySelect.disabled = false;
}

/**
 * Central function to change the snake's direction
 */
function setDirection(newDirection) {
    if (isGameOver) return;
    
    // Prevent 180-degree turns
    if (newDirection === 'up' && direction !== 'down') {
        direction = 'up';
    } else if (newDirection === 'down' && direction !== 'up') {
        direction = 'down';
    } else if (newDirection === 'left' && direction !== 'right') {
        direction = 'left';
    } else if (newDirection === 'right' && direction !== 'left') {
        direction = 'right';
    }
}

/**
 * Handles keyboard input
 */
function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ' ') && (isGameOver || gameOverlay.classList.contains('hidden') === false)) {
         e.preventDefault();
         startGame();
         return;
    }

    switch (e.key) {
        case 'ArrowUp': case 'w': setDirection('up'); break;
        case 'ArrowDown': case 's': setDirection('down'); break;
        case 'ArrowLeft': case 'a': setDirection('left'); break;
        case 'ArrowRight': case 'd': setDirection('right'); break;
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
}

// --- 5. Event Listeners ---

// Keyboard controls
document.addEventListener('keydown', handleKeyDown);

// Start/Restart button
startButton.addEventListener('click', startGame);

// Resize listener
window.addEventListener('resize', () => {
    resizeCanvas();
    initializeGame(); 
});

// --- Touch Controls (Swipe) ---
document.addEventListener('touchstart', (e) => {
    // Don't interfere with button clicks
    if (e.target.closest('button')) return; 
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (isGameOver) return;
    e.preventDefault(); 
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (isGameOver || e.target.closest('button')) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDirection(deltaX > 0 ? 'right' : 'left');
    } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
        setDirection(deltaY > 0 ? 'down' : 'up');
    }
}, { passive: true });

// --- Virtual Button Listeners ---
// Use 'click' for simplicity, it works well on mobile
upBtn.addEventListener('click', () => setDirection('up'));
downBtn.addEventListener('click', () => setDirection('down'));
leftBtn.addEventListener('click', () => setDirection('left'));
rightBtn.addEventListener('click', () => setDirection('right'));

// --- 6. Initial Setup ---
// We must wait for the DOM to be fully loaded before we can find our elements
// The 'defer' attribute in the <script> tag handles this,
// so we can safely run the setup code at the top level.
resizeCanvas();
initializeGame();
