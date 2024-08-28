from django.db import models

# Create your models here.
class Batch(models.Model):
    lot_number = models.CharField(max_length=100)
    batch_start_date = models.DateTimeField(null=True, blank=True)
    harvest_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=100, null=True, blank=True, default='Ongoing')
    data = models.JSONField(null=True, blank=True)
    phenotyping_data = models.JSONField(null = True, blank = True)
    qc_data = models.JSONField(null = True, blank = True)

    def __str__(self):
        return self.lot_number

class Measurement(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    lot_number = models.CharField(max_length=100, default='None Provided')
    measurement_date = models.DateTimeField(null=True, blank=True)
    # when the reference object is deleted all related objects in that reference will also be deleted
    data = models.JSONField(null=True, blank=True)
    flagged_columns = models.JSONField(null = True, blank = True)

    def __str__(self):
        return self
    
class InactiveColumns(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
