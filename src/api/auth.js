import { apiRequest } from './base';

export const authApi = {
  // Регистрация
  signUp: (userData) => apiRequest('/auth/signup', 'POST', {
    first_name: userData.first_name,
    last_name: userData.last_name,
    middle_name: userData.middle_name,
    gender: userData.gender || 'unspecified',
    birth_date: userData.birth_date,
    email: userData.email,
    phone: userData.phone ? `+${userData.phone.replace(/\D/g, '')}` : null,
    password: userData.password,
  }),

  // Вход
  signIn: (email, password) => apiRequest('/auth/signin', 'POST', { email, password }),


  // Проверка токена
  checkAuth: () => apiRequest('/auth/verify', 'GET'),

  // Выход
  signOut: () => apiRequest('/auth/signout', 'POST'),

   // Получение профиля текущего пользователя
   getProfile: () => apiRequest('/user/profile', 'GET'),

  // --- Верификация Email ---

  // Отправка письма с верификацией
  sendVerificationEmail: (email) => apiRequest('/auth/send-verification', 'POST', { email }),

  // Подтверждение email по токену
  verifyEmail: (token) => apiRequest('/auth/verify-email', 'POST', { 
    token: token 
  }),

  // Обновление токена
  refreshToken: () => apiRequest('/auth/refresh', 'POST', null, null, true),

  // Проверка, верифицирован ли email
  checkEmailVerification: (email) => apiRequest('/auth/check-verification', 'GET', null, { email }),
};