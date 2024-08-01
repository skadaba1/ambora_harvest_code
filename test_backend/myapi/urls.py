from django.urls import path
from .views import (CreateUserView, LoginView, PredHarvest, Batches)

urlpatterns = [
    # path('upload/<int:is_grantapp>/', FileUploadView.as_view(), name='file-upload'),
    # path('delete/<int:pk>/', FileDeleteView.as_view(), name='file-delete'),
    # path('edit/<int:pk>/', FileEditView.as_view(), name='file-edit'),
    # path('files/', FileListView.as_view(), name='file-list'),
    # path('send-message/', LlmModelView.as_view(), name = "send-message"),
    # path('chat-history/', ChatHistoryView.as_view(), name = "chat-history"),
    # path('chat-sessions/', ChatSessionView.as_view(), name = "chat-sessions"),
    # path('create-chat-session/', ChatSessionCreateView.as_view(), name = "create-chat-session"),
    # path('delete-chat-session/<int:pk>/', ChatSessionDeleteView.as_view(), name = "delete-chat-session"),
    # path('rename-chat-session/<int:pk>/', ChatSessionRenameView.as_view(), name = "rename-chat-session"),
    # path('upload-url/', UrlUploadView.as_view(), name='upload-url'),
    # path('register/', CreateUserView.as_view(), name='register'),
    # path('login/', LoginView.as_view(), name='login'),
    # path('join-waitlist/', JoinWaitlist.as_view(), name='join-waitlist'),
    # path('editor-backup/<int:pk>/', ChatSessionUpdateEditorView.as_view(), name='editor-backup'),
    # path('fetch-backup/<int:pk>/', ChatSessionFetchEditorView.as_view(), name='fetch-backup'),
    # path('data-extraction/', DataExtractionView.as_view(), name='data-extraction'),
    path('register/', CreateUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('pred-harvest/', PredHarvest.as_view(), name='pred-harvest'),
    path('batches/', Batches.as_view(), name='batches'),
]
