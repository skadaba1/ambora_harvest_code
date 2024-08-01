from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
import numpy as np
import json
from collections import defaultdict
from skmultiflow.trees import HoeffdingTreeRegressor
from .models import Batch, Measurement
from .serializers import BatchSerializer, MeasurementSerializer
from datetime import datetime, timedelta

date_format = "%Y-%m-%dT%H:%M"  # For 'datetime-local' input type

def convert_datetime_string(date_string):
    actual_format = '%Y-%m-%d %H:%M:%S%z'
    try:
        dt = datetime.strptime(date_string, actual_format)
    except ValueError as e:
        print(f"Error parsing date string: {e}")
        return None
    desired_format = '%Y-%m-%dT%H:%M'
    formatted_string = dt.strftime(desired_format)
    return formatted_string

class HoeffdingStateEstimator():
    def __init__(self, input_dim, state_properties=['total_viable_cells', 'viable_cell_density', 'cell_diameter']):
        self.tree_models_dict = dict()
        for i in range(input_dim):
            self.tree_models_dict[state_properties[i]] = HoeffdingTreeRegressor()
        columns = ['lot_number', 'measurement_date'] + state_properties
        self.obs_df = pd.DataFrame(columns=columns)
        self.state_properties = state_properties

        self.log_observations()

    def log_observations(self):
        all_measurements = Measurement.objects.all()
        for measurement in all_measurements:
            self.make_observation_and_update({
                'lot_number': measurement.batch.lot_number,
                'measurement_date': convert_datetime_string(str(measurement.measurement_date)),
                'total_viable_cells': measurement.total_viable_cells,
                'viable_cell_density': measurement.viable_cell_density,
                'cell_diameter': measurement.cell_diameter
            })
        pass
            
    def make_observation(self, obs):
        # Convert dictionary to DataFrame and concatenate
        for property_name in self.state_properties:
            obs[property_name] = float(obs[property_name])
        obs_df = pd.DataFrame([obs])
        self.obs_df = pd.concat([self.obs_df, obs_df], ignore_index=True)
    
    def get_num_observations(self):
        return len(self.obs_df)
    
    def make_observation_and_update(self, obs):
        self.make_observation(obs)
        self.update_models()
    
    # online learning
    def update_models(self):  
        num_observations = self.get_num_observations()
        if(num_observations > 1):
            # Train the model
    
            current_features = self.obs_df.iloc[num_observations-2][['measurement_date'] + self.state_properties].values
            forward_time = (datetime.strptime(self.obs_df.iloc[num_observations-1]['measurement_date'], date_format) - datetime.strptime(current_features[0], date_format)).total_seconds() / 3600
            current_features[0] = forward_time
            for property_name in self.state_properties:
                next_property_value = self.obs_df.iloc[num_observations-1][property_name]
                self.tree_models_dict[property_name].partial_fit([current_features], [next_property_value])
    
    # Function to forecast the next state
    def forecast_next_state(self, current_features, forward_time):
        current_features = list(current_features.values())
        current_features = [forward_time] + current_features
        out = dict()
        for model_name in self.tree_models_dict.keys():
            value = (self.tree_models_dict[model_name].predict([current_features])[0])
            out[model_name] = value
        return out
    
    def sim_growth(self, current_state, forward_time_inc, days_forward, starting_date): # forward_time_inc in hours
        increments = int(days_forward * 24 / forward_time_inc)
        states_dict = defaultdict(list)
        for i in range(increments):
            current_date = starting_date + timedelta(days=i*forward_time_inc/24)
            next_state = self.forecast_next_state(current_state, forward_time_inc)
            states_dict[current_date] = next_state
            current_state = next_state
        return states_dict

    def eval_on_observations(self):
        # assume obs is list of dicts of prediction vs
        predictions = defaultdict(list)
        actual = defaultdict(list)
        timestamps = []
        for i in range(len(self.obs_df) - 1):
            measurement_date = self.obs_df.iloc[i]['measurement_date']
            current_features = self.obs_df.iloc[i][self.state_properties]
            forward_time = (datetime.strptime(self.obs_df.iloc[i+1]['measurement_date'], date_format) - datetime.strptime(measurement_date, date_format)).total_seconds() / 3600
            
            next_property_values = self.obs_df.iloc[i+1]

            # Forecast the next state
            if i > 0:
                current_features = current_features.to_dict()
                predicted_values = self.forecast_next_state(current_features, forward_time)
                for index, property_name in enumerate(self.state_properties):
                    predictions[property_name].append(predicted_values[property_name])
                    actual[property_name].append(next_property_values[property_name])
                    timestamps.append(self.obs_df.iloc[i + 1]['measurement_date'])
        return predictions, actual, timestamps

    def get_confidence_intervals(self):
        margins = dict()
        predictions, actual, timestamps = self.eval_on_observations()
        for property_name in self.state_properties:
            confidence_level = 0.95
            std_dev_tvc = np.std(np.array(predictions[property_name]) - np.array(actual[property_name]))
            margin_of_error = std_dev_tvc * 1.96  # 95% confidence interval
            margins[property_name] = margin_of_error
        return margins
    
    def delete(self, lot_number):
        # Filter the DataFrame
        self.obs_df = self.obs_df[self.obs_df['lot_number'] != lot_number]

        # Optionally reset the index if needed
        self.obs_df.reset_index(drop=True, inplace=True)
    
