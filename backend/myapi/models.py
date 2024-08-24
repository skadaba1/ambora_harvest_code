from django.db import models

# Create your models here.
class Batch(models.Model):
    lot_number = models.CharField(max_length=100)
    batch_start_date = models.DateTimeField(null=True, blank=True)
    harvest_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=100, null=True, blank=True, default='Ongoing')

    def __str__(self):
        return self.lot_number

class Measurement(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    measurement_date = models.DateTimeField(null=True, blank=True)
    # when the reference object is deleted all related objects in that reference will also be deleted
    data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self
