# coding=utf-8
from django.http import HttpResponseRedirect, HttpResponse
from django.forms import ModelForm
from django.shortcuts import render_to_response, get_object_or_404
from django.template import Context, loader, RequestContext
from django.views.generic import DetailView, ListView
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from todos.models import Todo
from todos.forms import *


@login_required
def index(request):
	user_todos = Todo.objects.filter(user_id=request.user.id)
	return render_to_response('todos/index.html', {'todos': user_todos, 'action':'index'}, context_instance=RequestContext(request))

@login_required
def details(request, todo_id):
	todo = get_object_or_404(Todo, pk=todo_id)
	if todo.user.id == request.user.id:
		return render_to_response('todos/item.html', {'item': todo, 'action':'details'}, context_instance=RequestContext(request))

@login_required
def delete(request, todo_id):
	todo = get_object_or_404(Todo, pk=todo_id)
	if todo.user.id == request.user.id:
		todo.delete()
		return HttpResponseRedirect('/')
	else:		
		message = "You are not authorized for this action"
		return render_to_response('todos/error.html', {'errormessage': message, 'action':'delete'}, context_instance=RequestContext(request))

@login_required
def create(request):
	if request.method == 'POST':
		form = TodoForm(request.POST)
		if form.is_valid():
			cd = form.cleaned_data 
			item = Todo.objects.create(
				title = cd['title'],
				text = cd['text'],
				priority = cd['priority'],
				time_due = cd['time_due'],
				user = request.user
			)
			return HttpResponseRedirect('/details/%s/' % item.id)
		else:
			return render_to_response('todos/create.html', {'form': form, 'action':'create'}, context_instance=RequestContext(request))
	else:
		form = TodoForm()
		return render_to_response('todos/create.html', {'form': form, 'action':'create'}, context_instance=RequestContext(request))	

@login_required
def update(request, todo_id):	
	todo = get_object_or_404(Todo, pk=todo_id)
	if request.method == 'POST':		
		if todo.user.id == request.user.id:
			form = TodoForm(request.POST)
			if form.is_valid():
				cd = form.cleaned_data 
				Todo.objects.filter(pk=todo_id).update(
					title = cd['title'],
					text = cd['text'],
					priority = cd['priority'],
					time_due = cd['time_due']
				)
				return HttpResponseRedirect('/details/%s/' % todo_id)
			else:
				return render_to_response('todos/create.html', {'form': form, 'action':'update', 'num':todo_id}, context_instance=RequestContext(request))
		else:
			message = "You are not authorized for this action"
			return render_to_response('todos/error.html', {'errormessage': message, 'action':'update', 'num':todo_id}, context_instance=RequestContext(request))
		
	else:
		form = TodoForm(todo.__dict__)
		return render_to_response('todos/create.html', {'form': form, 'action':'update', 'num':todo_id}, context_instance=RequestContext(request))	
	
