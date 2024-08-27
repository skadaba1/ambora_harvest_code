import pandas as pd
import os
import torch
import torch.optim as optim
import torch.nn as nn
import numpy as np
import re
import math
from datetime import datetime, timedelta
import numpy as np
from scipy.interpolate import interp1d
import torch
import torch.nn as nn
from torchdiffeq import odeint

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class GrowthRateNN(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(GrowthRateNN, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, output_dim)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
        self.tanh = nn.Tanh()

    def forward(self, x):
        x = self.sigmoid(self.fc1(x))
        x = self.tanh(self.fc2(x))
        x = self.relu(self.fc3(x))
        return x


def ode_system(t, y, y0, growth_rate_nn, immunophenotypes):
    # y = y[-1, :].unsqueeze(0)
    state = torch.cat((t.view(1,-1), y, y0, immunophenotypes.view(1,-1)), axis=1)
    growth_rates = growth_rate_nn(state).T  # Get growth rates from NN
    r1, r2 = growth_rates[0], growth_rates[1]  # r1 for growth rate, r2 for death rate
    y = y.T
    dydt = torch.zeros_like(y)

    dydt[0] = r1 #dNvt
    dydt[1] = r2 #dVt
    
    return dydt.T

def ode_solution(y0, t, growth_rate_nn, immunophenotypes):
    # Adjusting tolerances
    return odeint(lambda t, y: ode_system(t, y, y0, growth_rate_nn, immunophenotypes), y0, t, method='rk4')

def is_strictly_increasing(tensor):
    return tensor.shape[0] > 1 and torch.all(tensor[1:] > tensor[:-1])

def load_model(model_path, input_dim, hidden_dim, output_dim):
    # Load the state dictionary
    growth_rate_nn = GrowthRateNN(input_dim, hidden_dim, output_dim).to(device)
    growth_rate_nn.load_state_dict(torch.load('model_path'))

def inference_for_lot(lot_number):
    pass


