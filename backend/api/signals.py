from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Comment, Like, Application, Rating, Notification, User
from .models import APPLICATION_STATUS

@receiver(post_save, sender=Comment)
def add_points_for_comment(sender, instance, created, **kwargs):
    if created:
        rating, _ = Rating.objects.get_or_create(user=instance.author)
        rating.score += 5
        rating.save()
        Notification.objects.create(
            user=instance.post.author,
            message=f"{instance.author.username} оставил комментарий к вашему посту «{instance.post.title}»"
        )

@receiver(post_save, sender=Like)
def add_points_for_like(sender, instance, created, **kwargs):
    if created:
        rating, _ = Rating.objects.get_or_create(user=instance.user)
        rating.score += 1
        rating.save()
        Notification.objects.create(
            user=instance.post.author,
            message=f"{instance.user.username} поставил лайк вашему посту «{instance.post.title}»"
        )

@receiver(post_save, sender=Application)
def handle_application_status(sender, instance, created, **kwargs):
    if not created and instance.status == APPLICATION_STATUS[3][0]:
        rating, _ = Rating.objects.get_or_create(user=instance.user)
        rating.score += 10
        rating.save()
        Notification.objects.create(
            user=instance.user,
            message=f"Ваше участие в мероприятии «{instance.event.title}» подтверждено! Вы получили 10 баллов."
        )