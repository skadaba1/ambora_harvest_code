from django.urls import path
from .views import Batches, add_batch, delete_batch, add_measurement, get_measurements, upload_process_file, delete_all_batches, sim_growth, update_batch_status, update_inactive_columns, get_inactive_columns

urlpatterns = [
    path('batches/', Batches, name='batches'),
    path('add-batch/', add_batch, name='add-batch'),
    path('delete-batch/', delete_batch, name='delete-batch'),
    path('add-measurement/', add_measurement, name='add-measurement'),
    path('get-measurements/', get_measurements, name='get-measurements'),
    path('upload-process-file/', upload_process_file, name='upload-process-file'),
    path('delete-all-batches/', delete_all_batches, name='delete-all-batches'),
    path('sim-growth/', sim_growth, name='sim-growth'),
    path('update-batch-status/', update_batch_status, name='harvest-batch'),
    path('update-inactive-columns/', update_inactive_columns, name='update-inactive-columns'),
    path('get-inactive-columns/', get_inactive_columns, name='get-inactive-columns'),
]