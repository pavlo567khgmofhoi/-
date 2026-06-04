from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Кастомний дозвіл: 
    - Переглядати дані можуть лише автентифіковані користувачі.
    - Змінювати/видаляти/створювати — тільки адміністратори.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return request.user.is_staff or request.user.is_superuser