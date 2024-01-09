import torch
import torch.nn as nn
import torch.nn.functional as F
from loadconfig import rows,columns

class Net(nn.Module):
    def __init__(self, device=None):
        """
        Initializes a neural network model for the Tetris AI.

        Args:
            device (torch.device, optional): The device to run the model on. Defaults to None.
        """
        super().__init__()
        # Board dimensions + piece position + shape & rotation
        input_dimensions = (rows * columns) + 2 + 2
        # 0 - move left
        # 1 - move right
        # 2 - rotate
        # 3 - Stay in place
        output_dimensions = 4

        self.l0 = nn.Linear(input_dimensions, 512, bias=True, device=device)  # First linear layer with input dimensions and 512 output dimensions
        self.l1 = nn.Linear(512, 256, bias=False, device=device)  # Second linear layer with 512 input dimensions and 256 output dimensions
        self.l2 = nn.Linear(256, 44, bias=False, device=device)  # Third linear layer with 256 input dimensions and 44 output dimensions
        self.l3 = nn.Linear(44, output_dimensions, bias=True, device=device)  # Fourth linear layer with 44 input dimensions and 4 output dimensions

        layers = [self.l0, self.l1, self.l2, self.l1]
        for layer in layers:
            layer.requires_grad_(False)  # Disables gradient calculation for the layer
            if layer.bias is not None:
                torch.nn.init.zeros_(layer.bias)  # Initializes the bias of the layer with zeros
            torch.nn.init.uniform_(layer.weight, a=-0.5, b=0.5)  # Initializes the weights of the layer with uniform random values between -0.5 and 0.5

    def mutate(self, mutation_rate):
        """
        Applies mutation to the weights of the neural network.

        Args:
            mutation_rate (float): The rate at which mutation is applied to the weights.
        """
        for layer in [self.l0, self.l1, self.l2, self.l3]:
            # Generate random noise with the same shape as the layer's parameters
            noise = torch.randn_like(layer.weight) * mutation_rate
            # Add the noise to the layer's parameters
            layer.weight += noise

    def forward(self, x):
        x = torch.sigmoid(self.l0(x))  # Applies sigmoid activation to the output of the first linear layer
        x = torch.sigmoid(self.l1(x))  # Applies sigmoid activation to the output of the second linear layer
        x = torch.sigmoid(self.l2(x))  # Applies sigmoid activation to the output of the third linear layer
        x = F.softmax(self.l3(x), dim=1)  # Applies softmax activation to the output of the fourth linear layer along the second dimension
        return x

if __name__ == "__main__":
    model = Net()  # Creates an instance of the Net class
