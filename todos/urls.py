from django.conf.urls import patterns, include, url
from todos.api.resources import TodoResource

todo_resource = TodoResource()

urlpatterns = patterns('todos.views',
    url(r'^$', 'index', name='home'),
	url(r'^create/$', 'create'),
	url(r'^details/(?P<todo_id>\d+)/$', 'details', name="Todo Details"),
	url(r'^update/(?P<todo_id>\d+)/$', 'update'),
	url(r'^delete/(?P<todo_id>\d+)/$', 'delete'),

)

urlpatterns += patterns('',
	(r'^rest/', include(todo_resource.urls))
)