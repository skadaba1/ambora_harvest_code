# myapi/serializers.py
from rest_framework import serializers
from .models import Batch, Measurement, InactiveColumns

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = '__all__'

class InactiveColumnsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InactiveColumns
        fields = '__all__'
