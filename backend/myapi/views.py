
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
import numpy as np
import json
from collections import defaultdict
import os
import tempfile
from django.shortcuts import get_object_or_404
from .models import Batch, Measurement, InactiveColumns
from .serializers import BatchSerializer, MeasurementSerializer, InactiveColumnsSerializer
from .spa import Sherlock
from .nODE import inference_for_lot
from datetime import datetime, timedelta
from django.utils import timezone
import re


date_format = "%Y-%m-%dT%H:%M"  # For 'datetime-local' input type
desired_format = "%Y-%m-%dT%H:%M"

def convert_datetime_string(date_string):
    try:
        dt = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S%z')
    except ValueError as e:
        try:
            dt = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S')
        except ValueError as e:
            print(f"Error parsing date string: {date_string}, with error: {e}")
            return None
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
        print("Unsupported type. The object must be of type 'numpy.timedelta64' or 'pandas._libs.tslibs.timedeltas.Timedelta'.")
        return None
        # raise TypeError("Unsupported type. The object must be of type 'numpy.timedelta64' or 'pandas._libs.tslibs.timedeltas.Timedelta'.")
    return total_hours

def days_difference(later_time, earlier_time):
	later_time = pd.Timestamp(datetime.strptime(later_time, desired_format))
	earlier_time = pd.Timestamp(datetime.strptime(earlier_time, desired_format))
	return (later_time.date() - earlier_time.date()).days

def process_file(file_path):
    batches = Batch.objects.all()
    batches.delete()
    
    file_path = file_path
    excel_file = pd.ExcelFile(file_path)
    sheet_names = excel_file.sheet_names
    
    all_columns = set()
    for sheet_name in sheet_names:
        if "_Process Data" in sheet_name and "Master" not in sheet_name:
            df = pd.read_excel(file_path, sheet_name, header = 1)
            all_columns.update(df.columns.tolist())
    
    all_columns.remove("TVC (cell/mL)")
    all_columns.remove("Process Day")
    all_columns = list(all_columns)
    all_columns.insert(0, "Process Day")
    for sheet_name in sheet_names:
        if('_Process Data' in sheet_name and "Master" not in sheet_name):
            try:
                print()
                print("SHEET: " + sheet_name)
                df = pd.read_excel(file_path, sheet_name, header = 1)
                # df = process_excel(file_path, sheet_name)
                df.rename(columns = {"TVC (cell/mL)" : "TVC (cells)"}, inplace = True)
                harvested = False
                batch_id = None
                batch_start_date = None
                prev_unit_op_start_time_1 = None
                for index, row in df.iterrows():
                    if pd.notna(row['Unit Op Start Time 1']):
                        unit_op_start_time_1 = convert_datetime_string(str(row["Unit Op Start Time 1"]))
                        print(unit_op_start_time_1)
                        data = {}
                        flagged_columns = set()
                        if row['Process Day'] == 'Harvest': # Check if batch in the sheet has been harvested
                            harvested = True
                        if not batch_start_date and unit_op_start_time_1:
                            batch_start_date = unit_op_start_time_1
                        for column in all_columns:
                            if column in df.columns.tolist() and not pd.isnull(row[column]):
                                if column == "Unit Op Start Time 1":
                                    if not unit_op_start_time_1:
                                        flagged_columns.add(column)
                                    else:
                                        if str(row["Process Day"]) != "Harvest" and (days_difference(unit_op_start_time_1, batch_start_date) + 1) != row["Process Day"]:
                                            flagged_columns.add(column)
                                            flagged_columns.add("Process Day")
                                        if prev_unit_op_start_time_1:
                                            days_since_previous = days_difference(unit_op_start_time_1, prev_unit_op_start_time_1)
                                            if days_since_previous >= 10 or days_since_previous < 0:
                                                flagged_columns.add(column)
                                    data[column] = unit_op_start_time_1
                                elif column == "Process Time from Day 1 (hours)" or isinstance(row[column],  np.timedelta64) or isinstance(row[column], pd.Timedelta):
                                    data[column] = interpret_datetime(row[column])
                                    if not data[column]:
                                        flagged_columns.add(column)
                                elif isinstance(row[column], pd.Timestamp):
                                    data[column] = convert_datetime_string(str(row[column]))
                                    if not data[column]:
                                        flagged_columns.add(column) 
                                elif not (isinstance(row[column], str) or isinstance(row[column], int) or isinstance(row[column], float)):
                                    data[column] = None
                                    flagged_columns.add(column)
                                else:
                                    data[column] = row[column]
                            else:
                                data[column] = None			
                        if unit_op_start_time_1:
                            prev_unit_op_start_time_1 = unit_op_start_time_1
                        phenotyping_data = None
                        if data["Unit Ops"] == "CliniMACS":
                            phenotyping_data = {}
                            for column in ["CD3%", "CD8%", "CD4%", "CM %", "Naive %", "Effector %", "EM %", "CD14%", "CD19%", "CD20%", "CD56%"]:
                                phenotyping_data[column] = data[column]
                        flagged_columns = {"flagged columns" : list(flagged_columns)}
                        add_measurement_output = add_measurement_direct(data, phenotyping_data, batch_start_date, flagged_columns)
			# add_measurement_output = add_measurement_direct(
                            # convert_datetime_string(str(row['Unit Op Start Time 1'])), 
                            # row['Lot Number'], 
                            # row['TVC (cells)'], 
                            # row['Avg Viability (%)'], 
                            # row['Avg Cell Diameter (um)'], 
                            # batch_start_date, 
                            # interpret_datetime(row['Process Time from Day 1 (hours)']))
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

