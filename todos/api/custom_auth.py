from tastypie.authorization import DjangoAuthorization

class CustomAuthorization(DjangoAuthorization):

    # Optional but useful for advanced limiting, such as per user.
    def apply_limits(self, request, object_list):
        if request and hasattr(request, 'user'):
            return object_list.filter(user__username=request.user.username)

        return object_list.none()
        