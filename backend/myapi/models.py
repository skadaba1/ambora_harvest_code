from django.db import models

# Create your models here.
class Batch(models.Model):
    lot_number = models.CharField(max_length=100)
    batch_start_date = models.DateTimeField(null=True, blank=True)
    harvest_date = models.DateTimeField(null=True, blank=True)
    # viable_cell_density = models.FloatField(null=True, blank=True)
    # cell_diameter = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.lot_number
    
class Measurement(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    measurement_date = models.DateTimeField(null=True, blank=True)
    total_viable_cells = models.FloatField(null=True, blank=True)
    viable_cell_density = models.FloatField(null=True, blank=True)
    cell_diameter = models.FloatField(null=True, blank=True)
    process_time = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.batch