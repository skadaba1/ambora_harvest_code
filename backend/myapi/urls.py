from django.urls import path
from .views import (CreateUserView, LoginView, PredHarvest)

urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('pred-harvest/', PredHarvest.as_view(), name='pred-harvest'),
]
