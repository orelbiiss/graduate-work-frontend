import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.js';

export function ProtectedRoute({ children, allowedRoles, redirectTo }) {
  const { user, loading } = useUser(); // Получаем данные пользователя и состояние загрузки

  useEffect(() => {
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Можно добавить спиннер вместо этого
  }

  if (!user) {
    // Если не авторизован, отправляем на главную
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {

    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/account" replace />;
    }
  }

  // Если админ пытается попасть на страницу пользователя (например, /account), перенаправляем его на /admin
  if (user.role === 'admin' && redirectTo === '/account') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
