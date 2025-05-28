import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../api/auth';  // Импортируем ваш API
import { loginAndLoadProfile } from '../utils/authUtils.js';
import { useUser } from '../contexts/UserContext';

const VerifyEmail = () => {
  const { token } = useParams();  // Получаем токен из URL
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Функция для верификации email
    const verifyEmail = async () => {
      try {
        // Отправляем запрос на верификацию email с токеном
        const response = await authApi.verifyEmail(token);
        
        if (response.status === 200) {
          setStatus('success');
          
          // После успешной верификации авторизуем пользователя
          const { email, password } = response.data; // Предположим, что сервер возвращает данные для входа
          await loginAndLoadProfile(email, password, setUser, navigate);  // Авторизация пользователя
        }
      } catch (error) {
        setStatus('error');
        setError(error.response?.data?.detail || 'Ошибка при верификации');
      }
    };

    verifyEmail();
  }, [token, navigate, setUser]);

  if (status === 'loading') {
    return <div>Подтверждение email...</div>;
  }

  if (status === 'error') {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div>
      <h2>Email успешно подтвержден!</h2>
      <p>Вы будете перенаправлены на вашу страницу аккаунта.</p>
    </div>
  );
};

export default VerifyEmail;
