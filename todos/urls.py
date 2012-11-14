# coding=utf-8
from django.conf.urls import patterns, include, url
from tastypie.api import Api
from todos.api.resources import TodoResource, UserResource


api = Api(api_name="v1")
api.register(UserResource())
api.register(TodoResource())

urlpatterns = patterns('todos.views',
    url(r'^$', 'ajax', name='ajax'),
    url(r'^intro$', 'intro', name='intro'),
    url(r'^index$', 'index', name='home'),
	url(r'^create/$', 'create'),
	url(r'^details/(?P<todo_id>\d+)/$', 'details', name="Todo Details"),
	url(r'^update/(?P<todo_id>\d+)/$', 'update'),
	url(r'^delete/(?P<todo_id>\d+)/$', 'delete'),

)

urlpatterns += patterns('',
	(r'^rest/', include(api.urls))
)