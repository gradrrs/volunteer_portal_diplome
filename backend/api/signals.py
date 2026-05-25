from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Like, Application, Rating, Notification, Transaction, Event
from .models import APPLICATION_STATUS
from django.utils import timezone

@receiver(post_save, sender=Like)
def add_points_for_like(sender, instance, created, **kwargs):
    if created:
        rating, _ = Rating.objects.get_or_create(user=instance.user)
        rating.score += 1
        rating.save()
        Transaction.objects.create(user=instance.user, amount=1, reason='Лайк')
        Notification.objects.create(
            user=instance.post.author,
            message=f"{instance.user.username} поставил лайк вашему посту «{instance.post.title}»"
        )

@receiver(post_save, sender=Application)
def handle_application_status(sender, instance, created, **kwargs):
    if not created:
        status_text = dict(APPLICATION_STATUS).get(instance.status, instance.status)
        Notification.objects.create(
            user=instance.user,
            message=f"Статус вашей заявки на мероприятие «{instance.event.title}» изменён на: {status_text}"
        )
        if instance.status == APPLICATION_STATUS[3][0]:
            rating, _ = Rating.objects.get_or_create(user=instance.user)
            rating.score += 10
            rating.save()
            Transaction.objects.create(user=instance.user, amount=10, reason='Участие в мероприятии')

@receiver(post_save, sender=Event)
def delete_applications_for_past_events(sender, instance, **kwargs):
    if instance.date < timezone.now():
        deleted_count, _ = Application.objects.filter(event=instance).delete()
        if deleted_count:
            print(f"Удалено {deleted_count} заявок на прошедшее мероприятие: {instance.title}")