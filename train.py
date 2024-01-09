# Import necessary modules
from tetris_ai import Net
from tetris import Tetris
import numpy as np

import torch
import torch.nn as nn
import torch.multiprocessing as mp

import random
# Import configuration parameters
from loadconfig import (
    rows,columns, seed, mutation_rate, mutation_strength,
    population_size, number_of_generation, games_per_agent,
    max_ticks, top_percent, idiot_percent_chosen,
    mutation_rates
)

# Set population size, top percent and max ticks from configuration
POP_SIZE = population_size
TOP_PERCENT = top_percent
MAX_TICKS = max_ticks

# Define the mutation function
def mutate_v2(agent, mute_rate ,mute_strength):

    # Create a new agent and load the state of the existing agent
    new_agent = Net()
    new_agent.load_state_dict(agent.state_dict())

    # Get the parameters of the agent
    params = list(new_agent.parameters())

    # Choose a random parameter to mutate
    param = random.choice(params)
    # Create a tensor of zeros with the same shape as the chosen parameter
    noise = torch.zeros_like(param)

    # Determine the number of parameters to mutate
    num_mutated = int(mute_rate * noise.numel())
    # Get a 1D view of the noise tensor
    mut_view = noise.view(-1)
    # Fill the first `num_mutated` elements with random values between -1 and 1, scaled by `mute_strength`
    mut_view[0:num_mutated] = torch.empty_like(mut_view[0:num_mutated]).uniform_(-1.0, 1.0) * mute_strength

    # Shuffle the elements of the noise tensor
    rand_indeces = torch.randperm(mut_view.numel())
    mut_view[rand_indeces] = mut_view.clone()[:]

    # Add the noise to the chosen parameter
    param.data += noise
    # Return the new agent
    return new_agent

# Function to normalize a value within a given range
def normalize(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value)

# Function to determine the action with the highest probability
def to_action(y):
    action = np.argmax(y)
    return action

# Class to represent a population of agents
class Population:
    def __init__(self, n: int):
        # Initialize a list of n agents
        self.agents: list[Net] = [Net() for i in range(n)]

