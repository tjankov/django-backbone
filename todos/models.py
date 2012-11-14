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
	date_due = models.DateTimeField('date due')
	def __unicode__(self):
		return self.title + ' (' + str(self.id) + ')'
	def status(self):
		now = timezone.now()
		compare = self.date_due
		compare = compare.replace(day = compare.day + 1)
		if ((now.year == compare.year) and (now.month == compare.month) and (now.day == compare.day)):
			return "due"
		elif now > compare:
			return "inactive"
		elif now < compare:
			return "active"		
	

class Test(models.Model):
	user = models.ForeignKey(User, related_name = 'tests', on_delete = 'CASCADE')
	text = models.CharField(max_length=100)
	def __unicode__(self):
		return self.text
