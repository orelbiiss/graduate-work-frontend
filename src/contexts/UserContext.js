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


  // Проверка токена при загрузке приложения
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
            setUser(savedUser);
          } else {
            throw new Error('Токен невалиден');
          }
        } catch (verifyError) {
          console.warn('Срок действия токена доступа истек', verifyError);

          try {
            // 4. Пытаемся обновить токен
            await authApi.refreshToken();

            // 5. После обновления токена снова проверяем пользователя
            const { role } = await authApi.checkAuth();

            // 6. Если роль есть → токен валидный, оставляем данные как есть
            if (role) {
              setUser(savedUser);
            } else {

              // Токен невалидный → удаляем всё
              removeUserFromLocalStorage();
              setUser(null);
            }
          } catch (refreshError) {
            console.error('Не удалось обновить токен:', refreshError);
            removeUserFromLocalStorage();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Непредвиденная ошибка:', error);
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
