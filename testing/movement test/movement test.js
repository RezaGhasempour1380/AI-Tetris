// Define the canvas and context for drawing
const canvas = document.getElementById("tetrisCanvas");
const context = canvas.getContext("2d");

document.getElementById('button1').addEventListener('click', function() {
    // Change the current piece to Piece 1
    current_shape_index = 0;
    current_rotation_index = 0;
    console.log("Piece 1");
});

document.getElementById('button2').addEventListener('click', function() {
    // Change the current piece to Piece 2
    current_shape_index = 1;
    current_rotation_index = 0;
    console.log("Piece 2");
});

document.getElementById('button3').addEventListener('click', function() {
    // Change the current piece to Piece 3
    current_shape_index = 2;
    current_rotation_index = 0;
    console.log("Piece 3");
});

document.getElementById('button4').addEventListener('click', function() {
    // Change the current piece to Piece 4
    current_shape_index = 3;
    current_rotation_index = 0;
    console.log("Piece 4");
});

document.getElementById('button5').addEventListener('click', function() {
    // Change the current piece to Piece 5
    current_shape_index = 4;
    current_rotation_index = 0;
    console.log("Piece 5");
});

document.getElementById('button6').addEventListener('click', function() {
    // Change the current piece to Piece 6
    current_shape_index = 5;
    current_rotation_index = 0;
    console.log("Piece 6");
});

document.getElementById('button7').addEventListener('click', function() {
    // Change the current piece to Piece 7
    current_shape_index = 6;
    current_rotation_index = 0;
    console.log("Piece 7");
});

document.getElementById('button8').addEventListener('click', function() {
    // reset
    resetGame()
    console.log("reset");
});

const square_size=20; // Define the size of each square in pixels
// Define the size of the game board
const ROWS = 13;
const COLUMNS = 9;

const WIDTH = COLUMNS * square_size; // Width of the game board
const HEIGHT = ROWS * square_size; // Height of the game board

const CELL_SIZE = 30; // Define the size of each cell in pixels

const gameBoard = []; // Initialize the game board array

// Fill the game board array with empty cells
for (let row = 0; row < ROWS; row++) {
    const newRow = Array(COLUMNS).fill(0);
    gameBoard.push(newRow);
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
let isMoveRightKeyPressed = false;
let isMoveLeftKeyPressed = false;
let isMoveDownFastKeyPressed = false;
const moveDelay = 300; // Set the delay in milliseconds
let interval;
let points = 0;
let timer = 0;
let lines_completed = 0;
let refreshrate = 350 ;

function handle_input(event){
    
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

function initGame(){
    canvas_element = document.getElementById("tetrisCanvas");
    window.addEventListener("keydown", handle_input)
    window.addEventListener("keyup", handle_keyup);


    // Choose a random Tetrimino type for the initial piece
    current_shape_index = Math.floor(Math.random() * tetriminos.length);

    // Choose a random rotation index for the initial piece
    current_rotation_index = Math.floor(Math.random() * tetriminos[current_shape_index].length);


    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 1;

    interval = setInterval(main_loop, refreshrate);

    ctx = canvas_element.getContext("2d");
    ctx.canvas.width=WIDTH; 
    ctx.canvas.height=HEIGHT;
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

function spawnNewTetrimino() {
    // Save the current Tetrimino on the game board
    saveTetriminoOnBoard();
    
    current_shape_index = next_shape_index;
    current_rotation_index = next_rotation_index;

    // Set the initial position at the top of the board
    tetriminoX = Math.floor((COLUMNS - tetriminos[current_shape_index][current_rotation_index][0].length) / 2);
    tetriminoY = 0;

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
    tetriminoY = 1;

    // Choose a random Tetrimino type for the initial piece
    current_shape_index = Math.floor(Math.random() * tetriminos.length);

    // Choose a random rotation index for the initial piece
    current_rotation_index = Math.floor(Math.random() * tetriminos[current_shape_index].length);

    // Reset game variables
    lastMoveTimestamp = 0;
    timer = 0;
    points = 0;
    // Clear the interval and restart the game loop
    clearInterval(interval);
    interval = setInterval(main_loop, refreshrate);

}

function main_loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Clear the tetrisCanvas and render its background
    const tetrisCanvas = document.getElementById("tetrisCanvas");

    const currentShape = tetriminos[current_shape_index][current_rotation_index];

    render_background(tetrisCanvas);
    render_shape(tetrisCanvas, currentShape, tetriminoX, tetriminoY, tetriminoColors);
    renderBoard();

}

window.onload = function(e) {
    initGame()
}