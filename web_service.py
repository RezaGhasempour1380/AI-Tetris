# Import necessary modules
from flask import Flask, request
from flask_cors import CORS  # Import the CORS class to handle Cross-Origin Resource Sharing

import torch  # Import PyTorch for machine learning
import numpy as np  # Import NumPy for numerical operations

from tetris import Tetris, action_to_str  # Import the Tetris game and a function to convert actions to strings
from tetris_ai import Net  # Import the AI model for the Tetris game

# Create a Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def to_action(y):
    # Determine the action with the highest probability
    action = np.argmax(y)
    return action

def run_model(x):
    # Initialize the AI model
    model =  Net()
    # Load the trained weights into the model
    model.load_state_dict(torch.load('./MODEL'))

    # Run the model on the input data and get the action
    action = to_action(model(torch.from_numpy(x)).detach().numpy())
    # Convert the action to a string and return it
    return action_to_str(action)

@app.route('/tetris_ai', methods=['POST'])
def tetris_ai():
    # Get the JSON data from the request
    data = request.get_json()
    # Create a Tetris game from the JSON data
    game = Tetris.from_json(data)
    # Run the model on the game state and return the action
    return str(run_model(game.to_numpy())), 200

if __name__ == "__main__":
    # Run the Flask application
    app.run(debug=True)