def add_measurement_direct(data, phenotyping_data, batch_start_date, flagged_columns):
    # print(process_time)
    batch, created = Batch.objects.get_or_create(lot_number = data["Lot Number"], defaults={'batch_start_date': batch_start_date})
    if phenotyping_data:
        batch.phenotyping_data = phenotyping_data
        batch.save()
    measurement = Measurement.objects.create(
        batch=batch,
        lot_number=data["Lot Number"],
        measurement_date=data["Unit Op Start Time 1"],
        data=data,
        flagged_columns = flagged_columns 
    )
    measurement.save()
    number_measurements_for_lot = Measurement.objects.filter(batch=batch).count()
    
    latest_measurement = Measurement.objects.filter(id=measurement.id, batch=batch).first()
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

def get_measurement_data_ordered():
    measurements = Measurement.objects.all()
    output = {
        'cell_diameter': [],
        'avg_viability': [],
        'total_viable_cells': [],
        'process_time': []
    }
    for measurement in measurements:
        if measurement.data["Avg Cell Diameter (um)"] and measurement.data["Avg Viability (%)"] and measurement.data["TVC (cells)"] and measurement.data["Process Time from Day 1 (hours)"]:
            output['cell_diameter'].append(measurement.data['Avg Cell Diameter (um)'])
            output['avg_viability'].append(measurement.data['Avg Viability (%)'])
            output['total_viable_cells'].append(measurement.data['TVC (cells)'])
            output['process_time'].append(measurement.data['Process Time from Day 1 (hours)'])
    return output

	
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
    number_measurements_for_lot = Measurement.objects.filter(batch=batch).count()

    return Response({'number_measurements': number_measurements_for_lot})

@api_view(['POST'])
def get_measurements(request):
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

            response_data = {
                "PLACEHOLDER":None
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

@api_view(['GET'])
def get_measurement_data(request):
    output = get_measurement_data_ordered()
    return Response(output)

@api_view(["GET"])
def get_phenotyping_data_for_batch(request):
    batch = Batch.objects.filter(lot_number = request.data["lot_number"]).first()
    if batch:
        return Response(batch.phenotyping_data)
    return Response({"Error" : "There is no batch with the provided lot number"})

@api_view(['POST'])
def fit_spa_model(request):
    data = get_measurement_data_ordered()
    y = np.array(data.pop(request.data['responseFeature']))
    feature_names = list(data.keys())
    x = np.array(list(data.values())).T  # Convert to numpy array and transpose
    DI = Sherlock()
    output = DI.log(x, y, feature_names)
    return Response({'data': output})

# inference_for_lot('31424025')