# coding=utf-8
from django.contrib.auth.models import User
from tastypie.authentication import SessionAuthentication, Authentication
from tastypie.authorization import DjangoAuthorization, Authorization
from tastypie import fields
from tastypie.resources import ModelResource
from todos.models import Todo, Test
from todos.api.custom_auth import CustomAuthorization

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        fields = ['username', 'email']
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()
        
        
class TodoResource(ModelResource):
	user = fields.ForeignKey(UserResource, 'user')
	class Meta:
		queryset = Todo.objects.all()
		resource_name = 'todo'
		authentication = SessionAuthentication()
		authorization = CustomAuthorization()
		