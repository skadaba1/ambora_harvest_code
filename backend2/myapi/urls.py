from django.urls import path
from .views import Batches, add_batch, delete_batch, add_measurement, get_measurements

urlpatterns = [
    path('batches/', Batches, name='batches'),
    path('add-batch/', add_batch, name='add-batch'),
    path('delete-batch/', delete_batch, name='delete-batch'),
    path('add-measurement/', add_measurement, name='add-measurement'),
    path('get-measurements/', get_measurements, name='get-measurements'),
]