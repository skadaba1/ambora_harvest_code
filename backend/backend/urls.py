from django.contrib import admin
from django.urls import path, include # 👈 Add include here

urlpatterns = [
    path('admin/', admin.site.urls),
    # 👇 add your myapi app urls path here
    path('api/', include('myapi.urls'))
]