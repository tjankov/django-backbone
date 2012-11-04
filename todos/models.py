from django.db import models
from django.contrib.auth.models import User
from datetime import datetime
from django.utils import timezone


class Todo(models.Model):
	PRIORITIES = ((0, 'low'),(1, 'medium'),(2, 'high'))
	user = models.ForeignKey(User, related_name = 'todos', on_delete = 'CASCADE')
	title = models.CharField(max_length=100)
	text = models.TextField(max_length=500)
	priority = models.IntegerField(choices = PRIORITIES)
	time_created = models.DateTimeField('time created', auto_now_add=True)
	time_due = models.DateTimeField('time due')
	def __unicode__(self):
		return self.title + ' (' + str(self.id) + ')'
	def status(self):
		now = timezone.now()
		if ((now.year == self.time_due.year) and (now.month == self.time_due.month) and (now.day == self.time_due.day)):
			return "flaming"
		elif now > self.time_due:
			return "inactive"
		elif now < self.time_due:
			return "active"		
	


