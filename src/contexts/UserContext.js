import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromLocalStorage, removeUserFromLocalStorage, saveUserToLocalStorage } from '../utils/localStorageUtils';
import { authApi } from '../api/auth';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext); // Хук для использования контекста
};

export const UserProvider = ({ children }) => {
  
  const [user, setUser] = useState(null); // Состояние для хранения данных о пользователе
  const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки данных

  // Функция для обновления пользователя
  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (newUserData) {
      saveUserToLocalStorage(newUserData);
    } else {
      removeUserFromLocalStorage();
    }
  };

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
          console.log(role)

          // 3. Если роль есть → токен валидный, оставляем данные как есть
          if (role) {
            setUser(savedUser); // Просто берём данные из localStorage
          } else {
            throw new Error('Token invalid');
          }

        } catch (verifyError) {

          if (verifyError.response?.status === 401) {
            try {
              await authApi.refreshToken();
              
              // 4. Повторная проверка после обновления токена
              const { role } = await authApi.checkAuth();
              console.log(role)

              // 5. Если роль есть → токен валидный, оставляем данные как есть
              if (role) {
                setUser(savedUser); // Просто берём данные из localStorage
              } else {
                throw new Error('Token invalid');
              }
            } catch (refreshError) {
              console.error('Refresh token failed:', refreshError);
              updateUser(null);
            }
          } else {
            console.error('Auth check failed:', verifyError);
            updateUser(null);
          }
        }
      } catch (error) {
            console.error('Authentication check failed:', error);
            updateUser(null);
          } finally {
            setLoading(false);
      }
    };

    checkTokenValidity();
  }, []);


  return (
    <UserContext.Provider value={{ user, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
