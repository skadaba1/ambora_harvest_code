
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
import numpy as np
import json
from collections import defaultdict
from skmultiflow.trees import HoeffdingTreeRegressor
import os
import tempfile
from django.shortcuts import get_object_or_404
from .models import Batch, Measurement, InactiveColumns
from .serializers import BatchSerializer, MeasurementSerializer, InactiveColumnsSerializer
from datetime import datetime, timedelta
from django.utils import timezone
import re


date_format = "%Y-%m-%dT%H:%M"  # For 'datetime-local' input type

def convert_datetime_string(date_string):
    try:
        dt = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S%z')
    except ValueError as e:
        try:
            dt = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S')
        except ValueError as e:
            print(f"Error parsing date string: {date_string}, with error: {e}")
            return None
    desired_format = '%Y-%m-%dT%H:%M'
    formatted_string = dt.strftime(desired_format)
    return formatted_string

# Function to read Excel file and process data
def process_excel(file_path, sheet_name):
    df = pd.read_excel(file_path, sheet_name, header=1)
    # Columns to check for NaNs
    columns_to_check = ['Avg Viability (%)', 'Avg Cell Diameter (um)', 'TVC (cells)']

    # Remove rows where any of the specified columns have NaNs
    df_cleaned = df.dropna(subset=columns_to_check)
    df_cleaned = df_cleaned.dropna(axis=1, how='all')
    df_cleaned = df_cleaned[['Lot Number', 'Avg Viability (%)', 'Avg Cell Diameter (um)', 'TVC (cells)', 'Unit Op Start Time 1', 'Unit Op Finish Time 1', 'Process Day', 'Process Time from Day 1 (hours)']]
    return df_cleaned

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

def process_file(file_path):
    file_path = file_path
    excel_file = pd.ExcelFile(file_path)
    sheet_names = excel_file.sheet_names
    batch_start_date = None
    for sheet_name in sheet_names:
        if('_Process Data' in sheet_name and "Master" not in sheet_name):
            try:
                print("SHEET: " + sheet_name)
                df = process_excel(file_path, sheet_name)
                harvested = False
                batch_id = None
                for index, row in df.iterrows():
                    if pd.notna(row['Unit Op Start Time 1']):
                        if row['Process Day'] == 'Harvest': # Check if batch in the sheet has been harvested
                            harvested = True
                        if(not batch_start_date):
                            batch_start_date = convert_datetime_string(str(row['Unit Op Start Time 1']))
                        add_measurement_output = add_measurement_direct(
                            convert_datetime_string(str(row['Unit Op Start Time 1'])), 
                            row['Lot Number'], 
                            row['TVC (cells)'], 
                            row['Avg Viability (%)'], 
                            row['Avg Cell Diameter (um)'], 
                            batch_start_date, 
                            interpret_datetime(row['Process Time from Day 1 (hours)']))
                        batch_id = add_measurement_output['batch_id']
                batch = Batch.objects.get(id=batch_id)
                batch.status = 'Harvested' if harvested else 'Ongoing'
                # get batch tags
                match = re.search(r'\((.*?)\)', sheet_name)
                if match:
                    batch.data = {'tags': [match.group(1)]}
                batch.save()
            except Exception as e:
               print(f"Error processing sheet '{sheet_name}': {e}")
        batch_start_date = None

def add_measurement_direct(measurement_date, lot_number, total_viable_cells, viable_cell_density, cell_diameter, batch_start_date, process_time, unit_ops = None, phenotyping = None):
    print('loc14')
    print(process_time)
    batch, created = Batch.objects.get_or_create(lot_number=lot_number, defaults={'batch_start_date': batch_start_date})
    batch_data = {
        'cell_diameter': cell_diameter,
        'process_time': process_time,
        'total_viable_cells': total_viable_cells,
        'viable_cell_density': viable_cell_density
    }
    if unit_ops:
        batch_data["unit_ops"] = unit_ops
    if phenotyping:
        batch_data["phenotyping"] = phenotyping
    measurement = Measurement.objects.create(
        batch=batch,
        lot_number=lot_number,
        measurement_date=measurement_date,
        data=batch_data
    )
    measurement.save()
    #loader.get("hfe").make_observation_and_update({
        #'lot_number': batch.lot_number,
        #'measurement_date': measurement_date,
        #'total_viable_cells': total_viable_cells,
        #'viable_cell_density': viable_cell_density,
        #'cell_diameter': cell_diameter
    #})
    number_measurements_for_lot = Measurement.objects.filter(batch=batch).count()

    latest_measurement = Measurement.objects.filter(id=measurement.id, batch=batch).first()
    if(number_measurements_for_lot > 2):
        harvest_day = predict_harvest_day(batch, latest_measurement)
        batch.harvest_date = harvest_day
        batch.save()
    return {'number_measurements': number_measurements_for_lot, 'batch_id': batch.id}

