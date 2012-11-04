from tastypie.resources import ModelResource
from todos.models import Todo


class TodoResource(ModelResource):
    class Meta:
        queryset = Todo.objects.all()
        allowed_methods = ['get']
	resource_name = 'todo'
