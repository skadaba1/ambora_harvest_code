from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

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
    return Response(batches)

@api_view(['POST'])
def add_batch(request):
    print('ran')
    return Response(batches)