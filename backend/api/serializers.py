from rest_framework import serializers
from .models import User, Event, Application, Post, Like, Rating, Notification, Transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'avatar', 'date_joined', 'is_staff']
        read_only_fields = ['id', 'email', 'date_joined', 'is_staff']

class EventSerializer(serializers.ModelSerializer):
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 'required_volunteers', 'is_full']

    def get_is_full(self, obj):
        approved_count = obj.applications.filter(status='approved').count()
        return approved_count >= obj.required_volunteers

class ApplicationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    event_title = serializers.ReadOnlyField(source='event.title')
    
    class Meta:
        model = Application
        fields = ['id', 'user', 'event', 'event_title', 'status', 'created_at', 'updated_at']
        read_only_fields = ['user', 'event', 'created_at', 'updated_at']  # status доступен для записи

class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'title', 'content', 'created_at', 'updated_at', 'likes_count', 'comments_count', 'user_has_liked']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return 0

    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'post', 'user']
        read_only_fields = ['user']

class RatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = Rating
        fields = ['user', 'score']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'reason', 'created_at']