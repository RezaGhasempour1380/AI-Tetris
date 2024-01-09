# Import the json module to work with JSON data
import json

default_config = {
    "rows": 30,
    "columns": 15,
    "seed": 0,
    "population_size": 100,
    "mutation_strength": 0.1,
    "mutation_rate": 0.1,
    "number_of_generation": 100,
    "games_per_agent": 10,
    "top_percent": 0.2,
    "max_ticks": 1000,
    "idiot_percent_chosen": 0.1,
    "mutation_rates": {
        "0": 0.1,
        "10": 0.05,
        "20": 0.01,
        "30": 0.005,
        "40": 0.001,
        "50": 0.0005,
        "60": 0.0001,
        "70": 0.00005,
        "80": 0.00001,
        "90": 0.000005,
        "100": 0.000001
    }
}

try: #error handling
    # Open the configuration file
    with open('config.json') as config_file:
        # Load the JSON data from the configuration file
        data = json.load(config_file)

    # Extract the configuration values from the JSON data
    rows = data['rows']  # The number of rows
    columns = data['columns']  # The number of columns
    seed = data['seed']  # The seed for the random number generator
    population_size = data['population_size']  # The size of the population
    mutation_strength = data['mutation_strength']  # The strength of the mutations
    mutation_rate = data['mutation_rate']  # The rate of mutation
    number_of_generation = data['number_of_generation']  # The number of generations
    games_per_agent = data['games_per_agent']  # The number of games per agent
    top_percent = data['top_percent']  # The top percentage of agents to keep
    max_ticks = data['max_ticks']  # The maximum number of ticks
    idiot_percent_chosen = data['idiot_percent_chosen']  # The percentage of "idiot" agents chosen
    mutation_rates = [(int(gen_num), float(mut_rate)) for gen_num, mut_rate in data['mutation_rates'].items()]  # The mutation rates for each generation
except:
    print("WARNING: Error loading config file. Using default values.")

    rows = default_config['rows']
    columns = default_config['columns']
    seed = default_config['seed']
    population_size = default_config['population_size']
    mutation_strength = default_config['mutation_strength']
    mutation_rate = default_config['mutation_rate']
    number_of_generation = default_config['number_of_generation']
    games_per_agent = default_config['games_per_agent']
    top_percent = default_config['top_percent']
    max_ticks = default_config['max_ticks']
    idiot_percent_chosen = default_config['idiot_percent_chosen']
    mutation_rates = [(int(gen_num), float(mut_rate)) for gen_num, mut_rate in default_config['mutation_rates'].items()]
