from django.db import models

# Create your models here.
class Batch(models.Model):
    lot_number = models.CharField(max_length=100)
    batch_start_date = models.DateTimeField(null=True, blank=True)
    harvest_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=100, null=True, blank=True, default='Ongoing')

    def __str__(self):
        return self.lot_number

class Phenotyping(models.Model):
    unit_ops = models.CharField(max_length = 100)
    cd3 = models.FloatField(null = True, blank = True)
    cd8 = models.FloatField(null = True, blank = True)
    cd4 = models.FloatField(null = True, blank = True)
    cm = models.FloatField(null = True, blank = True)
    naive = models.FloatField(null = True, blank = True)
    effector = models.FloatField(null = True, blank = True)
    em = models.FloatField(null = True, blank = True)
    cd14 = models.FloatField(null = True, blank = True)
    cd19 = models.FloatField(null = True, blank = True)
    cd20 = models.FloatField(null = True, blank = True)
    cd56 = models.FloatField(null = True, blank = True)
    
class Measurement(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    measurement_date = models.DateTimeField(null=True, blank=True)
    # total_viable_cells = models.FloatField(null=True, blank=True)
    # viable_cell_density = models.FloatField(null=True, blank=True)
    # cell_diameter = models.FloatField(null=True, blank=True)
    # process_time = models.FloatField(null=True, blank=True)
    phenotyping = models.ForeignKey(Phenotyping, null = True, blank = True, on_delete = models.CASCADE)
    data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self
