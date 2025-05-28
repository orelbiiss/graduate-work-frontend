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
    const checkTokenValidity = async () => {
      try {
        // 1. Достаём сохранённого пользователя (если есть)
        const savedUser = getUserFromLocalStorage();
        if (!savedUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // 2. Проверяем токен (ждём ответа от /auth/verify)
        const { role } = await authApi.checkAuth(); // Важно: endpoint возвращает { role }

        // 3. Если роль есть → токен валидный, оставляем данные как есть
        if (role) {
          setUser(savedUser); // Просто берём данные из localStorage
        } else {
          // Токен невалидный → удаляем всё
          removeUserFromLocalStorage();
          setUser(null);
        }
      } catch (error) {
        // Ошибка сети или сервера → считаем токен невалидным
        console.error('Token check failed:', error);
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
