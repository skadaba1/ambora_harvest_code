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
from .models import Batch, Measurement, InactiveColumns

PHENOTYPES = ['CD3%', 'CD8%', 'CD4%', 'CM %','Naive %', 'Effector %', 'EM %', 'CD14%', 'CD19%', 'CD20%', 'CD56%']
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
    
class LazyLoader:
    def __init__(self, model_path, input_dim, hidden_dim, output_dim):
        self.model_path = model_path
        self.models = dict()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim

    def setup(self, cls):
        if(cls == 'node'):
            model = GrowthRateNN(self.input_dim, self.hidden_dim, self.output_dim)
            model.load_state_dict(torch.load(self.model_path, map_location=device))
            model.eval()
            return model
    
    def get(self, cls):
        if(cls in self.models):
            return self.models[cls]
        else:
            self.models[cls] = self.setup(cls)

loader = LazyLoader('/Users/samkadaba/Desktop/immpact_dev/ambora_harvest_code/backend/nODE_0.4.pth', 16, 1024, 2)

def ode_system(t, y, y0, growth_rate_nn, immunophenotypes):
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

def interpret_datetime(timedelta_obj):
    if isinstance(timedelta_obj, np.timedelta64):
        # Handle numpy.timedelta64
        total_hours = timedelta_obj.astype('timedelta64[h]').astype(float)
    elif isinstance(timedelta_obj, pd.Timedelta):
        # Handle pandas._libs.tslibs.timedeltas.Timedelta
        total_hours = timedelta_obj.total_seconds() / 3600.0
    else:
        raise TypeError("Unsupported type. The object must be of type 'numpy.timedelta64' or 'pandas._libs.tslibs.timedeltas.Timedelta'.")
    
    return total_hours

def get_phenotypes_for_lot(lot_df):
    lot_df = lot_df[lot_df['Unit Ops'] == 'CliniMACS']
    phenotypes = lot_df.iloc[0][PHENOTYPES]
    return np.nan_to_num(np.array(phenotypes, dtype=float), nan=0.0)

def get_y0_and_t0_for_lot(lot_df):
    transduction_and_seeding = lot_df[lot_df['Unit Ops'] == 'Transduction & Seeding'].iloc[0]
    t0 = transduction_and_seeding['Process Time from Day 1 (hours)']
    y0 = np.expand_dims(np.array(transduction_and_seeding[['TVC (cells)', 'Avg Viability (%)']].values, dtype=np.float64), axis=0)
    y0 = np.log(y0)
    return y0, t0

def inference_for_lot(lot_number='31424010'):
    measurements = Measurement.objects.filter(lot_number=lot_number)
    lot_df = []
    for measurement in measurements:
        lot_df.append(measurement.data)

    lot_df = pd.DataFrame(lot_df)
    lot_df_dropped = lot_df.dropna(subset=['TVC (cells)', 'Avg Viability (%)', 'Process Time from Day 1 (hours)'])
    
    y0, t0 = get_y0_and_t0_for_lot(lot_df_dropped)
    phenotypes = get_phenotypes_for_lot(lot_df)
    t = np.arange(t0 + 4*24, 14*24, 24)
    y0 = torch.Tensor(y0, device=device)
    phenotypes = torch.Tensor(phenotypes, device=device)
    t = torch.Tensor(t, device=device) 
    predicted_data = ode_solution(y0, t, loader.get('node'), phenotypes)
    ypred = np.exp(predicted_data.cpu().detach().numpy().reshape(-1, 2)[:, 0]) # this is TVC only
    tplot = t.cpu().numpy()

    out = []
    for indx, t in enumerate(tplot):
        out.append({'Process Time from Day 1 (hours)': t, 'TVC (cells)': ypred[indx], 'Avg Viability (%)': ypred[indx]})

    return out




