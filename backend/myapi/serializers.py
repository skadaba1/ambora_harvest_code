# myapi/serializers.py
from rest_framework import serializers
from .models import Batch, Measurement, Phenotyping

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class PhenotypingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phenotyping
        fields = "__all__"

class MeasurementSerializer(serializers.ModelSerializer):
    phenotyping = PhenotypingSerializer() 

    class Meta:
        model = Measurement
        fields = '__all__'