state_estimator = HoeffdingStateEstimator(input_dim=3)

def sim_growth_for_batch(batch):
    measurements = Measurement.objects.filter(batch=batch)
    last_measurements = measurements.last()
    current_state = {
        'total_viable_cells': float(last_measurements.total_viable_cells), 
        'viable_cell_density': float(last_measurements.viable_cell_density), 
        'cell_diameter': float(last_measurements.cell_diameter)
        } 
    days_forward = 16 - (last_measurements.measurement_date - batch.batch_start_date).days
    forward_time_inc = 24 # predict 24 hours advance at a time
    states_dict = state_estimator.sim_growth(current_state, forward_time_inc, days_forward, last_measurements.measurement_date)
    margins = state_estimator.get_confidence_intervals()
    return states_dict, margins

@api_view(['GET'])
def Batches(request):
    batches = Batch.objects.all()
    serializer = BatchSerializer(batches, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def add_batch(request):
    data_str = request.body.decode('utf-8')
    data_dict = json.loads(data_str)
    batch = Batch.objects.create(
        lot_number=data_dict['lotNumber'],
        batch_start_date=data_dict['batchStartDate'],
        total_viable_cells=data_dict['totalViableCells'],
        viable_cell_density=data_dict['viableCellDensity'],
        cell_diameter=data_dict['cellDiameter'],
    )
    return Response('Success')

@api_view(['POST'])
def delete_batch(request):
    data_str = request.body.decode('utf-8')
    data_dict = json.loads(data_str)
    batch = Batch.objects.get(id=data_dict['lotId'])
    batch.delete()
    state_estimator.delete(data_dict['lotId'])
    return Response('Success')

@api_view(['POST'])
def add_measurement(request):
    data_str = request.body.decode('utf-8')
    data_dict = json.loads(data_str)
    batch = Batch.objects.get(id=data_dict['lotId'])
    measurement = Measurement.objects.create(
        batch=batch,
        measurement_date=data_dict['measurementDate'],
        total_viable_cells=data_dict['totalViableCells'],
        viable_cell_density=data_dict['viableCellDensity'],
        cell_diameter=data_dict['cellDiameter'],
    )
    measurement.save()
    state_estimator.make_observation_and_update({
        'lot_number': batch.lot_number, 
        'measurement_date':data_dict['measurementDate'],
        'total_viable_cells':data_dict['totalViableCells'],
        'viable_cell_density':data_dict['viableCellDensity'],
        'cell_diameter':data_dict['cellDiameter']})
    number_measurements_for_lot = Measurement.objects.filter(batch=batch).count()
    if(number_measurements_for_lot > 2):
        out, margins = sim_growth_for_batch(batch)
        print(out)
        print(margins)
    return Response('Success')

@api_view(['POST'])
def get_measurements(request):
    measurements = Measurement.objects.all()
    serializer = MeasurementSerializer(measurements, many=True)
    return Response(serializer.data)

