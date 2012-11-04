from django import forms
from todos.models import Todo
from django.forms.fields import DateTimeField, TypedChoiceField, MultipleChoiceField
from django.forms.widgets import SplitDateTimeWidget, DateTimeInput
from django.forms.extras.widgets import SelectDateWidget

PRIORITIES = (('', 'set priority:'),(0, 'low'),(1, 'medium'),(2, 'high'))

class TodoForm(forms.Form):
	time_formats = (
		'%d/%m/%Y %H:%M',
		'%d/%m/%Y',
		'%Y-%m-%d %H:%M:%S',     # '2006-10-25 14:30:59'
		'%Y-%m-%d %H:%M',        # '2006-10-25 14:30'
		'%Y-%m-%d',              # '2006-10-25'
		'%m/%d/%Y %H:%M:%S',     # '10/25/2006 14:30:59'
		'%m/%d/%Y %H:%M',        # '10/25/2006 14:30'
		'%m/%d/%Y',              # '10/25/2006'
		'%m/%d/%y %H:%M:%S',     # '10/25/06 14:30:59'
		'%m/%d/%y %H:%M',        # '10/25/06 14:30'
		'%m/%d/%y'
	)
	title = forms.CharField(widget=forms.TextInput(attrs={}), max_length=100)
	text = forms.CharField(widget=forms.Textarea(attrs={'rows':'4'}), max_length=200)
	time_due = forms.DateTimeField(widget=DateTimeInput(attrs={}, format="%d/%m/%Y"), input_formats = time_formats)		
	priority = forms.TypedChoiceField(choices = PRIORITIES, coerce = int)

	