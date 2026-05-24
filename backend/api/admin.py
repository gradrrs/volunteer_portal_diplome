from django.contrib import admin
from .models import User, Event, Application, Post, Like, Rating, Notification

admin.site.register(User)
admin.site.register(Event)
admin.site.register(Application)
admin.site.register(Post)
admin.site.register(Like)
admin.site.register(Rating)
admin.site.register(Notification)