import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromLocalStorage, removeUserFromLocalStorage } from '../utils/localStorageUtils';
import { authApi } from '../api/auth';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext); // Хук для использования контекста
};

export const UserProvider = ({ children }) => {
  
  const [user, setUser] = useState(null); // Состояние для хранения данных о пользователе
  const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки данных

  useEffect(() => {

    // 1. Достаём сохранённого пользователя (если есть)
    const checkTokenValidity = async () => {
      try {
        const savedUser = getUserFromLocalStorage();
        if (!savedUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {

          // 2. Пытаемся проверить текущий access-токен
          const { role } = await authApi.checkAuth();

          // 3. Если роль есть → токен валидный, оставляем данные как есть
          if (role) {
            setUser(savedUser); // Просто берём данные из localStorage
          } else {
            throw new Error('Token invalid');
          }
        } catch (verifyError) {
          console.warn('Access token expired, trying to refresh...', verifyError);

          try {
            // 4. Пытаемся обновить токен
            await authApi.refreshToken();

            // 5. После обновления токена снова проверяем пользователя
            const { role } = await authApi.checkAuth();

            // 6. После обновления токена снова проверяем пользователя
            if (role) {
              setUser(savedUser); // Просто берём данные из localStorage
            } else {
              removeUserFromLocalStorage();
              setUser(null);
            }
          } catch (refreshError) {
            // Токен невалидный → удаляем всё
            console.error('Token refresh failed:', refreshError);
            removeUserFromLocalStorage();
            setUser(null);
          }
        }
      } catch (error) {
        // Ошибка сети или сервера → считаем токен невалидным
        console.error('Unexpected error:', error);
        removeUserFromLocalStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkTokenValidity();
  }, []);


  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
