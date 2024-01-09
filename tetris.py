import numpy as np
import random


MOVE_LEFT = 0
MOVE_RIGHT = 1
ROTATE = 2
NOTHING = 3

MAX_ACTIONS = 10

TETRIMINOS = [
    np.array([
        # L Tetrimino
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
    ], dtype=np.byte),
    np.array([
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
    ], dtype=np.byte),
    np.array([
        # T Tetrimino
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
    ], dtype=np.byte),
    np.array([
        # Square Tetrimio
        [
            [1, 1],
            [1, 1]
        ],
    ], dtype=np.byte),
    np.array([
        #Ugly L Tetrimio
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
    ], dtype=np.byte),
    np.array([
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
    ], dtype=np.byte),
    np.array([
        #Line Tetrimios
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
    ], dtype=np.byte)
]

# Function to normalize a value between a minimum and maximum value
def normalize(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value)

# Function to calculate the originality of a list of actions
def originality(actions):
    return len(list(set(actions))) / len(actions)

# Function to convert an action to a string
def action_to_str(action):
    actions = ["LEFT", "RIGHT", "ROTATE", "NOTHING"]
    return actions[action]

# Class to represent a game of Tetris
class Tetris:
    # Constructor
    def __init__(self, rows: int, cols: int):
        self.rows = rows
        self.cols = cols
        self.grid = np.zeros((rows, cols), dtype=np.float32)

        # Calculate width of shape to help get the center
        self.piece_pos = ((cols // 2) - 2, 0)
        self.shape_index = random.randint(0, len(TETRIMINOS) - 1)
        self.piece_rotation = 0

        self.is_game_over = False
        self.lines_completed = 0
        self.tick_count = 0

        self.has_rotated = False
        self.moves_repeated = 0

        # List with 5 previous actions
        self.prev_action: int = NOTHING

    # Static method to create a Tetris game from JSON data
    @staticmethod
    def from_json(data):
        rows = len(data["board"])
        cols = len(data["board"][0])

        game = Tetris(rows, cols)
        game.grid = np.array(data["board"], dtype=np.float32)
        game.piece_pos = (data["x"], data["y"])
        game.shape_index = data["current_shape"]
        game.piece_rotation = data["current_rotation"]
        return game

    # Method to convert the game state to a numpy array
    def to_numpy(self):
        normalized_grid = self.grid.flatten()
        normalized_shape_index = np.array([normalize(self.shape_index, 0, len(TETRIMINOS))], dtype=np.float32)
        normalized_piece_rotation = np.array(
            [normalize(self.piece_rotation, 0, len(TETRIMINOS[self.shape_index]))],
            dtype=np.float32
        )
        normalized_piece_pos = np.array([
            normalize(self.piece_pos[0], 0, self.cols),
            normalize(self.piece_pos[1], 0, self.rows)
        ], dtype=np.float32)
        x = np.concatenate((normalized_grid, normalized_shape_index, normalized_piece_rotation, normalized_piece_pos))\
            .reshape((1, -1))\
            .astype('float32')

        return x
    
    # Method to count the number of holes in the grid
    def count_holes(self):
        holes = 0
        # Loop over each column in the grid
        for col in range(self.cols):
            hole_found = False
            # Loop over each row in the grid
            for row in range(self.rows):
                # If a filled block is found, start looking for holes
                if self.grid[row, col] == 1:
                    hole_found = True
                # If a hole is found after a filled block, increment the hole count
                elif hole_found and self.grid[row, col] == 0:
                    holes += 1
        # Return the total number of holes
        return holes

    # Method to calculate the difference in height between adjacent pillars
    def calculate_pillar_height_difference(self):
        # Initialize the heights of each column to 0
        heights = [0] * self.cols
        # Loop over each column in the grid
        for col in range(self.cols):
            # Loop over each row in the grid
            for row in range(self.rows):
                # If a filled block is found, set the height of the column
                if self.grid[row, col] == 1:
                    heights[col] = self.rows - row
                    break
        # Calculate the sum of the differences in height between adjacent pillars
        pillar_difference = sum(abs(heights[i] - heights[i + 1]) for i in range(self.cols - 1))
        # Return the total difference in height
        return pillar_difference

    # Method to calculate the tutorial points
    def tutorial_points(self):
        # Return twice the number of times the piece has been rotated
        return self.has_rotated * 2

    # Method to calculate the score
    def calculate_score(self) -> float:
        # Calculate the score based on the number of lines completed, the number of ticks, the tutorial points, the number of holes, and the difference in pillar height
        return int(
            self.lines_completed*100 + self.tick_count*0.33 + self.tutorial_points() - self.count_holes() - self.calculate_pillar_height_difference()
        )

    # Method to check for a collision with a move
    def collision_with_move(self, pos: tuple[int, int], rotation: int, shape : int):
        # Get the shape of the piece with the given rotation
        current_shape = TETRIMINOS[shape][rotation]

        # Loop over each block in the shape
        for row in range(len(current_shape)):
            for col in range(len(current_shape[row])):
                # If the block is filled
                if (current_shape[row][col] == 1):
                    # Calculate the position of the block on the board
                    boardX = pos[0] + col
                    boardY = pos[1] + row

                    # Check for collisions with the game board boundaries and other Tetriminos
                    if (boardX < 0 or boardX >= self.cols or boardY >= self.rows or
                        (boardY >= 0 and self.grid[boardY][boardX] == 1)):
                        # If a collision is detected, return True
                        return True

        # If no collision is detected, return False
        return False

    # Method to clear completed lines from the grid
    def clear_completed_lines(self):
        # Loop over each row in the grid
        for row in range(len(self.grid)):
            # If all blocks in the row are filled
            if np.all(self.grid[row] == 1):
                # Remove the completed line from the grid
                self.grid = np.delete(self.grid, row, axis=0)

                # Add a new empty line at the top of the grid
                empty_line = np.zeros((1, self.cols), dtype=int)
                self.grid = np.vstack((empty_line, self.grid))

                # Increment the count of completed lines
                self.lines_completed += 1

    # Method to handle a collision with a piece
    def on_piece_collision(self):
        # Save the current piece to the grid
        self.save_piece()
        # Clear any completed lines from the grid
        self.clear_completed_lines()
        # Spawn a new piece
        self.spawn_new()

    # Method to move the current piece down
    def move_down(self):
        # Calculate the new position of the piece
        new_pos = (self.piece_pos[0], self.piece_pos[1]+1)

        # If the piece would not collide at the new position
        if (not self.collision_with_move(new_pos, self.piece_rotation, self.shape_index)):
            # Move the piece to the new position
            self.piece_pos = new_pos
        else:
            # If the piece would collide, handle the collision
            self.on_piece_collision()

    # Method to handle a user input
    def handle_input(self, action: int):
        # Get the current shape of the piece
        shape = TETRIMINOS[self.shape_index]
        # Initialize the new rotation and position to the current values
        new_rotation = self.piece_rotation
        new_pos = self.piece_pos

        # If the action is to move left, decrement the x-coordinate of the position
        if (action == MOVE_LEFT):
            new_pos = (new_pos[0]-1, new_pos[1])
        # If the action is to move right, increment the x-coordinate of the position
        elif (action == MOVE_RIGHT):
            new_pos = (new_pos[0]+1, new_pos[1])
        # If the action is to rotate the piece, increment the rotation
        elif (action == ROTATE):
            new_rotation = (self.piece_rotation + 1) % len(shape)

        # If the piece would not collide at the new position and rotation
        if (not self.collision_with_move(new_pos, new_rotation, self.shape_index)):
            # Move and rotate the piece
            self.piece_pos = new_pos
            self.piece_rotation = new_rotation

    # Method to save the current piece to the grid
    def save_piece(self):
        # Get the current shape of the piece
        shape = TETRIMINOS[self.shape_index][self.piece_rotation]

        # Loop over each block in the shape
        for row in range(len(shape)):
            for col in range(len(shape[row])):
                # Calculate the position of the block in the grid
                x = col + self.piece_pos[0]
                y = row + self.piece_pos[1]

                # If the block is filled
                if shape[row][col] == 1:
                    # Save the block to the grid
                    self.grid[y][x] = 1

    # Method to spawn a new Tetrimino
    def spawn_new(self) -> None:
        # Randomly select a new shape
        new_shape = random.randint(0, len(TETRIMINOS) - 1)
        # Set the initial rotation to 0
        new_rotation = 0
        # Set the initial position to the top center of the grid
        new_pos = ((self.cols // 2) - 2, 0)

        # If the new Tetrimino would collide with existing blocks, end the game
        if (self.collision_with_move(new_pos, new_rotation, new_shape)):
            self.is_game_over = True
        else:
            # Otherwise, set the new Tetrimino as the current piece
            self.shape_index = new_shape
            self.piece_rotation = new_rotation
            self.piece_pos = new_pos

    # Method to advance the game by one tick
    def tick(self, x: int) -> bool:
        # If the game is not over
        if not self.is_game_over:
            # Handle the user's input
            self.handle_input(x)
            # Move the current piece down
            self.move_down()

            # Increment the tick count
            self.tick_count += 1

            # If the user's input was to rotate the piece, set the has_rotated flag
            if x == ROTATE:
                self.has_rotated = True

            # Return True to indicate that the game is still ongoing
            return True
        else:
            # If the game is over, return False
            return False

    # Method to convert the game state to a string
    def to_str(self) -> str:
        # Initialize an empty board
        board: list[list[str]] = [["-"] * self.cols for i in range(self.rows)]
        # Fill in the blocks on the board
        for row in range(self.rows):
            for col in range(self.cols):
                if (self.grid[row, col] == 1):
                    board[row][col] = "#"

        # Draw the current piece on the board
        shape = TETRIMINOS[self.shape_index][self.piece_rotation]
        for row in range(len(shape)):
            for col in range(len(shape[row])):
                x = self.piece_pos[0]
                y = self.piece_pos[1]

                if (shape[row][col] == 1):
                    if ((row+y) < self.rows):
                        board[row+y][col+x] = "1"

        # Convert the board to a string
        text = ""
        for row_list in board:
            text += "|" + "".join(row_list) + "|\n"

        # Return the string representation of the board
        return text

    # Method to define the string representation of the game
    def __repr__(self) -> str:
        # Use the to_str method to convert the game state to a string
        return self.to_str()

# Check if the script is being run directly
if __name__ == "__main__":
    # Initialize a new game of Tetris with 20 rows and 10 columns
    game = Tetris(20, 10)
    # Initialize the previous action to 4 (which might correspond to a specific action in your game)
    prev_x = 4

    # Start the game loop
    while True:
        # Get the user's input
        user_in = input("action: ")

        # If the user input is empty, use the previous action
        if user_in == "":
            x = prev_x
        # If the user input is "s", use the previous action and cycle to the next Tetrimino shape
        elif user_in == "s":
            x = prev_x
            game.shape_index = (game.shape_index + 1) % len(TETRIMINOS)
        # Otherwise, convert the user input to an integer and use it as the action
        else:
            x = int(user_in)

        # Advance the game by one tick with the chosen action
        game.tick(x)
        # Print the current state of the game
        print(game.to_str())
        # Store the chosen action as the previous action for the next loop iteration
        prev_x = x

