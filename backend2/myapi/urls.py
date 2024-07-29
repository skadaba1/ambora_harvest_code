from django.urls import path
from .views import Batches, add_batch

urlpatterns = [
    path('batches/', Batches, name='batches'),
    path('add-batch/', add_batch, name='add-batch'),
]