# Define a function to parse datetime strings
def parse_datetime(dt_str):
    return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))

# Aggregate observations by day
def aggregate_observations(observations):
    daily_observations = defaultdict(list)
    
    for obs in observations:
        date = parse_datetime(obs['measurement_date']).date()
        daily_observations[date].append(obs)
    
    # For each day, compute average values of total viable cells, viable cell density, and cell diameter
    aggregated_observations = {}
    for date, obs_list in daily_observations.items():
        total_viable_cells = sum(obs['data']['total_viable_cells'] for obs in obs_list) / len(obs_list)
        viable_cell_density = sum(obs['data']['viable_cell_density'] for obs in obs_list) / len(obs_list)
        cell_diameter = sum(obs['data']['cell_diameter'] for obs in obs_list) / len(obs_list)
        aggregated_observations[date] = {
            'total_viable_cells': total_viable_cells,
            'viable_cell_density': viable_cell_density,
            'cell_diameter': cell_diameter
        }
    
    return aggregated_observations

# Combine observations and predictions into a unified list of dictionaries
# Combine observations and predictions into a unified list of dictionaries
def unify_data(observations, predictions):
    aggregated_observations = aggregate_observations(observations)
    
    unified_data = defaultdict(dict)
    
    # Add aggregated observations
    for date, obs in aggregated_observations.items():
        unified_data[date]['observed'] = obs
    
    # Add predictions
    for pred_date_str, pred in predictions.items():
        pred_date = parse_datetime(pred_date_str).date()
        unified_data[pred_date]['predicted'] = pred
    
    # Convert unified data to a list of dictionaries
    unified_list = []
    for date, values in unified_data.items():
        date_str = date.isoformat()
        unified_list.append({'date': date_str, 'values': values})
    
    return unified_list

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
                'total_viable_cells': measurement.data['total_viable_cells'],
                'viable_cell_density': measurement.data['viable_cell_density'],
                'cell_diameter': measurement.data['cell_diameter']
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
        for lot in self.obs_df['lot_number'].unique():
            lot_df = self.obs_df[self.obs_df['lot_number'] == lot]
            lot_df = lot_df.sort_values(by=['measurement_date'])
            num_observations = len(lot_df)
            if(num_observations > 1):
                # Train the model
        
                current_features = lot_df.iloc[num_observations-2][['measurement_date'] + self.state_properties].values
                forward_time = (datetime.strptime(lot_df.iloc[num_observations-1]['measurement_date'], date_format) - datetime.strptime(current_features[0], date_format)).total_seconds() / 3600
                current_features[0] = forward_time
                for property_name in self.state_properties:
                    next_property_value = lot_df.iloc[num_observations-1][property_name]

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
    
    def sim_growth(self, current_state, forward_times, starting_date): # forward_time_inc in hours
        states_dict = defaultdict(list)
        for forward_time in forward_times:
            current_date = str(starting_date + timedelta(days=int(forward_time/24)))
            next_state = self.forecast_next_state(current_state, forward_time)
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

def sim_growth_for_batch(batch, measurement):
    last_measurement = measurement

    current_state = {
        'total_viable_cells': float(last_measurement.data['total_viable_cells']), 
        'viable_cell_density': float(last_measurement.data['viable_cell_density']), 
        'cell_diameter': float(last_measurement.data['cell_diameter'])
        } 

    # Assuming last_measurements.measurement_date and batch.batch_start_date are datetime objects
    last_measurement_date = last_measurement.measurement_date
    batch_start_date = batch.batch_start_date

    # Calculate the starting day
    days_since_start = (last_measurement_date - batch_start_date).days + 1
    start_day = 16 - days_since_start

    # Generate the list of days to predict
    forward_time_inc = 24 # predict 24 hours advance at a time
    forward_times = [day * forward_time_inc for day in list(range(1, start_day))]

    states_dict = loader.get("hfe").sim_growth(current_state, forward_times, last_measurement.measurement_date)
    margins = loader.get("hfe").get_confidence_intervals()
    return states_dict, margins

