from rest_framework import serializers
from .models import User, Event, Application, Post, Comment, Like, Rating, Notification, Transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'date_joined']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    event_title = serializers.ReadOnlyField(source='event.title')
    
    class Meta:
        model = Application
        fields = ['id', 'user', 'event', 'event_title', 'status', 'created_at', 'updated_at']
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']

class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id', 'author', 'title', 'content', 'created_at', 'updated_at', 'likes_count', 'comments_count']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'text', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'post', 'user']

class RatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = Rating
        fields = ['user', 'score']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'date_joined', 'is_staff']
        read_only_fields = ['id', 'email', 'date_joined', 'is_staff']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'avatar', 'date_joined', 'is_staff']
        read_only_fields = ['id', 'email', 'date_joined', 'is_staff']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'reason', 'created_at']