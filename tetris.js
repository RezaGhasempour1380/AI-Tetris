// Define the canvas and context for drawing
const canvas = document.getElementById("tetrisCanvas");
const context = canvas.getContext("2d");

const square_size=20; // Define the size of each square in pixels

const WIDTH2 = 140; // Width of the extra canvas
const HEIGHT2 = 140; // Height of the extra canvas

// Define the size of the game board
const ROWS = 30;
const COLUMNS = 15;

const WIDTH = COLUMNS * square_size; // Width of the game board
const HEIGHT = ROWS * square_size; // Height of the game board

const CELL_SIZE = 30; // Define the size of each cell in pixels

const extraCanvas = document.getElementById("extraCanvas");
extraCanvas.width = WIDTH2;
extraCanvas.height = HEIGHT2;

const ROWS_EXTRA = WIDTH2 / square_size; // Number of rows in the extra canvas
const COLUMNS_EXTRA = HEIGHT2 / square_size; // Number of columns in the extra canvas

const gameBoard = []; // Initialize the game board array

// Fill the game board array with empty cells
for (let row = 0; row < ROWS; row++) {
    const newRow = Array(COLUMNS).fill(0);
    gameBoard.push(newRow);
}

const gameBoardExtra = []; // Initialize the extra game board array

// Fill the extra game board array with empty cells
for (let row = 0; row < ROWS_EXTRA; row++) {
    const newRow = Array(COLUMNS_EXTRA).fill(0);
    gameBoardExtra.push(newRow);
}

const tetriminos = [
    [
        // L Tetrimino
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 1]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ],
    ],
    [
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0]
        ],
        [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    ],
    [
        // T Tetrimino
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],

        [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0]
        ]
    ],
    [
        // Square Tetrimio
        [
            [1, 1],
            [1, 1]
        ],
    ],
    [
        //Ugly L Tetrimio
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1]
        ],
    ],
    [
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0]
        ],
    ],
    [    
        //Line Tetrimios
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        [
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
    ]        
];

const tetriminoColors = [
    'blue',    // Color for L Tetrimino
    'red',     // Color for J Tetrimino
    'green',   // Color for T Tetrimino
    'pink',  // Color for Square Tetrimino
    'purple',  // Color for Ugly L Tetrimino
    'orange',  // Color for S Tetrimino
    'cyan'     // Color for Line Tetriminos
]

const nexttetriminoColors = [
    'blue',    // Color for L Tetrimino
    'red',     // Color for J Tetrimino
    'green',   // Color for T Tetrimino
    'pink',  // Color for Square Tetrimino
    'purple',  // Color for Ugly L Tetrimino
    'orange',  // Color for S Tetrimino
    'cyan'     // Color for Line Tetriminos
]

const cellColors = []; // Array to store the color information for each cell on the game board

for (let row = 0; row < ROWS; row++) {
    const newRow = Array(COLUMNS).fill(null);
    cellColors.push(newRow);
}

let ctx;
let next_shape_index = 0;
let next_rotation_index = 0;
let current_shape_index = 0;
let current_rotation_index = 0;
let tetriminoX = 0;
let tetriminoY = 0;
let direction=''
let isMoveRightKeyPressed = false;
let isMoveLeftKeyPressed = false;
let isMoveDownFastKeyPressed = false;
let lastMoveTimestamp = 0;
const moveDelay = 300; // Set the delay in milliseconds
let interval;
let points = 0;
let timer = 0;
let lines_completed = 0;
let refreshrate = 350 ;