class LazyLoader:
    def __init__(self):
        self.models = {}

    def get(self, name):
        if name not in self.models:
            if(name == 'hfe'):
                self.models[name] = HoeffdingStateEstimator(input_dim=3)
        return self.models[name]

loader = LazyLoader()

def predict_harvest_day(batch, measurement):
    states_dict, margins = sim_growth_for_batch(batch, measurement)
    for date in states_dict:
        if((parse_datetime(date) - batch.batch_start_date).days >= 8):
            if(states_dict[date]['total_viable_cells'] > 1e9):
                return date
    return None # Terminate batch


# get correlation between viable cell density and TVC and between cell diameter and TVC as the number of batches increases
def get_correlations_data():
    batches = Batch.objects.all().order_by("batch_start_date")
    
    current_batch = 1
    num_batches = []
    
    viable_cell_density = []
    cell_diameter = []
    total_viable_cells = []
    
    correlations_viable_cell_density = []
    correlations_cell_diameter = []
    for batch in batches:
        measurements = Measurement.objects.filter(batch = batch).order_by("measurement_date")

        viable_cell_density_measurement = measurements.filter(viable_cell_density__isnull = False).first()
        cell_diameter_measurement = measurements.filter(cell_diameter__isnull = False).first()
        total_viable_cells_measurement = measurements.filter(total_viable_cells__isnull = False).last()
	
        if viable_cell_density_measurement:
            viable_cell_density.append(viable_cell_density_measurement.viable_cell_density)
        else:
            viable_cell_density.append(None)
        if cell_diameter_measurement:
            cell_diameter.append(cell_diameter_measurement.cell_diameter)
        else:
            cell_diameter.append(None)
        if total_viable_cells_measurement:
            total_viable_cells.append(total_viable_cells_measurement.total_viable_cells)
        else:
            total_viable_cells.append(None)
	
        df = pd.DataFrame({"viable_cell_density" : pd.Series(viable_cell_density), "total_viable_cells" : pd.Series(total_viable_cells)}).dropna()
        correlations_viable_cell_density.append(np.corrcoef(df["viable_cell_density"].values, df["total_viable_cells"].values)[0, 1])

        df = pd.DataFrame({"cell_diameter" : pd.Series(cell_diameter), "total_viable_cells" : pd.Series(total_viable_cells)}).dropna()
        correlations_cell_diameter.append(np.corrcoef(df["cell_diameter"], df["total_viable_cells"])[0, 1])
	
        num_batches.append(current_batch)
        current_batch += 1
    return correlations_viable_cell_density, correlations_cell_diameter
	
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
        total_viable_cells=0,
        # viable_cell_density=data_dict['viableCellDensity'],
        # cell_diameter=data_dict['cellDiameter'],
    )
    return Response('Success')

@api_view(['POST'])
def delete_batch(request):
    data_str = request.body.decode('utf-8')
    data_dict = json.loads(data_str)
    batch = Batch.objects.get(id=data_dict['lotId'])
    batch.delete()
    loader.get("hfe").delete(data_dict['lotId'])
    return Response('Success')