# Class to represent the evolutionary simulation
class EvoSim:
    def __init__(self):
        # Initialize a population of agents, scores, generation number, score history, and mutation parameters
        self.pop = Population(POP_SIZE)
        self.scores = np.zeros((POP_SIZE,), dtype=np.float32)
        self.gen_num = 0
        self.score_history = []

        self.mutation_rate = mutation_rate
        self.mutation_strength = mutation_strength

    # Method to adjust mutation parameters based on recent performance
    def adjust_mutation_parameters(self):
        # Check if score history has enough data (at least 10 generations)
        if len(self.score_history) < 10:
            return  # Not enough data for adjustment yet

        # Get the last 10 scores
        recent_scores = self.score_history[-10:]  
        # Calculate the mean of the first 6 and last 5 scores
        a = np.mean(recent_scores[0 : 6])
        b = np.mean(recent_scores[5 : 10])
        # Calculate the absolute difference between the two means
        diff = abs(b - a)
        # Determine if there has been significant improvement
        improvement = b > a if diff > 0.5 else False

        # Adjust mutation parameters based on performance
        if improvement:
            # If the AI is consistently improving, decrease mutation
            self.mutation_rate -= 0.01
            self.mutation_strength -= 0.007
        else:
            # If the AI is not consistently improving, increase mutation
            self.mutation_rate += 0.01
            self.mutation_strength += 0.007

        # Ensure mutation parameters are within reasonable bounds
        self.mutation_rate = min(0.7, max(0.01, self.mutation_rate))
        self.mutation_strength = min(0.7, max(0.01, self.mutation_strength))

        return self.mutation_rate, self.mutation_strength

    # Method to run a generation of the simulation
    def gen_run(self) -> None:
        # Loop over each agent in the population
        for agent_index, agent in enumerate(self.pop.agents):
            # Initialize a list to store the scores for each game played by the agent
            agent_scores = [0] * games_per_agent
            # Run a number of games for each agent
            for i in range(games_per_agent):
                # Initialize a new game of Tetris
                game = Tetris(rows, columns)
                # Initialize a counter for the number of ticks (game steps)
                tick_num = 0
                # Run the game for a maximum number of ticks
                for _ in range(MAX_TICKS):
                    # Get the current game state and normalize it
                    x = game.to_numpy() 
                    # Pass the game state through the agent's neural network to get the action probabilities
                    y = agent(torch.from_numpy(x)).detach().numpy()
                    # Choose the action with the highest probability
                    action = to_action(y)
                    # Increment the tick counter
                    tick_num += 1
                    # Perform the chosen action and check if the game is over
                    # If the game is over (the tick function returns False), break out of the loop
                    if not game.tick(action):
                        break

                # After the game is over, calculate the agent's score and store it
                agent_scores[i] = game.calculate_score()

            # Calculate the mean score for this agent and store it    
            self.scores[agent_index] = sum(agent_scores) / games_per_agent

        # After all agents have played, calculate the mean score for this generation and store it
        self.score_history.append(np.mean(self.scores))
        # Adjust the mutation parameters based on the recent performance
        self.adjust_mutation_parameters()
        # Increment the generation counter
        self.gen_num += 1

    # Method to select agents for the next generation
    def select_agents(self) -> list[Net]:
        # Determine the number of top agents to select
        n_top = int(POP_SIZE * TOP_PERCENT)

        # Sort the agents by their scores in descending order
        sorted_agents = sorted(zip(self.scores, self.pop.agents), key=lambda el: el[0], reverse=True)

        # Select the top agents
        top_agents = sorted_agents[:n_top]

        # Store the remaining agents
        remaining_agents = sorted_agents[n_top:]

        # Select a random sample of the remaining agents
        n_random_low = int(len(remaining_agents) * idiot_percent_chosen)
        random_low_agents = random.sample(remaining_agents, n_random_low)

        # Combine the top agents and the random sample, and sort them by score
        selected_agents = sorted(top_agents + random_low_agents, key=lambda el: el[0], reverse=True)

        # Return the selected agents
        return selected_agents

    # Method to get the best agent (the one with the highest score)
    def get_best(self) -> tuple[float, Net]:
        return self.select_agents()[0]

    # Method to create a new generation of agents
    def create_new_gen(self):
        # Select the agents for the new generation
        selected = self.select_agents()
        num = len(selected)

        # Determine the number of children each selected agent should produce
        num_children = POP_SIZE // num
        new_gen: list[Net] = []

        # Loop over the selected agents
        for score, agent in selected:
            # For each selected agent, create a number of children by mutation
            for i in range(num_children):
                child = mutate_v2(agent, self.mutation_rate , self.mutation_strength)
                new_gen.append(child)

        # Return the new generation of agents
        return new_gen

# Check if the script is being run directly
if __name__ == "__main__":
    # Set the random seed for reproducibility
    random.seed(seed)
    np.random.seed(seed)
    torch.random.manual_seed(seed)

    # Initialize the evolutionary simulation
    sim = EvoSim()

    # Get the best agent and its score from the initial population
    score, best = sim.get_best()

    # Set the number of generations to run the simulation
    num_gens = number_of_generation

    # Run the simulation for the specified number of generations
    for i in range(num_gens):
        # Run a generation of the simulation
        sim.gen_run()

        # Get the best agent and its score from the current generation
        score, best = sim.get_best()

        # Print the generation number and the best score
        print(f"generatation {sim.gen_num} best score is {score}")

        # Every 50 generations, save the state of the best agent
        if (i+1) % 50 == 0:
            print("Saving best model...")
            torch.save(best.state_dict(), f'./MODEL')

        # Create a new generation of agents
        sim.pop.agents = sim.create_new_gen()

        # Reset the scores for the new generation
        sim.scores[:] = np.zeros((POP_SIZE,), dtype=np.float32)

    # After all generations have been run, save the state of the best agent
    torch.save(best.state_dict(), f'./MODEL')