// Function to handle keyboard input
function handle_input(event){
    
    if (event.key == ' '){
        rotate();
    }
    if ((event.key == 'd' || event.key === 'D' || event.key === 'ArrowRight') && !isMoveRightKeyPressed) {
        const currentTime = new Date().getTime();
        if (currentTime - lastMoveTimestamp >= moveDelay) {
            isMoveRightKeyPressed = true;
            move_right();
            lastMoveTimestamp = currentTime;
        }
    }
    if ((event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') && !isMoveLeftKeyPressed) {
        const currentTime = new Date().getTime();
        if (currentTime - lastMoveTimestamp >= moveDelay) {
            isMoveLeftKeyPressed = true;
            move_left();
            lastMoveTimestamp = currentTime;
        }
    }
    if ((event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') && !isMoveDownFastKeyPressed) {
        isMoveDownFastKeyPressed = true;
        move_down_fast();
    }
    if (event.key == 'r' || event.key == 'R'){
        resetGame()
    }
}

function handle_keyup(event) {
    if (event.key == 'd') {
        isMoveRightKeyPressed = false;
    }
    if (event.key == 'D') {
        isMoveRightKeyPressed = false;
    }
    if (event.key == 'ArrowRight') {
        isMoveRightKeyPressed = false;
    }
    if (event.key == 'a') {
        isMoveLeftKeyPressed = false;
    }
    if (event.key == 'A') {
        isMoveLeftKeyPressed = false;
    }
    if (event.key == 'ArrowLeft') {
        isMoveLeftKeyPressed = false;
    }
    if (event.key == 's') {
        isMoveDownFastKeyPressed = false;
    }
    if (event.key == 'S') {
        isMoveDownFastKeyPressed = false;
    }
    if (event.key == 'ArrowDown') {
        isMoveDownFastKeyPressed = false;
    }

}

function get_ai_move()
{
    let data = JSON.stringify({
        "board": gameBoard,
        "current_shape": current_shape_index,
        "current_rotation": current_rotation_index,
        "x": tetriminoX,
        "y": tetriminoY
    });
    let action = get_move(data);

    switch (action) {
        case "LEFT":
            move_left();
            break;
        case "RIGHT":
            move_right();
            break;
        case "ROTATE":
            rotate();
            break;
        default:
            break;

    }
    console.log(action)
}

function initGame(){
    canvas_element = document.getElementById("tetrisCanvas");
    window.addEventListener("keydown", handle_input)
    window.addEventListener("keyup", handle_keyup);


    // Choose a random Tetrimino type for the initial piece
    current_shape_index = Math.floor(Math.random() * tetriminos.length);

    // Choose a random rotation index for the initial piece
    current_rotation_index = Math.floor(Math.random() * tetriminos[current_shape_index].length);


    // Choose a new Tetrimino type for the next piece
    next_shape_index = Math.floor(Math.random() * tetriminos.length);
    next_rotation_index = Math.floor(Math.random() * tetriminos[next_shape_index].length);


    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 0;

    interval = setInterval(main_loop, refreshrate);

    ctx = canvas_element.getContext("2d");
    ctx.canvas.width=WIDTH; 
    ctx.canvas.height=HEIGHT;
}

function rotate_shape(shape_index, rotation_index) {
    shape_rotations = tetriminos[shape_index];

    return (rotation_index + 1) % shape_rotations.length
}

function rotate() {
    let next_rotation_index = rotate_shape(current_shape_index, current_rotation_index)
    if(!isCollisionWithMove(tetriminoX, tetriminoY, current_shape_index, next_rotation_index)){
        current_rotation_index = next_rotation_index;
    }
}

function render_background(canvas) {
    const ctx = canvas.getContext("2d");
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the grid lines
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000"; // Set the color of the grid lines
    ctx.lineWidth = 1; // Set the width of the grid lines

    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += square_size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += square_size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function next_render_shape(canvas, shape, x, y, colorArray) {
    const ctx = canvas.getContext("2d");
    const color = colorArray[next_shape_index];  // Assign color based on shape index

    ctx.fillStyle = color;
    for (let row = 0; row < shape.length; row++) {
        for (let column = 0; column < shape.length; column++){
            if (shape[row][column] == 1) {
                let canvasX = (column + x) * square_size;
                let canvasY = (row + y) * square_size;
                
                // Draw the filled square
                ctx.fillRect(canvasX, canvasY, square_size, square_size);

                // Draw the grid lines for the square
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.strokeRect(canvasX, canvasY, square_size, square_size);
            }
        }
    }
}

function render_shape(canvas, shape, x, y, colorArray) {
    const ctx = canvas.getContext("2d");
    const color = colorArray[current_shape_index];  // Assign color based on shape index

    ctx.fillStyle = color;
    for (let row = 0; row < shape.length; row++) {
        for (let column = 0; column < shape.length; column++){
            if (shape[row][column] == 1) {
                let canvasX = (column + x) * square_size;
                let canvasY = (row + y) * square_size;
                
                // Draw the filled square
                ctx.fillRect(canvasX, canvasY, square_size, square_size);

                // Draw the grid lines for the square
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.strokeRect(canvasX, canvasY, square_size, square_size);
            }
        }
    }
}

function renderBoard() {
    // Update the color array first
    for (let row = 0; row < gameBoard.length; row++) {
        for (let col = 0; col < gameBoard[row].length; col++) {
            if (gameBoard[row][col] === 1) {
                const colorIndex = gameBoard[row][col] - 1;
                const color = tetriminoColors[colorIndex];
                const isCellOccupied = cellColors[row][col] !== null;

                // Only update the color if the cell is not occupied by another Tetrimino
                if (!isCellOccupied) {
                    cellColors[row][col] = color;
                }
            }
        }
    }

    // Now render the board
    for (let row = 0; row < gameBoard.length; row++) {
        for (let col = 0; col < gameBoard[row].length; col++) {
            if (gameBoard[row][col] === 1) {
                const color = cellColors[row][col];

                ctx.fillStyle = color;
                ctx.fillRect(col * square_size, row * square_size, square_size, square_size);

                // Optionally, you can draw a border around each block
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.strokeRect(col * square_size, row * square_size, square_size, square_size);
            }
        }
    }
}

function stop() {
    // Clear the game board and stop the game loop
    clearInterval(interval);

    // Show the "Game Over" overlay
    document.getElementById("gameOverOverlay").style.display = "flex";
}

function move_down() {
    let newTetriminoY = tetriminoY + 1;

    // Check if the move is valid (no collision and within bounds)
    if (!isCollisionWithMove(tetriminoX, newTetriminoY, current_shape_index, current_rotation_index)) {
        tetriminoY = newTetriminoY;
    } else {
        // If the Tetrimino has hit the bottom, spawn a new one
        spawnNewTetrimino();
    }
}

function move_down_fast() {
    // Move the piece down continuously until a collision is detected
    while (!isCollisionWithMove(tetriminoX, tetriminoY + 1, current_shape_index, current_rotation_index)) {
        tetriminoY++;
    }
}


function move_right() {
    let newTetriminoX = tetriminoX + 1;

    // Check if the move is valid (no collision and within bounds)
    if (!isCollisionWithMove(newTetriminoX, tetriminoY, current_shape_index, current_rotation_index)) {
        tetriminoX = newTetriminoX;

    }
}
function move_left() {
    let newTetriminoX = tetriminoX - 1;

    // Check if the move is valid (no collision and within bounds)
    if (!isCollisionWithMove(newTetriminoX, tetriminoY, current_shape_index, current_rotation_index)) {
        tetriminoX = newTetriminoX;

    }
}

function clearCompletedLines() {
    for (let row = 0; row < ROWS ; row++) {
        if (gameBoard[row].every(cell => cell === 1)) {
            // Remove the completed line
            gameBoard.splice(row, 1);
            
            // Add a new empty line at the top
            gameBoard.unshift(Array(COLUMNS).fill(0));

            // Adjust the cellColors array accordingly
            cellColors.splice(row, 1);
            cellColors.unshift(Array(COLUMNS).fill(null));
            // Increment lines_completed
            lines_completed++;
        }
    }
}

function spawnNewTetrimino() {
    // Save the current Tetrimino on the game board
    saveTetriminoOnBoard();
    
    current_shape_index = next_shape_index;
    current_rotation_index = next_rotation_index;

    // Choose a new Tetrimino type for the next piece
    next_shape_index = Math.floor(Math.random() * tetriminos.length);
    next_rotation_index = Math.floor(Math.random() * tetriminos[next_shape_index].length);

    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 0;

    // Check and clear completed lines
    clearCompletedLines();

    if (isCollisionWithMove(tetriminoX, tetriminoY, current_shape_index, current_rotation_index)) {
         // Show "Game Over" message
        stop(); // Stop the game loop
    }
}

function saveTetriminoOnBoard() {
    const currentShape = tetriminos[current_shape_index][current_rotation_index];

    for (let row = 0; row < currentShape.length; row++) {
        for (let col = 0; col < currentShape[row].length; col++) {
            if (currentShape[row][col] === 1) {
                const boardX = tetriminoX + col;
                const boardY = tetriminoY + row;

                // Save the Tetrimino on the game board
                gameBoard[boardY][boardX] = 1;
                // Update the color array with the Tetrimino's color
                const colorIndex = current_shape_index;
                const color = tetriminoColors[colorIndex];
                cellColors[boardY][boardX] = color;
            }
        }
    }
}

function isCollisionWithMove(newX, newY, shapeIndex, rotationIndex) {
    const currentShape = tetriminos[shapeIndex][rotationIndex];
    for (let row = 0; row < currentShape.length; row++) {
        for (let col = 0; col < currentShape[row].length; col++) {
            if (currentShape[row][col] === 1) {
                const boardX = newX + col;
                const boardY = newY + row;

                // Check for collisions with the game board boundaries and other Tetriminos
                if (
                    boardX < 0 ||
                    boardX >= COLUMNS ||
                    boardY >= ROWS ||
                    (boardY >= 0 && gameBoard[boardY][boardX] === 1)
                ) {
                    return true; // Collision detected
                }
            }
        }
    }

    return false; // No collision detected
}

function clearboard() {
    for (let row = 0; row < ROWS; row++) {
        gameBoard[row].fill(0); // Clear each row by filling with 0
        cellColors[row].fill(null); // Reset cell colors to null
    }
}

function resetGame() {
    // Clear the game board and reset any other necessary variables
    clearboard();

    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 0;

    // Reset game variables
    isMoveRightKeyPressed = false;
    isMoveLeftKeyPressed = false;
    isMoveDownFastKeyPressed = false;
    lastMoveTimestamp = 0;
    timer = 0;
    points = 0;

    // Clear the interval and restart the game loop
    clearInterval(interval);
    interval = setInterval(main_loop, refreshrate);

    // Hide the "Game Over" overlay
    document.getElementById("gameOverOverlay").style.display = "none";
}

function main_loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Clear the tetrisCanvas and render its background
    const tetrisCanvas = document.getElementById("tetrisCanvas");
    const extraCanvas = document.getElementById("extraCanvas");
    get_ai_move();
    // Move and spawn new shape if necessary
    move_down();

    const currentShape = tetriminos[current_shape_index][current_rotation_index];
    const nextShape = tetriminos[next_shape_index][next_rotation_index];

    render_background(tetrisCanvas);
    // Clear the extraCanvas and render its background
    render_background(extraCanvas);
  
    render_shape(tetrisCanvas, currentShape, tetriminoX, tetriminoY, tetriminoColors);
    // Render the next Tetrimino at a specific location (adjust coordinates as needed)
    next_render_shape(extraCanvas, nextShape, 2, 2, nexttetriminoColors);
  
    renderBoard();

    // Increment timer
    timer += 0.35;

    // Update points based on time survived
    points = Math.floor(timer) + lines_completed * 100;

 
    // Update the display of timer and points
    document.getElementById("pointsValue").textContent = points;
    document.getElementById("timerValue").textContent = Math.floor(timer) + " seconds";
}

window.onload = function(e) {
    initGame()
}

