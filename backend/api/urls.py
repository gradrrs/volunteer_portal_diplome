from django.urls import path
from .views import (
    EventListCreateView, EventDetailView,
    ApplicationListCreateView, ApplicationDetailView,
    PostListCreateView, PostDetailView,
    CommentListCreateView, LikeCreateView,
    NotificationListView
)

urlpatterns = [
    path('events/', EventListCreateView.as_view(), name='event-list'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('applications/', ApplicationListCreateView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('posts/', PostListCreateView.as_view(), name='post-list'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:post_pk>/comments/', CommentListCreateView.as_view(), name='comment-list'),
    path('likes/', LikeCreateView.as_view(), name='like-create'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
]