@api_view(['POST'])
def add_measurement(request):
    data_str = request.body.decode('utf-8')
    data_dict = json.loads(data_str)
    batch = Batch.objects.get(id=data_dict['lotId'])
    measurement_date = timezone.make_aware(datetime.strptime(data_dict['measurementDate'], "%Y-%m-%dT%H:%M"))
    batch_data = {
        'cell_diameter': float(data_dict['cellDiameter']),
        'process_time': float(0),
        'total_viable_cells': float(data_dict['totalViableCells']),
        'viable_cell_density': float(data_dict['viableCellDensity']),
    }
    measurement = Measurement.objects.create(
        batch=batch,
        lot_number=batch.lot_number,
        measurement_date=measurement_date,
        data = batch_data
    )
    measurement.save()
    loader.get("hfe").make_observation_and_update({
        'lot_number': batch.lot_number, 
        'measurement_date':data_dict['measurementDate'],
        'total_viable_cells':data_dict['totalViableCells'],
        'viable_cell_density':data_dict['viableCellDensity'],
        'cell_diameter':data_dict['cellDiameter']})
    number_measurements_for_lot = Measurement.objects.filter(batch=batch).count()
    # if(number_measurements_for_lot > 5):
    #     harvest_day = predict_harvest_day(batch, measurement)
    #     print("Harvest Day: ", harvest_day)
    return Response({'number_measurements': number_measurements_for_lot})

@api_view(['POST'])
def get_measurements(request):
    print('loc12')
    print(len(request.data))
    measurements = None
    if len(request.data) == 0:
        measurements = Measurement.objects.all()
    else:
        batch = Batch.objects.get(id=request.data['lotId'])
        measurements = Measurement.objects.filter(batch=batch)
    serializer = MeasurementSerializer(measurements, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def upload_process_file(request):
    if request.method == 'POST' and request.FILES['file']:
        file = request.FILES['file']
        
        # Create a temporary file path
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            for chunk in file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name

        try:
            # Call your existing function to process the Excel file
            process_file(tmp_file_path)
            return Response({'status': 'success'}, status=200)
        except Exception as e:
            print(e)
            return Response({'status': 'error', 'message': str(e)}, status=500)
        finally:
            # Clean up the temporary file
            os.remove(tmp_file_path)
    else:
        return Response({'status': 'error', 'message': 'No file uploaded'}, status=400)
    
@api_view(['POST'])
def delete_all_batches(request):
    batches = Batch.objects.all()
    batches.delete()
    return Response({'status': 'success'})

@api_view(['POST'])
def sim_growth(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            batch_id = data.get('batchId')
            measurement_id = data.get('measurementId')

            batch = Batch.objects.filter(id=batch_id).first()
            measurement = Measurement.objects.filter(id=measurement_id, batch=batch).first()

            observed = []
            for observed_measurement in Measurement.objects.filter(batch=batch):
                observed.append(MeasurementSerializer(observed_measurement).data)
        
            # Do something with the batch and measurement objects
            # For example, simulate growth based on the measurement

            # Simulate growth
            states_dict, margins = sim_growth_for_batch(batch, measurement)
            unified_list = unify_data(observed, states_dict)

            response_data = {
                'state_predictions': states_dict,
                'state_margins': margins,
                'unified_obs_and_preds': unified_list
                # Add more fields as needed based on your simulation results
            }
            return Response(response_data, status=200)

        except (json.JSONDecodeError, KeyError):
            return Response({'error': 'Invalid request data'}, status=400)

    return Response({'error': 'Invalid request method'}, status=405)

@api_view(['POST'])
def update_batch_status(request):
    lot_id = request.data['lotId']
    new_status = request.data['status']
    batch = get_object_or_404(Batch, id=lot_id)
    batch.status = new_status
    batch.save()

    return Response({'message': 'Batch status updated successfully'})

@api_view(['GET'])
def get_inactive_columns(request):
    inactive_columns = InactiveColumns.objects.all()
    serializer = InactiveColumnsSerializer(inactive_columns, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def update_inactive_columns(request):
    names = request.data['data']
    InactiveColumns.objects.all().delete()
    for name in names:
        InactiveColumns.objects.get_or_create(name=name, defaults={'name': name})
    return Response({'message': 'Success'})

def get_measurement_data_ordered():
    measurements = Measurement.objects.all()
    output = {
        'cell_diameter': [],
        'viable_cell_density': [],
        'total_viable_cells': [],
        'process_time': []
    }
    for measurement in measurements:
        output['cell_diameter'].append(measurement.data['cell_diameter'])
        output['viable_cell_density'].append(measurement.data['viable_cell_density'])
        output['total_viable_cells'].append(measurement.data['total_viable_cells'])
        output['process_time'].append(measurement.data['process_time'])
    return output

print(get_measurement_data_ordered())

