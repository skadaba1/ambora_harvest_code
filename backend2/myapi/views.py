from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
from .models import Batch, Measurement
from .serializers import BatchSerializer, MeasurementSerializer

batches = [
  {
    'lotNumber': 1,
    'cellCount': 15,
    'predHarvest': '8/2/2024'
  },
  {
    'lotNumber': 2,
    'cellCount': 15,
    'predHarvest': '8/3/2024'
  },
]

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
    return Response('Success')

@api_view(['POST'])
def get_measurements(request):
    measurements = Measurement.objects.all()
    serializer = MeasurementSerializer(measurements, many=True)
    return Response(serializer.data)