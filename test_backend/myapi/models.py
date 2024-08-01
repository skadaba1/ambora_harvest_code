from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files', default=-1)
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    file_organization = models.CharField(max_length=255, default='reference')
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename
    
# Model to store chat sessions
class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions', default=-1)
    name = models.CharField(max_length=255, default="New Chat", blank=True)
    last_updated = models.DateTimeField(auto_now_add=True)
    editor_backup = models.TextField(default="", blank=True, null=True)

    def __str__(self):
        return self.name
    
# Model to store chat history
class ChatHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='your_models', default=-1)
    user_role = models.CharField(max_length=255, default='user')
    message = models.TextField()
    documents = models.JSONField(default = list)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='chats')

    def __str__(self):
        return self.user_role
