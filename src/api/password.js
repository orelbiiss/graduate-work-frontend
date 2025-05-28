import { apiRequest } from './base';

export const passwordApi = {
    /**
     * Запрос на сброс пароля
     * @param email - Email пользователя для сброса пароля
     */
    initiatePasswordReset: (email) =>
        apiRequest('/password-reset/initiate', 'POST', { email }),

    /**
     * Подтверждение сброса пароля
     * @param token - Токен из письма
     * @param newPassword - Новый пароль
     */
    confirmPasswordReset: (token, newPassword) =>
        apiRequest(`/password-reset/confirm/${token}`, 'POST', {
            new_password: newPassword 
        }),

    /**
     * Смена пароля авторизованным пользователем
     * @param oldPassword - Текущий пароль
     * @param newPassword - Новый пароль
     */
    changePassword: (oldPassword, newPassword) =>
        apiRequest('/user/change-password', 'POST', {
            old_password: oldPassword,
            new_password: newPassword
        })
};