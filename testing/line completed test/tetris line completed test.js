// Define the canvas and context for drawing
const canvas = document.getElementById("tetrisCanvas");
const context = canvas.getContext("2d");



const square_size=20; // Define the size of each square in pixels
// Define the size of the game board
const ROWS = 13;
const COLUMNS = 10;

const WIDTH = COLUMNS * square_size; // Width of the game board
const HEIGHT = ROWS * square_size; // Height of the game board

const CELL_SIZE = 30; // Define the size of each cell in pixels

const gameBoard = []; // Initialize the game board array


// Fill the game board array with empty cells
for (let row = 0; row < ROWS-1; row++) {
    const newRow = Array(COLUMNS).fill(0);
    gameBoard.push(newRow);
}
const bottomRow = Array(COLUMNS).fill(1);
bottomRow[4] = 0; // Set one cell to be non-empty
gameBoard.push(bottomRow);

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
let lastMoveTimestamp = 0;
const moveDelay = 300; // Set the delay in milliseconds
let interval;
let points = 0;
let timer = 0;
let lines_completed = 0;
let refreshrate = 350 ;

function handle_input(event){ 
    if (event.key == 'r' || event.key == 'R'){
        resetGame()
    }
}

function initGame(){
    canvas_element = document.getElementById("tetrisCanvas");
    window.addEventListener("keydown", handle_input)


    // Choose a random Tetrimino type for the initial piece
    current_shape_index = 6

    // Choose a random rotation index for the initial piece
    current_rotation_index = 0


    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 1;

    interval = setInterval(main_loop, refreshrate);

    ctx = canvas_element.getContext("2d");
    ctx.canvas.width=WIDTH; 
    ctx.canvas.height=HEIGHT;
}

function move_down() {
    let newTetriminoY = tetriminoY + 1;

    // Check if the move is valid (no collision and within bounds)
    if (!isCollisionWithMove(tetriminoX, newTetriminoY, current_shape_index, current_rotation_index)) {
        tetriminoY = newTetriminoY;
    } else {
        spawnNewTetrimino();
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
}

function spawnNewTetrimino() {
    // Save the current Tetrimino on the game board
    saveTetriminoOnBoard();
    
    current_shape_index = next_shape_index;
    current_rotation_index = next_rotation_index;

    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 0;

    clearCompletedLines();
    
    stop();
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
    for (let row = 0; row < ROWS-1; row++) {
        gameBoard[row].fill(0); // Clear each row by filling with 0
        cellColors[row].fill(null); // Reset cell colors to null
    }
}

function resetGame() {
    // Clear the game board and reset any other necessary variables
    clearboard();

    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 1;

    // Choose a random Tetrimino type for the initial piece
    current_shape_index = 6

    // Choose a random rotation index for the initial piece
    current_rotation_index = 0

    // Reset game variables
    lastMoveTimestamp = 0;
    timer = 0;
    points = 0;
    // Clear the interval and restart the game loop
    clearInterval(interval);
    interval = setInterval(main_loop, refreshrate);

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

function main_loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Clear the tetrisCanvas and render its background
    const tetrisCanvas = document.getElementById("tetrisCanvas");

    move_down();

    const currentShape = tetriminos[current_shape_index][current_rotation_index];

    render_background(tetrisCanvas);
    render_shape(tetrisCanvas, currentShape, tetriminoX, tetriminoY, tetriminoColors);
    renderBoard();

}

window.onload = function(e) {
    initGame()
}